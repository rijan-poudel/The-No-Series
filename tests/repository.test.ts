import { strict as assert } from "node:assert";
import { test } from "node:test";
import { loadPublicRelease } from "../src/data/repository.ts";
import { publicManifest } from "../src/data/public-schema.ts";
import { demoRelease } from "../src/data/fixtures.ts";
import { publicRelease } from "../src/data/release.ts";

const config = {
  origin: "https://test-project.supabase.co",
  apiKey: "sb_publishable_fake-test-key",
};
const pointer = {
  id: "public-test",
  methodology: "1.0",
  fingerprint: "a".repeat(64),
  revoked: false,
  manifest: { ...publicRelease, id: "public-test" },
};
const respond =
  (body: unknown): typeof fetch =>
  async () =>
    Response.json(body);

test("repository reads only the no-cache public schema projection", async () => {
  const result = await loadPublicRelease(config, async (input, options) => {
    assert.equal(
      String(input),
      config.origin +
        "/rest/v1/active_manifest?select=id,methodology,fingerprint,revoked,manifest&limit=2",
    );
    assert.equal(options?.cache, "no-store");
    assert.equal(options?.redirect, "error");
    assert.equal(
      new Headers(options?.headers).get("Accept-Profile"),
      "money_public",
    );
    return Response.json([pointer]);
  });
  assert.equal(result.id, "public-test");
});

test("repository distinguishes unseeded, revoked and invalid releases", async () => {
  assert.deepEqual(await loadPublicRelease(config, respond([])), publicRelease);
  const revoked = await loadPublicRelease(
    config,
    respond([{ ...pointer, revoked: true, manifest: null }]),
  );
  assert.equal(revoked.revoked, true);
  assert.deepEqual(revoked.offers, []);
  await assert.rejects(
    loadPublicRelease(config, respond([{ ...pointer, methodology: "other" }])),
  );
  await assert.rejects(loadPublicRelease(config, respond([pointer, pointer])));
  await assert.rejects(
    loadPublicRelease(
      config,
      respond([{ ...pointer, manifest: { ...demoRelease(), kind: "public" } }]),
    ),
  );
});

test("invalid origins and elevated Supabase credentials fail before network access", async () => {
  const forbidden: typeof fetch = async () => {
    assert.fail("Unexpected request");
  };
  await assert.rejects(
    loadPublicRelease({ ...config, origin: "https://example.org" }, forbidden),
    /Invalid read-only/,
  );
  await assert.rejects(
    loadPublicRelease({ ...config, apiKey: "sb_secret_fake" }, forbidden),
    /Invalid read-only/,
  );
});

test("public manifest validates date, currency, amount bounds and first-party record references", () => {
  const demo = demoRelease();
  const offer = demo.offers[0];
  assert(offer.product === "fixed-deposits");
  const projectOffer = {
    ...offer,
    principal: {
      ...offer.principal,
      value: { ...offer.principal.value, min: "not-a-number" },
    },
  };
  const malformed = { ...publicRelease, offers: [projectOffer] };
  assert.equal(publicManifest.safeParse(malformed).success, false);
  assert.equal(
    publicManifest.safeParse({
      ...publicRelease,
      offers: [{ ...offer, rate: { ...offer.rate, value: "not-a-rate" } }],
    }).success,
    false,
  );
});
