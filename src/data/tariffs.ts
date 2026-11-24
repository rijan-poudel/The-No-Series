import type { Copy } from "../domain/model.ts";

type TariffCharge = {
  event: Copy;
  unit: "NPR" | "percent";
  value: string;
};
type TariffReading = {
  edition: Copy;
  section: string;
  product: string;
  source: string;
  productPage: string;
  charges: readonly TariffCharge[];
  catch: Copy;
};

export const tariffReadings: Partial<Record<string, TariffReading>> = {
  nmb: {
    edition: {
      en: "September 2026 tariff",
      ne: "सेप्टेम्बर २०२६ को शुल्क सूची",
    },
    section: "2.17",
    product: "Visa International $500 Prepaid Card",
    source: "https://nmb.com.np/np/download/standard-tariff-charges",
    productPage:
      "https://nmb.com.np/en/products/cards/prepaid-card/nmb-visa-international-card",
    charges: [
      {
        event: { en: "When you get the card", ne: "कार्ड लिँदा" },
        unit: "NPR",
        value: "500",
      },
      {
        event: { en: "Each time you add funds", ne: "हरेक पटक रकम थप्दा" },
        unit: "NPR",
        value: "500",
      },
      {
        event: { en: "Cross-border transaction", ne: "सीमापार कारोबार" },
        unit: "percent",
        value: "1",
      },
    ],
    catch: {
      en: "The tariff lists a 1% cross-border fee even though the product FAQ mentions only issuing and reloading the card.",
      ne: "कार्डको प्रश्नोत्तरमा जारी गर्ने र रकम थप्ने शुल्क मात्र उल्लेख छ। शुल्क सूचीमा सीमापार कारोबारको १% शुल्क पनि छ।",
    },
  },
};
