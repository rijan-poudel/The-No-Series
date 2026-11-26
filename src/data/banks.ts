export const registrySource =
  "https://www.nrb.org.np/contents/uploads/2026/11/List-of-BFIs-Asoj-2083-English.pdf";

const commercial = [
  [
    "nepal",
    "Nepal Bank",
    "NBL नेपाल बैंक",
    "Dharmapath, Kathmandu",
    "धर्मपथ, काठमाडौं",
  ],
  [
    "adbl",
    "Agricultural Development Bank",
    "ADBL कृषि विकास",
    "Ramshah Path, Kathmandu",
    "रामशाहपथ, काठमाडौं",
  ],
  [
    "nabil",
    "Nabil Bank",
    "नबिल",
    "Beena Marg, Kathmandu",
    "बीना मार्ग, काठमाडौं",
  ],
  [
    "nimb",
    "Nepal Investment Mega Bank",
    "NIMB नेपाल इन्भेस्टमेन्ट मेगा",
    "Durbar Marg, Kathmandu",
    "दरबारमार्ग, काठमाडौं",
  ],
  [
    "standard-chartered",
    "Standard Chartered Bank Nepal",
    "SCBNL स्ट्यान्डर्ड चार्टर्ड",
    "New Baneshwor, Kathmandu",
    "नयाँ बानेश्वर, काठमाडौं",
  ],
  [
    "himalayan",
    "Himalayan Bank",
    "HBL हिमालयन",
    "Kamaladi, Kathmandu",
    "कमलादी, काठमाडौं",
  ],
  [
    "nepal-sbi",
    "Nepal SBI Bank",
    "NSBI SBI नेपाल एसबीआई",
    "Kesharmahal, Kathmandu",
    "केशरमहल, काठमाडौं",
  ],
  [
    "everest",
    "Everest Bank",
    "EBL एभरेष्ट एभरेस्ट",
    "Lazimpat, Kathmandu",
    "लाजिम्पाट, काठमाडौं",
  ],
  [
    "kumari",
    "Kumari Bank",
    "KBL कुमारी",
    "Tangal, Kathmandu",
    "टंगाल, काठमाडौं",
  ],
  [
    "laxmi-sunrise",
    "Laxmi Sunrise Bank",
    "LSL लक्ष्मी सनराइज",
    "Hattisar, Kathmandu",
    "हात्तीसार, काठमाडौं",
  ],
  [
    "citizens",
    "Citizens Bank International",
    "CZBIL सिटिजन्स",
    "Narayanhiti Path, Kathmandu",
    "नारायणहिटी पथ, काठमाडौं",
  ],
  [
    "prime",
    "Prime Commercial Bank",
    "PCBL प्राइम",
    "Kamalpokhari, Kathmandu",
    "कमलपोखरी, काठमाडौं",
  ],
  [
    "sanima",
    "Sanima Bank",
    "SANIMA सानिमा",
    "Alkapuri, Naxal, Kathmandu",
    "अलकापुरी, नक्साल, काठमाडौं",
  ],
  [
    "machhapuchchhre",
    "Machhapuchchhre Bank",
    "MBL माछापुच्छ्रे",
    "Lazimpat, Kathmandu",
    "लाजिम्पाट, काठमाडौं",
  ],
  [
    "nic-asia",
    "NIC Asia Bank",
    "NICA एनआईसी एशिया",
    "Thapathali, Kathmandu",
    "थापाथली, काठमाडौं",
  ],
  [
    "global-ime",
    "Global IME Bank",
    "GBIME ग्लोबल आइएमई",
    "Kamaladi, Kathmandu",
    "कमलादी, काठमाडौं",
  ],
  ["nmb", "NMB Bank", "एनएमबी", "Babarmahal, Kathmandu", "बबरमहल, काठमाडौं"],
  [
    "prabhu",
    "Prabhu Bank",
    "PRVU प्रभु",
    "Babarmahal, Kathmandu",
    "बबरमहल, काठमाडौं",
  ],
  [
    "siddhartha",
    "Siddhartha Bank",
    "SBL सिद्धार्थ",
    "Hattisar, Kathmandu",
    "हात्तीसार, काठमाडौं",
  ],
  [
    "rastriya-banijya",
    "Rastriya Banijya Bank",
    "RBB राष्ट्रिय वाणिज्य",
    "Singhadurbar Plaza, Kathmandu",
    "सिंहदरबार प्लाजा, काठमाडौं",
  ],
] as const;

const development = [
  [
    "narayani",
    "Narayani Development Bank",
    "NABBC नारायणी",
    "Ratnanagar, Chitwan",
    "रत्ननगर, चितवन",
    "Nawalparasi, Chitwan, Makawanpur",
    "नवलपरासी, चितवन, मकवानपुर",
  ],
  [
    "karnali",
    "Karnali Development Bank",
    "KRBL कर्णाली",
    "Nepalgunj, Banke",
    "नेपालगञ्ज, बाँके",
    "Banke, Bardiya, Dang, Pyuthan, Rolpa",
    "बाँके, बर्दिया, दाङ, प्युठान, रोल्पा",
  ],
  [
    "excel",
    "Excel Development Bank",
    "EDBL एक्सेल",
    "Birtamod, Jhapa",
    "बिर्तामोड, झापा",
    "Koshi Province",
    "कोशी प्रदेश",
  ],
  [
    "miteri",
    "Miteri Development Bank",
    "MDB मित्रेरी मितेरी",
    "Dharan, Sunsari",
    "धरान, सुनसरी",
    "Koshi Province",
    "कोशी प्रदेश",
  ],
  [
    "muktinath",
    "Muktinath Bikas Bank",
    "MNBBL मुक्तिनाथ",
    "Kamaladi, Kathmandu",
    "कमलादी, काठमाडौं",
  ],
  [
    "corporate-development",
    "Corporate Development Bank",
    "CORBL कर्पोरेट",
    "Birgunj, Parsa",
    "वीरगञ्ज, पर्सा",
    "Parsa, Bara, Rautahat, Sarlahi, Mahottari",
    "पर्सा, बारा, रौतहट, सर्लाही, महोत्तरी",
  ],
  [
    "sindhu",
    "Sindhu Bikas Bank",
    "SINDU सिन्धु",
    "Barhabise, Sindhupalchowk",
    "बाह्रबिसे, सिन्धुपाल्चोक",
    "Sindhupalchowk, Kavre, Dolakha, Makawanpur, Chitwan",
    "सिन्धुपाल्चोक, काभ्रे, दोलखा, मकवानपुर, चितवन",
  ],
  [
    "salapa",
    "Salapa Bikash Bank",
    "सलपा",
    "Diktel, Khotang",
    "दिक्तेल, खोटाङ",
    "Khotang",
    "खोटाङ",
  ],
  [
    "green-development",
    "Green Development Bank",
    "GRDBL ग्रीन",
    "Pokhara, Kaski",
    "पोखरा, कास्की",
    "Baglung, Myagdi, Kaski, Tanahun, Nawalparasi East",
    "बागलुङ, म्याग्दी, कास्की, तनहुँ, नवलपरासी पूर्व",
  ],
  [
    "sangrila",
    "Sangrila Development Bank",
    "Shangrila SADBL सांग्रिला",
    "Baluwatar, Kathmandu",
    "बालुवाटार, काठमाडौं",
  ],
  [
    "shine-resunga",
    "Shine Resunga Development Bank",
    "SHINE शाइन रेसुङ्गा",
    "Butwal, Rupandehi",
    "बुटवल, रुपन्देही",
  ],
  [
    "jyoti",
    "Jyoti Bikas Bank",
    "JBBL ज्योति",
    "Kamaladi, Kathmandu",
    "कमलादी, काठमाडौं",
  ],
  [
    "garima",
    "Garima Bikas Bank",
    "GBBL गरिमा",
    "Lazimpat, Kathmandu",
    "लाजिम्पाट, काठमाडौं",
  ],
  [
    "mahalaxmi",
    "Mahalaxmi Bikas Bank",
    "MLBL महालक्ष्मी",
    "Durbar Marg, Kathmandu",
    "दरबारमार्ग, काठमाडौं",
  ],
  [
    "lumbini",
    "Lumbini Bikas Bank",
    "LBBL लुम्बिनी",
    "Dillibazar, Kathmandu",
    "डिल्लीबजार, काठमाडौं",
  ],
  [
    "kamana-sewa",
    "Kamana Sewa Bikas Bank",
    "KSBBL कामना सेवा",
    "Gyaneshwor, Kathmandu",
    "ज्ञानेश्वर, काठमाडौं",
  ],
  [
    "saptakoshi",
    "Saptakoshi Development Bank",
    "SAPDBL सप्तकोशी",
    "Dhankuta Bazaar, Dhankuta",
    "धनकुटा बजार, धनकुटा",
    "Morang, Ilam, Panchthar, Jhapa, Sunsari, Dhankuta, Terhathum",
    "मोरङ, इलाम, पाँचथर, झापा, सुनसरी, धनकुटा, तेह्रथुम",
  ],
] as const;

export const banks = [
  ...commercial.map(([id, name, aliases, officeEn, officeNe]) => ({
    id,
    name,
    aliases,
    office: { en: officeEn, ne: officeNe },
    area: { en: "Nationwide", ne: "देशभर" },
    kind: "commercial" as const,
  })),
  ...development.map(
    ([id, name, aliases, officeEn, officeNe, areaEn, areaNe]) => ({
      id,
      name,
      aliases,
      office: { en: officeEn, ne: officeNe },
      area: { en: areaEn ?? "Nationwide", ne: areaNe ?? "देशभर" },
      kind: "development" as const,
    }),
  ),
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
