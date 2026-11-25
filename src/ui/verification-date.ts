import {
  adToBs,
  BikramRangeError,
  formatBs,
} from "@inicrea/bikram-sambat-core";
import type { Locale } from "./copy";

export function verificationDate(locale: Locale, iso: string) {
  if (locale === "ne") {
    try {
      return "वि.सं. " + formatBs(adToBs(iso), "YYYY MMMM D", { locale: "ne" });
    } catch (error) {
      if (!(error instanceof BikramRangeError) || error.code !== "OUT_OF_RANGE")
        throw error;
    }
  }
  const date = new Intl.DateTimeFormat(
    locale === "ne" ? "ne-NP-u-nu-deva" : "en-IN",
    {
      dateStyle: "medium",
      calendar: "gregory",
      timeZone: "UTC",
    },
  ).format(new Date(iso + "T00:00:00Z"));
  return locale === "ne" ? date + " ई.सं." : date;
}
