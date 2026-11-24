import type { Release } from "../domain/model.ts";

export const publicRelease: Release = {
  id: "public-unseeded",
  kind: "public",
  revoked: false,
  institutions: [],
  sources: [],
  citations: [],
  offers: [],
  corrections: [],
};
