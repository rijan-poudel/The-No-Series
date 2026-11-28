import type { BankEntry } from "./banks";

export type SavingsReading = {
  account: string;
  annualPercent: string;
  minimumNpr: string | null;
  minimumSource?: string;
  minimumChecked?: string;
  source: string;
};
// One named NPR savings account per bank from its Mangsir 2083 notice.
export const savingsEdition = { en: "Mangsir 2083", ne: "मंसिर २०८३" };
export const savingsChecked = "2026-11-26";
export const savingsReadings: Partial<Record<BankEntry["id"], SavingsReading>> =
  {
    everest: {
      account: "Saving General (Normal Deposit)",
      annualPercent: "2.75",
      minimumNpr: "500",
      source:
        "https://everestbankltd.com/supports/interest-and-rates/interest-rates-deposit/",
      minimumSource:
        "https://everestbankltd.com/product-and-services/deposit/savings-account/general-saving/",
    },
    "nepal-sbi": {
      account: "Nepal SBI Premium Saving",
      annualPercent: "2.80",
      minimumNpr: "25000",
      source: "https://nsbl.statebank/interest-rates-deposits",
      minimumSource: "https://nsbl.statebank/deposit-schemes",
    },
    "laxmi-sunrise": {
      account: "Sunrise Savings",
      annualPercent: "2.75",
      minimumNpr: "0",
      source: "https://www.laxmisunrise.com/rates/interest-rates/",
      minimumSource: "https://www.laxmisunrise.com/deposit/sunrise-savings/",
    },
    siddhartha: {
      account: "Siddhartha Sajilo Bachat Khata",
      annualPercent: "2.75",
      minimumNpr: null,
      source: "https://www.siddharthabank.com/interest-rates",
    },
    miteri: {
      account: "General Saving A/C",
      annualPercent: "2.75",
      minimumNpr: "1000",
      source: "https://miteribank.com.np/control/Interestrate/94/",
    },
    muktinath: {
      account: "Normal Saving",
      annualPercent: "2.75",
      minimumNpr: "500",
      source: "https://www.muktinathbank.com.np/interest-rates",
    },
    "shine-resunga": {
      account: "Shine Pragati Bachat Khata",
      annualPercent: "2.75",
      minimumNpr: "5000",
      source: "https://srdb.com.np/Interest-Rate",
    },
    "nic-asia": {
      account: "Life Savings Account",
      annualPercent: "2.75",
      minimumNpr: "10000",
      source: "https://www.nicasiabank.com/interest-rates/",
    },
    "standard-chartered": {
      account: "Diva Account",
      annualPercent: "2.75",
      minimumNpr: null,
      source: "https://av.sc.com/np/content/docs/np-interest-rate.pdf",
    },
    machhapuchchhre: {
      account: "Normal Saving",
      annualPercent: "2.75",
      minimumNpr: null,
      source:
        "https://assets.machbank.com/uploads/Notices/Interest%20Rate%20Mangsir%202083.jpeg",
    },
    "rastriya-banijya": {
      account: "सामान्य बचत",
      annualPercent: "2.75",
      minimumNpr: "1000",
      source:
        "https://www.rbb.com.np/storage/photos/14/interestRate/IR_20830801.jpg",
    },
    excel: {
      account: "General Saving Account",
      annualPercent: "2.75",
      minimumNpr: null,
      source:
        "https://edb.com.np/wp-content/uploads/2026/11/Int.-Rate-Sheet-for-Mangsir2083-scaled.jpeg",
    },
    sindhu: {
      account: "Normal Saving",
      annualPercent: "2.93",
      minimumNpr: null,
      source:
        "https://www.sindhubank.com.np/wp-content/uploads/2026/07/interest-rate_sindhu_3x16-Mangsir-2083-Website_page-0001.jpg",
    },
    lumbini: {
      account: "Normal Saving",
      annualPercent: "2.75",
      minimumNpr: null,
      source: "https://www.lumbinibikasbank.com/interest-rates",
    },
    "corporate-development": {
      account: "Corporate Saving A/C",
      annualPercent: "2.85",
      minimumNpr: "100",
      source: "https://www.corporatebank.com.np/financials/interest-rates",
    },
    sangrila: {
      account: "Shangri-la Normal Saving Account",
      annualPercent: "2.75",
      minimumNpr: "0",
      source: "https://www.shangrilabank.com/interest-rate",
    },
    nepal: {
      account: "Normal Saving",
      annualPercent: "2.75",
      minimumNpr: "500",
      source: "https://www.nepalbank.com.np/index.php/digital/interest-rate",
    },
    adbl: {
      account: "General Savings",
      annualPercent: "2.75",
      minimumNpr: null,
      source:
        "https://adbl.gov.np/en/interest-rate/interest-rates-effective-from-mangsir-01-2083-17-november-2026",
    },
    nmb: {
      account: "NMB Go-Green Savings Account",
      annualPercent: "2.75",
      minimumNpr: "1000",
      minimumChecked: "2026-11-28",
      minimumSource:
        "https://nmb.com.np/en/products/saving-accounts/individual/nmb-go-green-savings-account",
      source: "https://nmb.com.np/en/interest-rate",
    },
    nabil: {
      account: "Nabil General Savings Account",
      annualPercent: "2.75",
      minimumNpr: null,
      source: "https://cdn.nabilbank.com/interest-rate",
    },
    garima: {
      account: "General Savings Account",
      annualPercent: "2.75",
      minimumNpr: "500",
      source: "https://garimabank.com.np/interest-rates",
    },
    jyoti: {
      account: "Super Smart Savings Account",
      annualPercent: "2.75",
      minimumNpr: "15",
      source: "https://jbbl.com.np/",
    },
  };
