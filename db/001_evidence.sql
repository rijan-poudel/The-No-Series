BEGIN;

CREATE SCHEMA money_editorial;
CREATE SCHEMA money_public;

CREATE TABLE money_editorial.actor (
  id text PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('reviewer', 'publisher', 'operator')),
  enabled boolean NOT NULL DEFAULT true
);

CREATE TABLE money_editorial.source (
  id text PRIMARY KEY,
  canonical_url text NOT NULL CHECK (canonical_url LIKE 'https://%'),
  publisher text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('identity', 'rate', 'terms', 'tariff', 'tax')),
  access_approved boolean NOT NULL DEFAULT false,
  archive_approved boolean NOT NULL DEFAULT false,
  interval_seconds integer NOT NULL CHECK (interval_seconds >= 3600),
  next_check timestamptz,
  lease_expires timestamptz,
  lease_owner text,
  CHECK ((lease_expires IS NULL) = (lease_owner IS NULL))
);

CREATE TABLE money_editorial.observation (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_id text NOT NULL REFERENCES money_editorial.source,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  sha256 text CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  semantic_sha256 text CHECK (semantic_sha256 ~ '^[0-9a-f]{64}$'),
  final_url text CHECK (final_url LIKE 'https://%'),
  mime text,
  etag text,
  parser_version text,
  outcome text NOT NULL CHECK (outcome IN ('unchanged', 'changed', 'failed')),
  UNIQUE (source_id, fetched_at)
);

CREATE TABLE money_editorial.candidate (
  id text PRIMARY KEY,
  observation_id bigint NOT NULL REFERENCES money_editorial.observation,
  subject_key text NOT NULL,
  previous jsonb,
  proposed jsonb,
  locator text NOT NULL CHECK (length(locator) > 0),
  source_excerpt text NOT NULL CHECK (length(source_excerpt) > 0),
  original_date text,
  effective_on date NOT NULL,
  UNIQUE (observation_id, subject_key)
);

CREATE TABLE money_editorial.decision (
  candidate_id text NOT NULL REFERENCES money_editorial.candidate,
  actor_id text NOT NULL REFERENCES money_editorial.actor,
  disposition text NOT NULL CHECK (disposition IN ('approve', 'reject', 'clarify')),
  explanation text NOT NULL CHECK (length(explanation) > 0),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (candidate_id, actor_id)
);

CREATE TABLE money_public.release (
  id text PRIMARY KEY,
  methodology text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('public', 'sandbox')),
  fingerprint text NOT NULL CHECK (fingerprint ~ '^[0-9a-f]{64}$'),
  manifest jsonb NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(manifest) = 'object'),
  CHECK (manifest ? 'kind' AND manifest->>'kind' = CASE environment WHEN 'public' THEN 'public' ELSE 'demo' END),
  UNIQUE (environment, id)
);

CREATE TABLE money_public.revocation (
  release_id text PRIMARY KEY REFERENCES money_public.release,
  published_at timestamptz NOT NULL DEFAULT now(),
  public_reason text NOT NULL CHECK (length(public_reason) > 0)
);

CREATE TABLE money_public.current_release (
  environment text PRIMARY KEY CHECK (environment IN ('public', 'sandbox')),
  release_id text NOT NULL,
  FOREIGN KEY (environment, release_id) REFERENCES money_public.release (environment, id)
);

CREATE TABLE money_editorial.release_candidate (
  release_id text NOT NULL REFERENCES money_public.release,
  candidate_id text NOT NULL REFERENCES money_editorial.candidate,
  PRIMARY KEY (release_id, candidate_id)
);

CREATE TABLE money_editorial.outbox (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  operation text NOT NULL CHECK (operation IN ('publish', 'revoke')),
  release_id text NOT NULL REFERENCES money_public.release,
  actor_id text NOT NULL REFERENCES money_editorial.actor,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  UNIQUE (operation, release_id)
);

CREATE VIEW money_public.active_manifest AS
SELECT releases.id, releases.methodology, releases.fingerprint,
  revoke.release_id IS NOT NULL AS revoked,
  CASE WHEN revoke.release_id IS NULL THEN releases.manifest ELSE NULL END AS manifest
FROM money_public.current_release AS pointer
JOIN money_public.release AS releases
  ON releases.id = pointer.release_id AND releases.environment = pointer.environment
LEFT JOIN money_public.revocation AS revoke ON revoke.release_id = releases.id
WHERE pointer.environment = 'public';

CREATE FUNCTION money_public.reject_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END;
$$;

CREATE TRIGGER immutable_release BEFORE UPDATE OR DELETE ON money_public.release
FOR EACH ROW EXECUTE FUNCTION money_public.reject_update();
CREATE TRIGGER immutable_revocation BEFORE UPDATE OR DELETE ON money_public.revocation
FOR EACH ROW EXECUTE FUNCTION money_public.reject_update();
CREATE TRIGGER immutable_candidate BEFORE UPDATE OR DELETE ON money_editorial.candidate
FOR EACH ROW EXECUTE FUNCTION money_public.reject_update();
CREATE TRIGGER immutable_decision BEFORE UPDATE OR DELETE ON money_editorial.decision
FOR EACH ROW EXECUTE FUNCTION money_public.reject_update();

-- Run from the trusted publication service after complete manifest validation.
-- The service authenticates actor IDs. Browser clients receive no database grants.
CREATE FUNCTION money_editorial.activate(
  p_environment text, p_release text, p_expected_previous text, p_publisher text
) RETURNS void LANGUAGE plpgsql SET search_path = pg_catalog AS $$
DECLARE
  current_id text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('money-release:' || p_environment));
  IF NOT EXISTS (SELECT FROM money_editorial.actor WHERE id = p_publisher AND enabled AND role = 'publisher') THEN
    RAISE EXCEPTION 'Publisher required';
  END IF;
  SELECT release_id INTO current_id FROM money_public.current_release WHERE environment = p_environment;
  IF EXISTS (SELECT FROM money_public.revocation WHERE release_id = p_release)
     OR NOT EXISTS (SELECT FROM money_public.release WHERE environment = p_environment AND id = p_release) THEN
    RAISE EXCEPTION 'Unavailable release';
  END IF;
  IF current_id = p_release THEN
    RETURN;
  END IF;
  IF EXISTS (SELECT FROM money_editorial.outbox WHERE operation = 'publish' AND release_id = p_release) THEN
    RAISE EXCEPTION 'Restoration requires a newly verified release';
  END IF;
  IF current_id IS DISTINCT FROM p_expected_previous THEN
    RAISE EXCEPTION 'Release pointer changed';
  END IF;
  IF NOT EXISTS (SELECT FROM money_editorial.release_candidate WHERE release_id = p_release) THEN
    RAISE EXCEPTION 'Release requires reviewed candidates';
  END IF;
  IF EXISTS (
    SELECT FROM money_editorial.release_candidate AS candidate
    LEFT JOIN money_editorial.decision AS decision ON decision.candidate_id = candidate.candidate_id
    LEFT JOIN money_editorial.actor AS reviewer ON reviewer.id = decision.actor_id
    WHERE candidate.release_id = p_release
    GROUP BY candidate.candidate_id
    HAVING count(*) FILTER (WHERE decision.disposition = 'approve'
      AND reviewer.role = 'reviewer' AND reviewer.enabled AND reviewer.id <> p_publisher) < 2
      OR count(*) FILTER (WHERE decision.disposition IN ('reject', 'clarify')) > 0
  ) THEN
    RAISE EXCEPTION 'Independent approvals required for all candidates';
  END IF;
  INSERT INTO money_public.current_release VALUES (p_environment, p_release)
  ON CONFLICT (environment) DO UPDATE SET release_id = EXCLUDED.release_id;
  INSERT INTO money_editorial.outbox (operation, release_id, actor_id)
  VALUES ('publish', p_release, p_publisher) ON CONFLICT DO NOTHING;
END;
$$;

CREATE FUNCTION money_editorial.revoke(
  p_environment text, p_release text, p_operator text, p_reason text
) RETURNS void LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('money-release:' || p_environment));
  IF NOT EXISTS (SELECT FROM money_editorial.actor WHERE id = p_operator AND enabled AND role = 'operator')
     OR NOT EXISTS (SELECT FROM money_public.release WHERE environment = p_environment AND id = p_release) THEN
    RAISE EXCEPTION 'Operator and matching release required';
  END IF;
  INSERT INTO money_public.revocation (release_id, public_reason)
  VALUES (p_release, p_reason) ON CONFLICT DO NOTHING;
  INSERT INTO money_editorial.outbox (operation, release_id, actor_id)
  VALUES ('revoke', p_release, p_operator) ON CONFLICT DO NOTHING;
END;
$$;

REVOKE ALL ON SCHEMA money_editorial, money_public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA money_editorial, money_public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA money_editorial, money_public FROM PUBLIC;
COMMIT;
