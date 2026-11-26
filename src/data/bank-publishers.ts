import type { BankEntry } from "./banks";
type Publisher = { url: string; kind: "rates" | "website" | "deposits" };
const rates = (url: string): Publisher => ({ url, kind: "rates" });
const website = (url: string): Publisher => ({ url, kind: "website" });
const deposits = (url: string): Publisher => ({ url, kind: "deposits" });

// Publisher entry points only. Pricing and eligibility require dated product evidence.
export const bankPublishers = {
  nepal: rates("https://www.nepalbank.com.np/index.php/digital/interest-rate"),
  adbl: rates("https://adbl.gov.np/en/interest-rate"),
  nabil: rates("https://www.nabilbank.com/interest-rate"),
  nimb: rates("https://www.nimb.com.np/personal-banking/interest-rate"),
  "standard-chartered": deposits("https://www.sc.com/np/deposits/"),
  himalayan: rates(
    "https://himalayanbank.com/en/rates/deposit-products-rate.html",
  ),
  "nepal-sbi": rates("https://nsbl.statebank/interest-rates-deposits"),
  everest: rates(
    "https://everestbankltd.com/supports/interest-and-rates/interest-rates-deposit/",
  ),
  kumari: rates("https://www.kumaribank.com/en/interest-rate-deposits"),
  "laxmi-sunrise": rates("https://www.laxmisunrise.com/rates/interest-rates/"),
  citizens: rates(
    "https://www.ctznbank.com/interest-rate/published-interest-rates",
  ),
  prime: deposits(
    "https://www.primebank.com.np/service-details/prime-individual-fixed-deposit",
  ),
  sanima: rates("https://www.sanimabank.com/np/know-us/interest-rate"),
  machhapuchchhre: rates(
    "https://wwwo.machbank.com/information/rates-and-charges/deposit-interest-rate",
  ),
  "nic-asia": rates("https://www.nicasiabank.com/interest-rates/"),
  "global-ime": rates("https://www.globalimebank.com/interest-rates/"),
  nmb: rates("https://nmb.com.np/en/interest-rate"),
  prabhu: rates("https://www.prabhubank.com/interest-rates"),
  siddhartha: rates("https://www.siddharthabank.com/interest-rates"),
  "rastriya-banijya": rates(
    "https://www.rbb.com.np/content/history-rate-of-interest",
  ),
  narayani: deposits("https://ndbl.com.np/product_category/savings/"),
  karnali: rates("https://kdblnepal.com/reports/interest_rate"),
  excel: rates("https://edb.com.np/interest-rate/"),
  miteri: website("https://www.miteribank.com.np/"),
  muktinath: deposits(
    "https://www.muktinathbank.com.np/general-banking/deposit/fixed-deposit/fixed-deposit-product",
  ),
  "corporate-development": rates(
    "https://www.corporatebank.com.np/financials/interest-rates",
  ),
  sindhu: rates("https://www.sindhubank.com.np/interest-rates/"),
  salapa: website("https://salapabikasbank.com.np/"),
  "green-development": website("https://www.greenbank.com.np/"),
  sangrila: rates("https://www.shangrilabank.com/interest-rate"),
  "shine-resunga": rates("https://srdb.com.np/Interest-Rate"),
  jyoti: website("https://jbbl.com.np/"),
  garima: rates("https://garimabank.com.np/interest-rates"),
  mahalaxmi: rates(
    "https://www.mahalaxmibank.com/notice/interest-rates-pa-effective-from-november-17-2026-1st-mangsir-2083-",
  ),
  lumbini: rates("https://www.lumbinibikasbank.com/interest-rates"),
  "kamana-sewa": website("https://kamanasewabank.com/"),
  saptakoshi: website("https://skdbl.com.np/"),
} satisfies Record<BankEntry["id"], Publisher>;
