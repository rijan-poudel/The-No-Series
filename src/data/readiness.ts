import { reviewedOffers } from "../domain/engine.ts";
import { nepalDate, type Release } from "../domain/model.ts";

export function releaseReadiness(
  release: Release,
  clock: Date,
  unavailable: boolean,
) {
  if (unavailable) return "unavailable";
  if (release.kind !== "public") return "unseeded";
  if (release.revoked) return "withdrawn";
  if (release.offers.length === 0) return "unseeded";

  const current = reviewedOffers(release.offers, release, nepalDate(clock));
  return current.some(({ reason }) => reason === undefined)
    ? "ready"
    : "no-current-offers";
}
