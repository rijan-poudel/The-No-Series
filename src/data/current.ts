import { loadPublicRelease } from "./repository.ts";
import { publicRelease } from "./release.ts";

export async function currentData() {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.MONEY_DEMO === "1" &&
    !process.env.VERCEL
  ) {
    const { demoRelease, demoClock } = await import("./fixtures.ts");
    return { release: demoRelease(), clock: demoClock(), unavailable: false };
  }
  const clock = new Date();
  const origin = process.env.MONEY_PUBLIC_DATA_ORIGIN;
  const apiKey = process.env.MONEY_PUBLIC_DATA_KEY;
  if (!origin && !apiKey)
    return { release: publicRelease, clock, unavailable: false };
  try {
    if (!origin || !apiKey)
      throw new Error("Incomplete data store configuration");
    return {
      release: await loadPublicRelease({ origin, apiKey }),
      clock,
      unavailable: false,
    };
  } catch {
    return { release: publicRelease, clock, unavailable: true };
  }
}
