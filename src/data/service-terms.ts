import type { BankEntry } from "./banks";
import type { Copy } from "../domain/model";
type ServiceTerm = { subject: Copy; detail: Copy; url: string };
export const serviceTerms: Partial<
  Record<BankEntry["id"], readonly ServiceTerm[]>
> = {
  everest: [
    {
      subject: { en: "Debit card issuance", ne: "डेबिट कार्ड जारी गर्दा" },
      detail: {
        en: "The bank lists NPR 1,500 upfront or NPR 400 per year for four years. The separate annual card fee is zero.",
        ne: "बैंकले एकमुष्ट रु १,५०० वा चार वर्षसम्म वार्षिक रु ४०० लिन्छ। छुट्टै वार्षिक कार्ड शुल्क शून्य छ।",
      },
      url: "https://everestbankltd.com/supports/interest-and-rates/fees-and-services/",
    },
    {
      subject: { en: "Remittance cancellation", ne: "विप्रेषण रद्द गर्दा" },
      detail: {
        en: "The cancellation charge is NPR 250 per instrument.",
        ne: "रद्द गर्दा प्रति भुक्तानी लिखत रु २५० लाग्छ।",
      },
      url: "https://everestbankltd.com/supports/interest-and-rates/fees-and-services/",
    },
  ],
  lumbini: [
    {
      subject: {
        en: "Floating-rate auto loan",
        ne: "परिवर्तनशील ब्याजदरको सवारी कर्जा",
      },
      detail: {
        en: "The Mangsir notice lists the base rate plus a premium of up to four percentage points. The borrower’s final rate depends on the base rate and agreed premium.",
        ne: "मंसिरको सूचनामा आधार दरमा बढीमा चार प्रतिशत बिन्दु प्रिमियम थपिने उल्लेख छ। अन्तिम ब्याजदर आधार दर र सम्झौताको प्रिमियममा निर्भर हुन्छ।",
      },
      url: "https://www.lumbinibikasbank.com/interest-rates",
    },
  ],
  sindhu: [
    {
      subject: {
        en: "Home loan with a fixed rate",
        ne: "स्थिर ब्याजदरको घर कर्जा",
      },
      detail: {
        en: "The notice lists 9.99% per year for terms up to seven years and 10.49% for longer terms. These are interest rates before fees.",
        ne: "सूचनाअनुसार सात वर्षसम्मको वार्षिक दर ९.९९% र त्यसभन्दा लामो अवधिको १०.४९% छ। यी दरमा शुल्क समावेश छैन।",
      },
      url: "https://www.sindhubank.com.np/wp-content/uploads/2026/07/interest-rate_sindhu_3x16-Mangsir-2083-Website_page-0001.jpg",
    },
  ],
  sangrila: [
    {
      subject: {
        en: "Remittance fixed deposit",
        ne: "विप्रेषण मुद्दती निक्षेप",
      },
      detail: {
        en: "The bank lists an extra percentage point above its ordinary individual rate for the same term.",
        ne: "बैंकले समान अवधिको सामान्य व्यक्तिगत मुद्दती दरमा एक प्रतिशत बिन्दु थप्ने जनाएको छ।",
      },
      url: "https://www.shangrilabank.com/interest-rate",
    },
  ],
  "nepal-sbi": [
    {
      subject: { en: "RTGS transfer", ne: "आरटीजीएस रकम स्थानान्तरण" },
      detail: {
        en: "For NPR 200,000 or more, the June 2026 schedule lists NPR 10 through 1:30 pm and NPR 20 from 1:31 pm to 5 pm.",
        ne: "जुन २०२६ को शुल्क सूचीअनुसार रु दुई लाख वा बढी रकमका लागि दिउँसो १:३० सम्म रु १० र १:३१ देखि साँझ ५ बजेसम्म रु २० लाग्छ।",
      },
      url: "https://nsbl.statebank/documents/1872337/1875858/Service%2BCharges%2Band%2BFees%2B2026-06-01.pdf/58266e90-6d22-2610-4bff-d2280689ba61?t=1780303766274",
    },
  ],
};
