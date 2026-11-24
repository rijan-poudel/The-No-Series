export const registrySource =
  "https://www.nrb.org.np/contents/uploads/2026/11/List-of-BFIs-Asoj-2083-English.pdf";

const commercial = [
  ["nepal", "Nepal Bank", "NBL नेपाल बैंक"],
  ["adbl", "Agricultural Development Bank", "ADBL कृषि विकास"],
  ["nabil", "Nabil Bank", "नबिल"],
  ["nimb", "Nepal Investment Mega Bank", "NIMB नेपाल इन्भेस्टमेन्ट मेगा"],
  [
    "standard-chartered",
    "Standard Chartered Bank Nepal",
    "SCBNL स्ट्यान्डर्ड चार्टर्ड",
  ],
  ["himalayan", "Himalayan Bank", "HBL हिमालयन"],
  ["nepal-sbi", "Nepal SBI Bank", "NSBI SBI नेपाल एसबीआई"],
  ["everest", "Everest Bank", "EBL एभरेष्ट एभरेस्ट"],
  ["kumari", "Kumari Bank", "KBL कुमारी"],
  ["laxmi-sunrise", "Laxmi Sunrise Bank", "LSL लक्ष्मी सनराइज"],
  ["citizens", "Citizens Bank International", "CZBIL सिटिजन्स"],
  ["prime", "Prime Commercial Bank", "PCBL प्राइम"],
  ["sanima", "Sanima Bank", "SANIMA सानिमा"],
  ["machhapuchchhre", "Machhapuchchhre Bank", "MBL माछापुच्छ्रे"],
  ["nic-asia", "NIC Asia Bank", "NICA एनआईसी एशिया"],
  ["global-ime", "Global IME Bank", "GBIME ग्लोबल आइएमई"],
  ["nmb", "NMB Bank", "एनएमबी"],
  ["prabhu", "Prabhu Bank", "PRVU प्रभु"],
  ["siddhartha", "Siddhartha Bank", "SBL सिद्धार्थ"],
  ["rastriya-banijya", "Rastriya Banijya Bank", "RBB राष्ट्रिय वाणिज्य"],
] as const;

const development = [
  ["narayani", "Narayani Development Bank", "NABBC नारायणी"],
  ["karnali", "Karnali Development Bank", "KRBL कर्णाली"],
  ["excel", "Excel Development Bank", "EDBL एक्सेल"],
  ["miteri", "Miteri Development Bank", "MDB मित्रेरी मितेरी"],
  ["muktinath", "Muktinath Bikas Bank", "MNBBL मुक्तिनाथ"],
  ["corporate-development", "Corporate Development Bank", "CORBL कर्पोरेट"],
  ["sindhu", "Sindhu Bikas Bank", "SINDU सिन्धु"],
  ["salapa", "Salapa Bikash Bank", "सलपा"],
  ["green-development", "Green Development Bank", "GRDBL ग्रीन"],
  ["sangrila", "Sangrila Development Bank", "Shangrila SADBL सांग्रिला"],
  ["shine-resunga", "Shine Resunga Development Bank", "SHINE शाइन रेसुङ्गा"],
  ["jyoti", "Jyoti Bikas Bank", "JBBL ज्योति"],
  ["garima", "Garima Bikas Bank", "GBBL गरिमा"],
  ["mahalaxmi", "Mahalaxmi Bikas Bank", "MLBL महालक्ष्मी"],
  ["lumbini", "Lumbini Bikas Bank", "LBBL लुम्बिनी"],
  ["kamana-sewa", "Kamana Sewa Bikas Bank", "KSBBL कामना सेवा"],
  ["saptakoshi", "Saptakoshi Development Bank", "SAPDBL सप्तकोशी"],
] as const;

export const banks = [
  ...commercial.map(([id, name, aliases]) => ({
    id,
    name,
    aliases,
    kind: "commercial" as const,
  })),
  ...development.map(([id, name, aliases]) => ({
    id,
    name,
    aliases,
    kind: "development" as const,
  })),
].sort((a, b) => a.name.localeCompare(b.name, "en"));
export type BankEntry = (typeof banks)[number];

const normalize = (value: string) =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim();

export function findBanks(input: string) {
  const query = normalize(input.slice(0, 100));
  if (!query) return [];
  const tokens = query.split(" ");
  return banks
    .flatMap((bank) => {
      const name = normalize(bank.name);
      const aliases = normalize(bank.aliases).split(" ");
      const words = [...name.split(" "), ...aliases];
      if (
        !tokens.every((token) => words.some((word) => word.startsWith(token)))
      )
        return [];
      const score =
        name === query || aliases.includes(query)
          ? 0
          : name.startsWith(query)
            ? 1
            : 2;
      return [{ bank, score }];
    })
    .sort((a, b) => a.score - b.score)
    .map(({ bank }) => bank);
}
