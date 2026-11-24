BEGIN;
INSERT INTO money_editorial.actor VALUES
  ('fixture-reviewer-a', 'reviewer', true), ('fixture-reviewer-b', 'reviewer', true),
  ('fixture-publisher', 'publisher', true), ('fixture-operator', 'operator', true);
INSERT INTO money_editorial.source (id, canonical_url, publisher, kind, interval_seconds)
VALUES ('fixture-source', 'https://example.invalid/notice', 'Fictional source', 'rate', 86400);
INSERT INTO money_editorial.observation (source_id, outcome) VALUES ('fixture-source', 'changed');
INSERT INTO money_editorial.candidate (id, observation_id, subject_key, locator, source_excerpt, effective_on)
SELECT 'fixture-change', id, 'fictional-offer', 'row 1', 'synthetic notice', DATE '2026-11-23'
FROM money_editorial.observation WHERE source_id = 'fixture-source';
INSERT INTO money_public.release (id, methodology, environment, fingerprint, manifest)
VALUES ('fixture-release', '1.0', 'sandbox', repeat('a', 64), '{"kind":"demo"}');
INSERT INTO money_editorial.release_candidate VALUES ('fixture-release', 'fixture-change');
INSERT INTO money_editorial.decision (candidate_id, actor_id, disposition, explanation)
VALUES ('fixture-change', 'fixture-reviewer-a', 'approve', 'Checked example row.');
DO $$
BEGIN
  BEGIN
    PERFORM money_editorial.activate('sandbox', 'fixture-release', NULL, 'fixture-publisher');
    RAISE EXCEPTION 'Expected activation failure';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Independent approvals required for all candidates' THEN RAISE; END IF;
  END;
END;
$$;
INSERT INTO money_editorial.decision (candidate_id, actor_id, disposition, explanation)
VALUES ('fixture-change', 'fixture-reviewer-b', 'approve', 'Independently checked example row.');
SELECT money_editorial.activate('sandbox', 'fixture-release', NULL, 'fixture-publisher');
SELECT money_editorial.activate('sandbox', 'fixture-release', NULL, 'fixture-publisher');
SELECT money_editorial.revoke('sandbox', 'fixture-release', 'fixture-operator', 'Fictional incident.');
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM money_public.revocation WHERE release_id = 'fixture-release') THEN
    RAISE EXCEPTION 'Expected revocation record';
  END IF;
  IF (SELECT count(*) FROM money_editorial.outbox WHERE release_id = 'fixture-release') <> 2 THEN
    RAISE EXCEPTION 'Expected one publish and one revoke event';
  END IF;
  IF EXISTS (SELECT FROM money_public.active_manifest WHERE id = 'fixture-release') THEN
    RAISE EXCEPTION 'Sandbox must be isolated from public view';
  END IF;
END;
$$;
ROLLBACK;
