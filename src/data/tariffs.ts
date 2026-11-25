import type { Copy } from "../domain/model.ts";

type TariffCharge = {
  event: Copy;
  unit: "NPR" | "USD" | "percent";
  minimumUsd?: string;
  registrationBasis?: "per-account" | "standard";
  annualBasis?: "per-account" | "standard";
  value: string;
};
export type TariffReading = {
  edition: Copy;
  subject?: "mobile-banking";
  section: string;
  product: string;
  source: string;
  productPage?: string;
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
  "nic-asia": {
    edition: {
      en: "September 2026 tariff",
      ne: "सेप्टेम्बर २०२६ को शुल्क सूची",
    },
    section: "4.10, pp. 22–23",
    product: "FCY Freedom Card",
    source:
      "https://cms.nicasiabank.com/framework/uploads/STC/STC_Sept%202026.pdf",
    charges: [
      {
        event: { en: "When you get the card", ne: "कार्ड लिँदा" },
        unit: "NPR",
        value: "1000",
      },
      {
        event: {
          en: "Each load, including the first",
          ne: "पहिलोसहित हरेक पटक रकम थप्दा",
        },
        unit: "NPR",
        value: "500",
      },
      {
        event: {
          en: "Transaction fee in the tariff",
          ne: "शुल्क सूचीअनुसार कारोबार शुल्क",
        },
        unit: "NPR",
        value: "0",
      },
      {
        event: { en: "Card renewal", ne: "कार्ड नवीकरण" },
        unit: "NPR",
        value: "1000",
      },
    ],
    catch: {
      en: "The loading fee applies from the first load. The card is issued over the counter and is valid for three years.",
      ne: "पहिलो पटकदेखि नै रकम थप्ने शुल्क लाग्छ। कार्ड काउन्टरबाट जारी हुन्छ र तीन वर्ष मान्य हुन्छ।",
    },
  },

  everest: {
    edition: {
      en: "Bank product page, checked 24 November 2026",
      ne: "बैंकको उत्पादन पृष्ठ, २४ नोभेम्बर २०२६ मा हेरिएको",
    },
    section: "Fees and charges",
    product: "EBL E-Com Dollar Card",
    source:
      "https://everestbankltd.com/product-and-services/card-services/prepaid-dollar-e-commerce-card/",
    charges: [
      {
        event: { en: "Virtual card issuance", ne: "भर्चुअल कार्ड जारी" },
        unit: "USD",
        value: "5",
      },
      {
        event: { en: "Physical card issuance", ne: "भौतिक कार्ड जारी" },
        unit: "USD",
        value: "10",
      },
      {
        event: { en: "Add or reload funds", ne: "रकम राख्दा वा थप्दा" },
        unit: "USD",
        value: "0",
      },
      {
        event: { en: "Each payment", ne: "हरेक भुक्तानीमा" },
        unit: "percent",
        value: "1.50",
        minimumUsd: "1",
      },
      {
        event: { en: "3D Secure registration", ne: "३डी सेक्योर दर्ता" },
        unit: "USD",
        value: "1",
      },
      {
        event: {
          en: "Virtual renewal or replacement",
          ne: "भर्चुअल कार्ड नवीकरण वा प्रतिस्थापन",
        },
        unit: "USD",
        value: "5",
      },
      {
        event: {
          en: "Physical renewal or replacement",
          ne: "भौतिक कार्ड नवीकरण वा प्रतिस्थापन",
        },
        unit: "USD",
        value: "10",
      },
    ],
    catch: {
      en: "Reloading is free. Every payment costs at least USD 1, and you need an active Everest account.",
      ne: "रकम थप्न निःशुल्क छ। हरेक भुक्तानीमा कम्तीमा १ अमेरिकी डलर लाग्छ र एभरेष्ट बैंकमा सक्रिय खाता चाहिन्छ।",
    },
  },
  "global-ime": {
    edition: {
      en: "September 2026 tariff",
      ne: "सेप्टेम्बर २०२६ को शुल्क सूची",
    },
    section: "12, pp. 14–15",
    product: "Global E-Com Card",
    source:
      "https://gibl-assets.gibl.com.np/uploads/Schedule%20of%20Fees%20and%20Charges-%20Sep%202026.pdf",
    productPage:
      "https://www.globalimebank.com/products/cards/e-com-card-usd-dollar-card-nepal/",
    charges: [
      {
        event: { en: "Virtual card issuance", ne: "भर्चुअल कार्ड जारी" },
        unit: "NPR",
        value: "500",
      },
      {
        event: { en: "Physical card issuance", ne: "भौतिक कार्ड जारी" },
        unit: "NPR",
        value: "600",
      },
      {
        event: {
          en: "Each top-up or withdrawal at the counter",
          ne: "काउन्टरबाट हरेक पटक रकम थप्दा वा निकाल्दा",
        },
        unit: "NPR",
        value: "100",
      },
      {
        event: {
          en: "Virtual renewal or replacement",
          ne: "भर्चुअल कार्ड नवीकरण वा प्रतिस्थापन",
        },
        unit: "NPR",
        value: "500",
      },
      {
        event: {
          en: "Physical renewal or replacement",
          ne: "भौतिक कार्ड नवीकरण वा प्रतिस्थापन",
        },
        unit: "NPR",
        value: "600",
      },
    ],
    catch: {
      en: "The NPR 100 fee is for the counter. This tariff does not specify what you pay to reload in the app.",
      ne: "रु १०० काउन्टरको शुल्क हो। एपबाट रकम थप्ने शुल्क यस सूचीमा खुलाइएको छैन।",
    },
  },

  nepal: {
    subject: "mobile-banking",
    edition: {
      en: "Bank service charges, checked 24 November 2026",
      ne: "बैंकको सेवा शुल्क, २४ नोभेम्बर २०२६ मा हेरिएको",
    },
    section: "8.1",
    product: "Nepal Bank mobile banking",
    source: "https://www.nepalbank.com.np/digital/service-charge",
    charges: [
      {
        event: { en: "Register one account", ne: "एउटा खाता दर्ता गर्दा" },
        registrationBasis: "per-account",
        unit: "NPR",
        value: "300",
      },
      {
        event: {
          en: "Renew one account for a year",
          ne: "एउटा खाता एक वर्षका लागि नवीकरण गर्दा",
        },
        annualBasis: "per-account",
        unit: "NPR",
        value: "300",
      },
      {
        event: { en: "Reset your PIN", ne: "पिन रिसेट गर्दा" },
        unit: "NPR",
        value: "50",
      },
    ],
    catch: {
      en: "The registration and renewal fees are charged per account.",
      ne: "दर्ता र नवीकरणको शुल्क प्रत्येक खाताका लागि छुट्टै लाग्छ।",
    },
  },
  "nepal-sbi": {
    subject: "mobile-banking",
    edition: {
      en: "1 June 2026 service charges",
      ne: "१ जुन २०२६ को सेवा शुल्क",
    },
    section: "30.1–30.6",
    product: "Yono mobile banking",
    source:
      "https://nsbl.statebank/documents/1872337/1875858/Service%2BCharges%2Band%2BFees%2B2026-06-01.pdf/58266e90-6d22-2610-4bff-d2280689ba61?t=1780303766274",
    charges: [
      {
        event: { en: "Mobile banking registration", ne: "मोबाइल बैंकिङ दर्ता" },
        registrationBasis: "standard",
        unit: "NPR",
        value: "0",
      },
      {
        event: {
          en: "Mobile banking each year",
          ne: "मोबाइल बैंकिङ वार्षिक शुल्क",
        },
        annualBasis: "standard",
        unit: "NPR",
        value: "200",
      },
      {
        event: {
          en: "Set up a scheduled payment",
          ne: "तोकिएको समयमा भुक्तानी गर्ने व्यवस्था मिलाउँदा",
        },
        unit: "NPR",
        value: "50",
      },
      {
        event: {
          en: "Each scheduled payment",
          ne: "तोकिएको समयमा हुने हरेक भुक्तानीमा",
        },
        unit: "NPR",
        value: "30",
      },
    ],
    catch: {
      en: "Signing up is free, but mobile banking has an annual fee. Scheduled payments have separate setup and per-payment fees.",
      ne: "दर्ता निःशुल्क छ, तर मोबाइल बैंकिङमा वार्षिक शुल्क लाग्छ। तोकिएको समयमा हुने भुक्तानीमा व्यवस्था मिलाउने र हरेक भुक्तानीको शुल्क छुट्टाछुट्टै लाग्छ।",
    },
  },
};

export const decodedCardTariffs = Object.entries(tariffReadings).flatMap(
  ([id, reading]) => (reading && !reading.subject ? [{ id, reading }] : []),
);

const additionalReadings: Readonly<Record<string, readonly TariffReading[]>> = {
  everest: [
    {
      subject: "mobile-banking",
      edition: {
        en: "Bank service charges, checked 24 November 2026",
        ne: "बैंकको सेवा शुल्क, २४ नोभेम्बर २०२६ मा हेरिएको",
      },
      section: "Digital Banking Related Service Charges",
      product: "Everest Omni Banking",
      source:
        "https://everestbankltd.com/supports/interest-and-rates/fees-and-services/",
      charges: [
        {
          event: {
            en: "Personal mobile banking with SMS alerts",
            ne: "एसएमएस सूचनासहित व्यक्तिगत मोबाइल बैंकिङ",
          },
          unit: "NPR",
          value: "300",
        },
        {
          event: { en: "SMS alerts only", ne: "एसएमएस सूचना मात्र" },
          unit: "NPR",
          value: "200",
        },
        {
          event: { en: "Reset your own PIN", ne: "आफैँ पिन रिसेट गर्दा" },
          unit: "NPR",
          value: "0",
        },
        {
          event: {
            en: "Reset your PIN at a branch",
            ne: "शाखाबाट पिन रिसेट गर्दा",
          },
          unit: "NPR",
          value: "75",
        },
      ],
      catch: {
        en: "Resetting your PIN yourself is free. A branch reset costs NPR 75.",
        ne: "आफैँ पिन रिसेट गर्न निःशुल्क छ। शाखाबाट रिसेट गर्दा रु ७५ लाग्छ।",
      },
    },
  ],
};

export function readingsForBank(id: string): readonly TariffReading[] {
  const primary = tariffReadings[id];
  return [...(primary ? [primary] : []), ...(additionalReadings[id] ?? [])];
}

export const decodedMobileTariffs = Object.keys(tariffReadings).flatMap((id) =>
  readingsForBank(id).flatMap((reading) =>
    reading.subject === "mobile-banking" ? [{ id, reading }] : [],
  ),
);
