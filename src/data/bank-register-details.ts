import type { BankEntry } from "./banks";

// NRB's mid-October 2026 register. A starred date denotes joint operation after merger or acquisition.
export const registerDetails = {
  nepal: {
    operationDate: "1937-11-15",
    jointOperation: false,
    paidUpCrore: "1469.40",
    branchUrl: "https://www.nepalbank.com.np/branch",
  },
  adbl: {
    operationDate: "1968-01-21",
    jointOperation: false,
    paidUpCrore: "1973.82",
    branchUrl: "https://adbl.gov.np/en/branch",
  },
  nabil: {
    operationDate: "2022-07-11",
    jointOperation: true,
    paidUpCrore: "3340.98",
    branchUrl: "https://www.nabilbank.com/branches",
  },
  nimb: {
    operationDate: "2023-01-11",
    jointOperation: true,
    paidUpCrore: "3412.86",
    branchUrl: null,
  },
  "standard-chartered": {
    operationDate: "1987-01-30",
    jointOperation: false,
    paidUpCrore: "1004.24",
    branchUrl: "https://www.sc.com/np/ne/atm-branch-locator/",
  },
  himalayan: {
    operationDate: "2023-02-24",
    jointOperation: true,
    paidUpCrore: "2258.17",
    branchUrl: "https://himalayanbank.com/en/branches-atms",
  },
  "nepal-sbi": {
    operationDate: "1993-07-07",
    jointOperation: false,
    paidUpCrore: "1133.51",
    branchUrl: "https://nsbl.statebank/branch-locator",
  },
  everest: {
    operationDate: "1994-10-18",
    jointOperation: false,
    paidUpCrore: "1440.74",
    branchUrl: "https://everestbankltd.com/branch-network/",
  },
  kumari: {
    operationDate: "2023-01-01",
    jointOperation: true,
    paidUpCrore: "2622.59",
    branchUrl: "https://www.kumaribank.com/branch",
  },
  "laxmi-sunrise": {
    operationDate: "2002-04-03",
    jointOperation: false,
    paidUpCrore: "2678.12",
    branchUrl: "https://www.laxmisunrise.com/our-network/",
  },
  citizens: {
    operationDate: "2007-04-20",
    jointOperation: false,
    paidUpCrore: "1609.67",
    branchUrl: null,
  },
  prime: {
    operationDate: "2007-09-24",
    jointOperation: false,
    paidUpCrore: "2095.48",
    branchUrl: null,
  },
  sanima: {
    operationDate: "2012-02-15",
    jointOperation: false,
    paidUpCrore: "1558.15",
    branchUrl: null,
  },
  machhapuchchhre: {
    operationDate: "2012-07-09",
    jointOperation: true,
    paidUpCrore: "1544.88",
    branchUrl: null,
  },
  "nic-asia": {
    operationDate: "2013-06-30",
    jointOperation: true,
    paidUpCrore: "1491.76",
    branchUrl: "https://www.nicasiabank.com/atm-and-branch/",
  },
  "global-ime": {
    operationDate: "2023-01-09",
    jointOperation: true,
    paidUpCrore: "3964.05",
    branchUrl: "https://www.globalimebank.com/branches/",
  },
  nmb: {
    operationDate: "2019-09-28",
    jointOperation: true,
    paidUpCrore: "2228.50",
    branchUrl: "https://www.nmb.com.np/branch.php",
  },
  prabhu: {
    operationDate: "2023-01-10",
    jointOperation: true,
    paidUpCrore: "2354.25",
    branchUrl: "https://www.prabhubank.com/branches",
  },
  siddhartha: {
    operationDate: "2016-06-21",
    jointOperation: true,
    paidUpCrore: "1977.39",
    branchUrl: "https://www.siddharthabank.com/service-networks",
  },
  "rastriya-banijya": {
    operationDate: "2018-05-02",
    jointOperation: true,
    paidUpCrore: "1563.74",
    branchUrl: "https://www.rbb.com.np/branch",
  },
  narayani: {
    operationDate: "2001-10-17",
    jointOperation: false,
    paidUpCrore: "45.34",
    branchUrl: "https://ndbl.com.np/locations/",
  },
  karnali: {
    operationDate: "2004-02-18",
    jointOperation: false,
    paidUpCrore: "50.28",
    branchUrl: "https://kdblnepal.com/branches",
  },
  excel: {
    operationDate: "2005-07-21",
    jointOperation: false,
    paidUpCrore: "124.97",
    branchUrl: "https://edb.com.np/branches/",
  },
  miteri: {
    operationDate: "2006-10-13",
    jointOperation: false,
    paidUpCrore: "121.71",
    branchUrl: "https://miteribank.com.np/control/pages/branches/",
  },
  muktinath: {
    operationDate: "2007-01-03",
    jointOperation: false,
    paidUpCrore: "800.04",
    branchUrl: "https://muktinathbank.com.np/branch/branches-modern",
  },
  "corporate-development": {
    operationDate: "2007-11-07",
    jointOperation: false,
    paidUpCrore: "52.50",
    branchUrl: "https://corporatebank.com.np/branch",
  },
  sindhu: {
    operationDate: "2010-09-09",
    jointOperation: false,
    paidUpCrore: "55.75",
    branchUrl: "https://www.sindhubank.com.np/branches/",
  },
  salapa: {
    operationDate: "2012-07-16",
    jointOperation: false,
    paidUpCrore: "52.24",
    branchUrl: "https://salapabikasbank.com.np/main/YnJhbmNobWFuYWdlcg%3D%3D",
  },
  "green-development": {
    operationDate: "2013-08-25",
    jointOperation: false,
    paidUpCrore: "61.55",
    branchUrl: null,
  },
  sangrila: {
    operationDate: "2014-07-13",
    jointOperation: true,
    paidUpCrore: "388.34",
    branchUrl: "https://shangrilabank.com/branch",
  },
  "shine-resunga": {
    operationDate: "2019-10-14",
    jointOperation: true,
    paidUpCrore: "532.33",
    branchUrl: "https://srdb.com.np/branches",
  },
  jyoti: {
    operationDate: "2019-03-29",
    jointOperation: true,
    paidUpCrore: "439.58",
    branchUrl: null,
  },
  garima: {
    operationDate: "2021-11-14",
    jointOperation: true,
    paidUpCrore: "662.35",
    branchUrl: "https://garimabank.com.np/branch",
  },
  mahalaxmi: {
    operationDate: "2017-07-02",
    jointOperation: true,
    paidUpCrore: "451.13",
    branchUrl: "https://www.mahalaxmibank.com/branches",
  },
  lumbini: {
    operationDate: "2017-07-09",
    jointOperation: true,
    paidUpCrore: "362.37",
    branchUrl: "https://www.lumbinibikasbank.com/branches",
  },
  "kamana-sewa": {
    operationDate: "2017-08-04",
    jointOperation: true,
    paidUpCrore: "421.19",
    branchUrl: "https://kamanasewabank.com/branch/",
  },
  saptakoshi: {
    operationDate: "2019-07-07",
    jointOperation: true,
    paidUpCrore: "83.43",
    branchUrl: null,
  },
} satisfies Record<
  BankEntry["id"],
  {
    operationDate: string;
    jointOperation: boolean;
    paidUpCrore: string;
    branchUrl: string | null;
  }
>;

export const nrbBranchDirectory = "https://www.nrb.org.np/bank-list/";
