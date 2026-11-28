import { methodology } from "../domain/methodology";
import type { Copy, Product } from "../domain/model";

export type Locale = "en" | "ne";
export const isLocale = (input: string): input is Locale =>
  input === "en" || input === "ne";
export const intlLocale = (locale: Locale) =>
  locale === "ne" ? "ne-NP-u-nu-deva" : "en-IN";
const words = {
  allAccounts: ["All accounts", "सबै खाता"],
  balanceFilters: [
    "Filter by minimum balance",
    "न्यूनतम मौज्दातअनुसार छान्नुहोस्",
  ],
  emptyBalanceGroup: [
    "No account in this group for your balance.",
    "तपाईंको मौज्दातका लागि यस समूहमा कुनै खाता छैन।",
  ],
  compareWithBank: ["Compare with", "यो बैंकसँग तुलना गर्नुहोस्"],
  compareSavings: [
    "Compare two savings accounts",
    "दुई बचत खाताको तुलना गर्नुहोस्",
  ],
  fdMarket: ["One-year deposit coverage", "एक वर्षको मुद्दती निक्षेपको विवरण"],
  termUnconfirmed: [
    "One-year terms unconfirmed",
    "एक वर्षको सर्त पुष्टि हुन बाँकी",
  ],
  noticeUnavailable: [
    "Dated notice unavailable",
    "मिति खुलेको सूचना उपलब्ध भएन",
  ],
  rbbBoundary: [
    "The published bands overlap at exactly one year and quote different rates. This comparison awaits clarification.",
    "प्रकाशित दुई अवधि ठीक एक वर्षमा जुध्छन् र ब्याजदर फरक छन्। बैंकको स्पष्टीकरण आउन बाँकी छ।",
  ],
  fdMarketIntro: [
    "Select a group to see the latest check for each bank. Each check covers an ordinary individual NPR deposit for exactly 12 months.",
    "प्रत्येक बैंकको पछिल्लो जाँच हेर्न समूह छान्नुहोस्। जाँचले ठीक १२ महिनाको व्यक्तिगत साधारण रुपैयाँ मुद्दती निक्षेप समेट्छ।",
  ],
  otherBankTerms: ["Other published terms", "अन्य प्रकाशित सर्तहरू"],
  balanceGoal: [
    "Find accounts for my balance",
    "मेरो मौज्दातअनुसार खाता खोज्नुहोस्",
  ],
  myBalance: [
    "Planned balance in NPR (optional)",
    "राख्ने मौज्दात, रुपैयाँमा (ऐच्छिक)",
  ],
  balanceFits: ["Meets the listed minimum", "न्यूनतम मौज्दात पुग्छ"],
  balanceShort: ["Below the listed minimum", "न्यूनतम मौज्दात पुग्दैन"],
  balanceUnknown: ["Minimum unconfirmed", "न्यूनतम मौज्दात पुष्टि हुन बाँकी"],
  balanceStatus: ["Your balance", "तपाईंको मौज्दात"],
  balanceInvalid: [
    "Enter zero or a positive NPR amount with up to two decimal places.",
    "शून्य वा धनात्मक रकम लेख्नुहोस्। दशमलवपछि दुई अङ्कसम्म राख्न सकिन्छ।",
  ],
  bankProductCoverage: ["Product coverage", "सेवाको विवरण उपलब्धता"],
  oneYearDeposit: [
    "Individual 12-month fixed deposit",
    "व्यक्तिगत १२ महिने मुद्दती निक्षेप",
  ],
  termsPending: [
    "Details pending · check bank",
    "विवरण पुष्टि हुन बाँकी · बैंकमा हेर्नुहोस्",
  ],
  pendingReview: [
    "Notice captured · awaiting review",
    "सूचना संकलित · समीक्षा बाँकी",
  ],
  usageCost: ["Estimate everyday fees", "दैनिक बैंकिङ शुल्कको अनुमान"],
  usageScope: [
    "Estimate a year of cash withdrawals at other banks’ ATMs in Nepal, with optional mobile banking renewal for one existing account. The subtotal covers only these selected charges.",
    "नेपालमा अन्य बैंकका एटीएमबाट वर्षभरि नगद झिक्दाको शुल्क हेर्नुहोस्। चाहनुहुन्छ भने एउटा चालु खाताको मोबाइल बैंकिङ नवीकरण पनि जोड्नुहोस्। जम्मामा छानिएका शुल्क मात्र समावेश हुन्छन्।",
  ],
  domesticWithdrawals: [
    "Withdrawals in one year (0–365)",
    "एक वर्षमा नगद झिक्ने पटक (०–३६५)",
  ],
  includeRenewal: [
    "Include annual mobile banking renewal",
    "मोबाइल बैंकिङको वार्षिक नवीकरण जोड्नुहोस्",
  ],
  calculateCost: ["Calculate fees", "शुल्क गणना गर्नुहोस्"],
  costBanks: [
    "Banks with relevant fee details",
    "सम्बन्धित शुल्क विवरण भएका बैंक",
  ],
  selectedCosts: [
    "Annual fees for your selections",
    "तपाईंले छानेका सेवाको वार्षिक शुल्क",
  ],
  costTotal: ["Subtotal", "जम्मा"],
  costIncomplete: ["Incomplete", "अपूरो"],
  withdrawalError: [
    "Enter a whole number from 0 to 365.",
    "० देखि ३६५ सम्मको पूर्ण सङ्ख्या लेख्नुहोस्।",
  ],
  savingsAccounts: ["Savings accounts", "बचत खाता"],
  savingsGoal: [
    "Compare published annual rates and minimum balances for named NPR accounts.",
    "रुपैयाँका बचत खाताको प्रकाशित वार्षिक ब्याजदर र न्यूनतम मौज्दात तुलना गर्नुहोस्।",
  ],
  savingsCoverage: [
    "Banks with a captured notice in this edition",
    "यस संस्करणमा सूचना संकलन भएका बैंक",
  ],
  availableAccounts: [
    "All accounts with a captured notice",
    "सूचना संकलन भएका सबै खाता",
  ],
  showAccounts: ["Show accounts", "खाता देखाउनुहोस्"],
  savingsChecked: ["Sources checked", "स्रोत जाँचिएको मिति"],
  accountTerms: ["Published savings terms", "प्रकाशित बचत सर्तहरू"],
  yearlyRate: ["Annual interest", "वार्षिक ब्याजदर"],
  savingsMinimum: ["Minimum balance", "न्यूनतम मौज्दात"],
  rateNotice: ["Bank notice", "बैंकको सूचना"],
  noSavingsReading: [
    "Savings terms await verification.",
    "बचत खाताका सर्तको पुष्टि बाँकी छ।",
  ],
  openingDocs: ["Opening this account", "यो खाता खोल्न"],
  nepalOpening: [
    "Bring your National ID, another accepted ID and recent passport-size photos. The bank also lists additional KYC evidence and a nominee declaration with the nominee’s ID and photo.",
    "राष्ट्रिय परिचयपत्र, अर्को मान्य परिचयपत्र र हालसालैका पासपोर्ट साइजका फोटो चाहिन्छ। बैंकले थप ग्राहक पहिचान प्रमाण र इच्छाइएको व्यक्तिको परिचयपत्र तथा फोटोसहितको घोषणा पनि मागेको छ।",
  ],
  accountRequirements: [
    "Bank’s account-opening checklist",
    "बैंकको खाता खोल्ने कागजात सूची",
  ],
  availableBreakdowns: [
    "Which banks have fee details?",
    "कुन बैंकका शुल्क विवरण उपलब्ध छन्?",
  ],
  coverageBreakdownIntro: [
    "Choose a bank below to start a comparison. Each product lists the edition used for its fee details.",
    "तुलना सुरु गर्न तल बैंक छान्नुहोस्। प्रत्येक सेवाको शुल्क कुन सूचीबाट लिइएको हो भन्ने पनि देखाइएको छ।",
  ],
  copyComparison: ["Copy comparison link", "तुलनाको लिङ्क कपी गर्नुहोस्"],
  linkCopied: ["Link copied", "लिङ्क कपी भयो"],
  copyManually: ["Select and copy this link", "यो लिङ्क छानेर कपी गर्नुहोस्"],
  filterFeeRows: ["Filter fee categories", "शुल्कका प्रकार छान्नुहोस्"],
  allFeeRows: ["All fees", "सबै शुल्क"],
  bothFeeRows: ["Listed by both banks", "दुवै बैंकको विवरण छ"],
  gapFeeRows: ["Missing details", "विवरण अपूरो छ"],
  noSharedFeeRows: [
    "No fee category here has published figures for both banks.",
    "यी शुल्कमध्ये कुनैमा पनि दुवै बैंकका प्रकाशित रकम उपलब्ध छैनन्।",
  ],
  noGapFeeRows: [
    "Both banks have published figures in every fee category shown.",
    "यहाँका सबै शुल्कका प्रकारमा दुवै बैंकका प्रकाशित रकम उपलब्ध छन्।",
  ],
  focusProduct: ["What do you want to compare?", "के तुलना गर्न चाहनुहुन्छ?"],
  withCoverage: ["Banks with comparison data", "तुलना विवरण भएका बैंक"],
  trackedNotices: [
    "Banks with tracked rate notices",
    "ब्याजदर सूचना अनुगमन गरिएका बैंक",
  ],
  otherBanks: ["Other listed banks", "सूचीका अन्य बैंक"],
  allProducts: ["All covered products", "समेटिएका सबै सेवा"],
  officialSources: ["Official bank sources", "बैंकका आधिकारिक स्रोत"],
  branchFinder: ["Find a bank branch", "बैंकको शाखा खोज्नुहोस्"],
  branchScope: [
    "Search branch names and codes listed for NCHL-IPS payments. Check opening hours and available services with the bank.",
    "NCHL-IPS भुक्तानी सूचीमा भएका शाखाको नाम र कोड खोज्नुहोस्। खुल्ने समय र उपलब्ध सेवा बैंकसँग पुष्टि गर्नुहोस्।",
  ],
  branchEdition: ["NCHL list · 12 January 2026", "NCHL सूची · १२ जनवरी २०२६"],
  anyBank: ["All banks", "सबै बैंक"],
  branchSearch: [
    "Branch name (English) or code",
    "शाखाको नाम (अङ्ग्रेजीमा) वा कोड",
  ],
  findBranches: ["Search branches", "शाखा खोज्नुहोस्"],
  branchResults: ["Matching branches", "खोजसँग मिल्ने शाखा"],
  bankBranches: ["Bank’s branch directory", "बैंकको शाखा सूची"],
  nrbBranches: ["NRB branch directory", "राष्ट्र बैंकको शाखा सूची"],
  ipsBranches: ["NCHL-IPS branch records", "NCHL-IPS शाखा विवरण"],
  branchName: ["Branch", "शाखा"],
  branchCode: ["Branch code", "शाखा कोड"],
  ipsBankCode: ["Bank code", "बैंक कोड"],
  noBranchRows: [
    "No matching entry in this edition. Try another search or check the official directory.",
    "यस संस्करणमा मिल्ने विवरण भेटिएन। अर्को नामले खोज्नुहोस् वा आधिकारिक सूची हेर्नुहोस्।",
  ],
  resultPages: ["Results pages", "नतिजाका पृष्ठ"],
  previousPage: ["Previous", "अघिल्लो"],
  nextPage: ["Next", "अर्को"],
  operationDate: ["Operation date", "सञ्चालन मिति"],
  jointOperationDate: [
    "Joint operation after merger or acquisition",
    "गाभिएपछि वा प्राप्तिपछि संयुक्त सञ्चालन",
  ],
  paidUp: ["Paid-up capital (NPR crore)", "चुक्ता पुँजी (रु करोड)"],
  allBanks: ["Bank directory", "बैंक सूची"],
  headOffice: ["Head office", "प्रधान कार्यालय"],
  workingArea: ["Licensed service area", "इजाजतप्राप्त कार्यक्षेत्र"],
  registryEdition: ["As of mid-October 2026", "२०८३ असोज मसान्तसम्म"],
  officialSchedule: [
    "Bank’s published fee schedule",
    "बैंकले प्रकाशित गरेको शुल्क सूची",
  ],
  directoryIntro: [
    "Browse Nepal’s commercial and development banks by licence class.",
    "इजाजतको वर्गअनुसार नेपालका वाणिज्य र विकास बैंकहरू हेर्नुहोस्।",
  ],
  pairIntro: [
    "Choose two banks to compare their service areas and published product charges.",
    "कार्यक्षेत्र र प्रकाशित सेवा शुल्क तुलना गर्न दुई बैंक छान्नुहोस्।",
  ],
  firstBank: ["First bank", "पहिलो बैंक"],
  secondBank: ["Second bank", "दोस्रो बैंक"],
  differentBanks: ["Choose two different banks.", "दुई फरक बैंक छान्नुहोस्।"],
  depositGoal: [
    "Find a rate for your deposit term",
    "आफ्नो अवधिअनुसार ब्याजदर खोज्नुहोस्",
  ],
  cardGoal: [
    "Compare the cost to issue or reload a card",
    "कार्ड जारी गर्दा वा रकम थप्दा लाग्ने शुल्क हेर्नुहोस्",
  ],
  mobileGoal: [
    "Check registration, renewal and PIN reset fees",
    "दर्ता, नवीकरण र पिन रिसेट शुल्क हेर्नुहोस्",
  ],
  feeContext: [
    "Amounts come from the linked editions. Check the applicable product and billing period.",
    "रकम सम्बन्धित शुल्क सूचीको संस्करणबाट लिइएको हो। लागू हुने सेवा र शुल्क अवधि हेर्नुहोस्।",
  ],
  publisherRates: ["Bank’s interest notices", "बैंकका ब्याजदर सूचना"],
  publisherDeposits: ["Bank’s deposit products", "बैंकका निक्षेप योजना"],
  publisherSite: ["Visit the bank website", "बैंकको वेबसाइट हेर्नुहोस्"],
  bestFor: ["Best by use", "प्रयोजनअनुसार छनोट"],
  bestForIntro: [
    "Find the highest reviewed deposit rate or the lowest reviewed card fee for a specific use. Banks with equal figures share first place.",
    "आफ्नो प्रयोजनअनुसार समीक्षा भएको उच्चतम निक्षेप ब्याजदर वा न्यूनतम कार्ड शुल्क हेर्नुहोस्। समान दर वा शुल्क भएका बैंकले संयुक्त पहिलो स्थान पाउँछन्।",
  ],
  noRankedGoals: [
    "Rankings are awaiting approved offers. You can still compare published notices and fee schedules below.",
    "वरीयताका लागि प्रस्ताव स्वीकृत हुन बाँकी छ। तल प्रकाशित ब्याजदर र शुल्क सूची तुलना गर्न सक्नुहुन्छ।",
  ],
  oneYearMaturity: [
    "Save for a year and collect interest at maturity",
    "एक वर्ष बचत गरेर अन्त्यमा ब्याज लिने",
  ],
  oneYearQuarterly: [
    "Save for a year and receive interest quarterly",
    "एक वर्ष बचत गरेर हरेक तीन महिनामा ब्याज लिने",
  ],
  openVirtual: ["Get a virtual dollar card", "भर्चुअल डलर कार्ड लिने"],
  reloadVirtualApp: [
    "Reload a virtual card through the app",
    "एपबाट भर्चुअल कार्डमा रकम थप्ने",
  ],
  reloadVirtualBranch: [
    "Reload a virtual card at a branch",
    "शाखाबाट भर्चुअल कार्डमा रकम थप्ने",
  ],
  bankFeesTitle: ["Bank fees", "बैंक शुल्क"],
  homeTitle: ["Bank rates and fees in Nepal", "नेपालका बैंकको ब्याजदर र शुल्क"],
  fdTitle: [
    "Fixed deposit comparison in Nepal",
    "नेपालका मुद्दती निक्षेपको तुलना",
  ],
  fdDescription: [
    "Compare advertised annual rates by deposit term and interest payout schedule.",
    "निक्षेप अवधि र ब्याज भुक्तानी तालिकाअनुसार प्रकाशित वार्षिक ब्याजदर तुलना गर्नुहोस्।",
  ],
  cardFeeTitle: [
    "Dollar card fee comparison in Nepal",
    "नेपालका डलर कार्डको शुल्क तुलना",
  ],
  coverageDescription: [
    "See which products and sources are covered and the status of reviewed offers.",
    "समेटिएका सेवा, स्रोत र समीक्षा भएका प्रस्तावको अवस्था हेर्नुहोस्।",
  ],
  methodDescription: [
    "How we verify rates, compare fees and handle tied offers.",
    "हामी ब्याजदर कसरी पुष्टि गर्छौँ र बराबरीका प्रस्ताव तथा शुल्कको तुलना कसरी गर्छौँ भन्ने जान्नुहोस्।",
  ],
  reviewTitle: ["Source review walkthrough", "स्रोत समीक्षा अभ्यास"],
  reviewDescription: [
    "Follow a fictional bank notice through review and publication.",
    "एउटा काल्पनिक बैंक सूचनाको समीक्षा र प्रकाशन प्रक्रिया हेर्नुहोस्।",
  ],
  sourceDescription: [
    "View the cited passage, publication details and verification date.",
    "उद्धृत अंश, प्रकाशन विवरण र पुष्टि गरिएको मिति हेर्नुहोस्।",
  ],

  compareMobileFees: ["Compare fees", "शुल्क तुलना गर्नुहोस्"],
  mobileSignupFee: ["Sign-up", "दर्ता"],
  mobileAnnualFee: ["Annual", "वार्षिक"],
  mobileFeeBank: ["Bank", "बैंक"],
  feePerAccount: ["per account", "प्रति खाता"],
  comparePinReset: [
    "Compare PIN reset fees",
    "पिन रिसेट शुल्क तुलना गर्नुहोस्",
  ],
  pinResetChannelUnknown: [
    "Method unspecified",
    "रिसेट गर्ने तरिका खुलाइएको छैन",
  ],
  mobileFeeUnknown: ["Unconfirmed", "पुष्टि भएको छैन"],
  mobileBankingFees: ["Mobile banking fees", "मोबाइल बैंकिङ शुल्क"],

  compareCardCharges: ["Compare charges", "शुल्क तुलना गर्नुहोस्"],
  reload: ["Reload", "रकम थप्दा"],
  payment: ["Payment", "भुक्तानी"],
  cardRenewal: ["Renewal", "नवीकरण"],
  counter: ["Counter only", "काउन्टरमा मात्र"],
  firstLoad: ["Includes the first load", "पहिलो पटक रकम थप्दा पनि"],
  crossBorder: ["Cross-border transactions", "सीमापार कारोबार"],
  virtualReplacement: [
    "Virtual · renewal or replacement",
    "भर्चुअल · नवीकरण वा प्रतिस्थापन",
  ],
  physicalReplacement: [
    "Physical · renewal or replacement",
    "भौतिक · नवीकरण वा प्रतिस्थापन",
  ],
  renewalTiming: [
    "A renewal fee applies when the card is renewed. Check the bank’s validity and terms below.",
    "कार्ड नवीकरण गर्दा नवीकरण शुल्क लाग्छ। बैंकको मान्य अवधि र सर्तहरू तल हेर्नुहोस्।",
  ],
  decodedCardFees: ["Dollar card fees by bank", "बैंकअनुसार डलर कार्ड शुल्क"],
  feeMinimum: ["Minimum", "न्यूनतम"],

  publishedRates: ["Published annual rates", "प्रकाशित वार्षिक ब्याजदर"],
  publishedRatesScope: [
    "The notices give the rate for this term. Check the payout schedule and early withdrawal terms with the bank.",
    "सूचनामा यो अवधिको दर दिइएको छ। भुक्तानी तालिका र समयअघि रकम निकाल्ने सर्त बैंकसँग बुझ्नुहोस्।",
  ],

  exploreFeatures: ["Explore by feature", "सुविधाअनुसार हेर्नुहोस्"],
  dollarCardFees: ["Dollar card fees", "डलर कार्डको शुल्क"],

  decodeTariff: [
    "Compare bank rates and fees in Nepal.",
    "नेपालका बैंकको ब्याजदर र शुल्क तुलना गर्नुहोस्।",
  ],
  tariffUnavailable: [
    "A plain-language tariff for this bank is still being prepared.",
    "यस बैंकको शुल्क सूचीको सरल व्याख्या तयार हुन बाँकी छ।",
  ],

  bankingChoices: ["What are you looking for?", "के खोज्दै हुनुहुन्छ?"],
  intentCompare: ["Compare banks", "बैंक तुलना"],
  intentExisting: ["Use my bank", "आफ्नो बैंक"],
  intentFeature: ["Find a feature", "सुविधा खोज्नुहोस्"],
  searchBanks: ["Bank name or acronym", "बैंकको नाम वा छोटकरी नाम"],
  bankSearchAction: ["Find bank", "बैंक खोज्नुहोस्"],
  homeIntro: [
    "The No Series is an independent guide to fixed deposits, dollar cards and mobile banking in Nepal.",
    "द नो सिरिज नेपालका मुद्दती निक्षेप, डलर कार्ड र मोबाइल बैंकिङबारे स्वतन्त्र जानकारी दिने गाइड हो।",
  ],
  searchHint: [
    "Choose a bank to see its available fee breakdowns.",
    "उपलब्ध शुल्क विवरण हेर्न बैंक छान्नुहोस्।",
  ],
  searchExample: ["Try NMB or Nabil", "जस्तै एनएमबी वा नबिल"],
  independence: [
    "The No Series is independent of the banks it compares.",
    "द नो सिरिजले स्वतन्त्र रूपमा बैंकहरूको तुलना गर्छ।",
  ],
  rankedRateAge: [
    `Only rates verified within the past ${numberText("en", methodology.rateMaxDays)} days qualify for a ranked pick.`,
    `पछिल्ला ${numberText("ne", methodology.rateMaxDays)} दिनभित्र पुष्टि भएका ब्याजदर मात्र वरीयतामा पर्छन्।`,
  ],
  methodMobile: ["Mobile banking fees", "मोबाइल बैंकिङ शुल्क"],
  methodMobileText: [
    "We show sign-up, annual and PIN reset charges separately. Each breakdown names the bank’s fee schedule. An unconfirmed fee stays marked as such, even when another bank lists the same service as free.",
    "दर्ता, वार्षिक सेवा र पिन रिसेटको शुल्क छुट्टाछुट्टै देखाउँछौँ। प्रत्येक विवरणमा बैंकको शुल्क सूचीको स्रोत दिइएको छ। अर्को बैंकले त्यही सेवा निःशुल्क दिए पनि पुष्टि हुन बाँकी शुल्कलाई शून्य मान्दैनौँ।",
  ],
  verifySource: ["Check the source", "स्रोत जाँच्छौँ"],
  matchChoice: ["Match your choices", "छनोटसँग मिलाउँछौँ"],
  orderPicks: [
    "Rank matching offers. Equal values share a place",
    "मिल्ने प्रस्ताव क्रमबद्ध गर्छौँ। बराबर भए एउटै स्थान दिन्छौँ",
  ],
  noBanksFound: [
    "No matching bank. Try its full name or acronym.",
    "बैंक भेटिएन। पूरा वा छोटकरी नाम खोज्नुहोस्।",
  ],
  registry: ["Nepal Rastra Bank register", "नेपाल राष्ट्र बैंकको सूची"],
  commercialBank: ["Commercial bank", "वाणिज्य बैंक"],
  developmentBank: ["Development bank", "विकास बैंक"],
  directoryOnly: [
    "Listed in the register. Product sources are yet to be added.",
    "राष्ट्र बैंकको सूचीमा छ। उत्पादनका स्रोत थप्न बाँकी छ।",
  ],
  chooseBank: ["Choose your bank", "आफ्नो बैंक छान्नुहोस्"],
  bankRates: ["Check deposit rates", "निक्षेपका ब्याजदर हेर्नुहोस्"],
  cardTerms: ["Official dollar card terms", "डलर कार्डका आधिकारिक सर्तहरू"],
  cardFees: ["Check dollar card fees", "डलर कार्ड शुल्क हेर्नुहोस्"],
  quarterlyInterest: ["Quarterly interest", "त्रैमासिक ब्याज"],
  virtualCardFeature: ["Virtual dollar card", "भर्चुअल डलर कार्ड"],
  nmbPublishedFees: [
    "Bank FAQ lists NPR 500 to issue and NPR 500 per reload.",
    "बैंकको प्रश्नोत्तरमा जारी गर्न रु ५०० र हरेक पटक रकम थप्न रु ५०० उल्लेख छ।",
  ],
  nmbTariff: ["NMB tariff archive", "एनएमबीको शुल्क सूची"],
  officialCardSources: [
    "Bank fee schedules and card terms",
    "बैंकका शुल्क र कार्डका सर्तहरू",
  ],
  guideOptions: ["Options", "विकल्पहरू"],

  bankNotices: ["Published bank notices", "बैंकका प्रकाशित सूचनाहरू"],
  noticeScope: [
    "Advertised annual rates in official notices for personal NPR deposits. Payout and withdrawal terms still need separate confirmation.",
    "व्यक्तिगत नेपाली रुपैयाँ निक्षेपका लागि आधिकारिक सूचनामा प्रकाशित वार्षिक ब्याजदर। भुक्तानी र रकम निकाल्ने सर्त छुट्टै पुष्टि गर्नुपर्छ।",
  ],
  noBankNotices: [
    "Current notices are unavailable. Check back later.",
    "हालका सूचना उपलब्ध छैनन्। पछि फेरि हेर्नुहोस्।",
  ],

  methodEditorialDeposit: ["Fixed deposit picks", "मुद्दती निक्षेपका विकल्प"],
  methodEditorialDepositText: [
    "We order verified advertised annual rates for the selected term and payout schedule. Each option lists its eligible deposit range.",
    "छानिएको अवधि र भुक्तानी तालिकाका लागि पुष्टि भएका प्रकाशित वार्षिक ब्याजदर क्रमबद्ध गर्छौँ। हरेक विकल्पमा योग्य निक्षेप रकमको दायरा देखाइन्छ।",
  ],
  methodEditorialCard: ["Dollar card picks", "डलर कार्डका विकल्प"],
  methodEditorialCardText: [
    "We order the selected flat NPR fee for the same card type. Other fees and amount-dependent charges can affect the cost of using the card.",
    "उही प्रकारका कार्डका लागि छानिएको निश्चित नेपाली रुपैयाँको शुल्क क्रमबद्ध गर्छौँ। अन्य शुल्क र रकमअनुसार लाग्ने शुल्कले कार्ड चलाउने खर्च बदल्न सक्छ।",
  ],

  beforeChoose: ["Know before you choose.", "छान्नुअघि थाहा पाउनुहोस्।"],
  pickCategory: ["What are you looking into?", "केबारे बुझ्न चाहनुहुन्छ?"],
  categories: ["Categories", "विषयहरू"],
  depositCatchLead: [
    "Withdrawing early can reduce the interest you receive.",
    "समयअघि रकम निकाल्दा पाउने ब्याज घट्न सक्छ।",
  ],
  cardCatchLead: [
    "A low issuance fee can hide costly reloads. App and branch fees can differ.",
    "कार्ड जारी गर्ने शुल्क कम भए पनि रकम थप्न महँगो पर्न सक्छ। एप र शाखाको शुल्क फरक हुन सक्छ।",
  ],
  choosePriority: ["What matters to you?", "तपाईंलाई कुन कुरा महत्त्वपूर्ण छ?"],
  changePriority: ["Change your choice", "आफ्नो छनोट बदल्नुहोस्"],
  chooseFee: ["Fee to compare", "तुलना गर्ने शुल्क"],
  appFee: ["App reload fee", "एपबाट रकम थप्ने शुल्क"],
  branchFee: ["Branch reload fee", "शाखाबाट रकम थप्ने शुल्क"],
  cardFormat: ["Card type", "कार्डको प्रकार"],
  compareDeposits: [
    "Compare deposit rates",
    "निक्षेपका ब्याजदर तुलना गर्नुहोस्",
  ],
  compareCardFees: ["Compare card fees", "कार्ड शुल्क तुलना गर्नुहोस्"],
  highestRate: ["Highest advertised rate", "सबैभन्दा उच्च प्रकाशित ब्याजदर"],
  lowestFee: ["Lowest verified fee", "सबैभन्दा कम पुष्टि भएको शुल्क"],
  noVerifiedPicks: [
    "We haven’t verified an option for this choice yet.",
    "यो छनोटका लागि कुनै विकल्प अझै पुष्टि भएको छैन।",
  ],
  unavailablePicks: [
    "We couldn’t load the options. Try refreshing this page.",
    "विकल्पहरू लोड गर्न सकिएन। पृष्ठ फेरि खोल्नुहोस्।",
  ],
  yourOptions: ["Options for your choice", "तपाईंको छनोटका विकल्पहरू"],
  otherOptions: ["Other verified options", "अन्य पुष्टि भएका विकल्पहरू"],
  otherSources: ["Other terms and sources", "अन्य सर्त र स्रोतहरू"],
  viewEvidence: ["See sources", "स्रोत हेर्नुहोस्"],
  depositFrom: ["Deposit from", "निक्षेप कम्तीमा"],
  depositAbove: ["Deposit above", "निक्षेप यो रकमभन्दा बढी"],
  depositUpTo: ["Up to", "बढीमा"],
  depositUnder: ["Under", "यो रकमभन्दा कम"],
  accountNeeded: ["Requires an account at the bank.", "बैंकमा खाता आवश्यक छ।"],

  series: ["THE NO SERIES", "द नो सिरिज"],
  money: ["Money", "पैसा"],
  skip: ["Skip to content", "मुख्य सामग्रीमा जानुहोस्"],
  home: ["Home", "गृहपृष्ठ"],
  methodology: ["Methodology", "गणना विधि"],
  coverage: ["Coverage", "उपलब्ध विवरण"],
  menu: ["Menu", "मेनु"],
  fixed: ["Fixed deposits", "मुद्दती निक्षेप"],
  cards: ["Dollar cards", "डलर कार्ड"],
  fixedTitle: [
    "Compare fixed deposits in Nepal.",
    "नेपालका मुद्दती निक्षेप तुलना गर्नुहोस्।",
  ],
  fixedIntro: [
    "See estimated interest and check the terms before you deposit.",
    "रकम राख्नुअघि अनुमानित ब्याज र लागू हुने सर्तहरू हेर्नुहोस्।",
  ],
  fixedAction: ["Compare fixed deposits", "मुद्दती निक्षेप तुलना गर्नुहोस्"],
  cardTitle: [
    "Compare dollar cards in Nepal.",
    "नेपालका डलर कार्ड तुलना गर्नुहोस्।",
  ],
  cardIntro: [
    "Check what a dollar card could cost based on how you top it up and how long you keep it.",
    "रकम थप्ने तरिका र प्रयोग अवधिअनुसार डलर कार्डको अनुमानित खर्च हेर्नुहोस्।",
  ],
  cardAction: ["Compare dollar cards", "डलर कार्ड तुलना गर्नुहोस्"],
  independent: ["Independent banking comparison", "स्वतन्त्र बैंकिङ तुलना"],
  choose: ["What do you want to compare?", "के तुलना गर्न चाहनुहुन्छ?"],
  fixedShort: [
    "Interest, payment timing and early withdrawal.",
    "ब्याज, भुक्तानीको समय र समयअघिको निकासी।",
  ],
  cardShort: [
    "Issuance, annual charges and top-up fees.",
    "कार्ड जारी गर्ने, वार्षिक र रकम थप्ने शुल्क।",
  ],
  certificate: ["Fixed deposit", "मुद्दती निक्षेप"],
  comparisonGuide: ["Calculation guide", "गणना मार्गदर्शिका"],
  deposit: ["Deposit amount", "निक्षेप रकम"],
  interest: ["Interest payments", "ब्याज भुक्तानी"],
  maturityPayment: ["Maturity payment", "अवधि सकिँदा पाउने रकम"],
  depositsWhat: ["What you put in", "सुरुमा राख्ने रकम"],
  interestWhat: ["What you earn", "पाउने ब्याज"],
  maturityWhat: ["What you receive at the end", "अन्त्यमा पाउने रकम"],
  issuance: ["Issuance", "कार्ड जारी शुल्क"],
  renewal: ["Annual charge", "वार्षिक शुल्क"],
  topUp: ["Top-up fees", "रकम थप्ने शुल्क"],
  issueWhat: ["What you pay to start", "सुरुमा तिर्ने रकम"],
  renewalWhat: ["What repeats each year", "हरेक वर्ष लाग्ने शुल्क"],
  topUpWhat: ["What each reload costs", "हरेक पटक रकम थप्दा लाग्ने शुल्क"],
  catch: ["The Catch", "ध्यान दिनुपर्ने सर्त"],
  catchHero: [
    "Check what changes if you withdraw early.",
    "समयअघि निकाल्दा के बदलिन्छ हेर्नुहोस्।",
  ],
  cardCatch: [
    "Check whether app and branch reloads cost different amounts.",
    "एप र शाखाबाट रकम थप्दा शुल्क फरक पर्छ कि हेर्नुहोस्।",
  ],
  trust: [
    "Explore our sources and coverage.",
    "हाम्रा स्रोत र उपलब्ध विवरण हेर्नुहोस्।",
  ],
  back: ["Back", "पछाडि"],
  setup: ["Your scenario", "तपाईंको विवरण"],
  outcome: ["Comparison", "तुलना"],
  fdSetup: ["Set up your deposit.", "निक्षेपको विवरण छान्नुहोस्।"],
  cardSetup: ["How will you use the card?", "कार्ड कसरी प्रयोग गर्नुहुन्छ?"],
  setupIntro: [
    "Enter the terms you want to compare.",
    "तुलना गर्न चाहेका सर्तहरू छान्नुहोस्।",
  ],
  fdDetails: ["Deposit details", "निक्षेपको विवरण"],
  cardDetails: ["Card use", "कार्डको प्रयोग"],
  currency: ["Currency", "मुद्रा"],
  commonTerms: ["Common deposit terms", "प्रचलित निक्षेप अवधि"],
  term: ["Term in months", "अवधि (महिना)"],
  payout: ["Interest payout", "ब्याज भुक्तानी"],
  anyPayout: [
    "Any verified payout schedule",
    "जुनसुकै पुष्टि भएको भुक्तानी तालिका",
  ],
  maturity: ["At maturity", "अवधि सकिँदा"],
  quarterly: ["Every three months", "हरेक तीन महिनामा"],
  customer: ["Account holder", "खातावाला"],
  individual: ["Individual", "व्यक्तिगत"],
  institutional: ["Institutional", "संस्थागत"],
  assumptions: ["Date and assumptions", "मिति र गणनाका आधार"],
  asOf: ["Comparison date in Nepal (AD)", "नेपालको तुलना मिति (ईस्वी)"],
  depositAssumptions: [
    "We match the exact amount, term and payout schedule. Net interest depends on verified fees and tax.",
    "हामी ठ्याक्कै मिल्ने रकम, अवधि र भुक्तानी तालिका हेर्छौँ। खुद ब्याज पुष्टि भएका शुल्क र करमा निर्भर हुन्छ।",
  ],
  cardAssumptions: [
    "We use your selected reload channel. The estimate covers issuance, annual charges and reloads in NPR.",
    "तपाईंले छानेको माध्यमअनुसार गणना हुन्छ। अनुमानमा जारी शुल्क, वार्षिक शुल्क र रकम थप्ने शुल्क नेपाली रुपैयाँमा समावेश हुन्छ।",
  ],
  reset: ["Reset", "फेरि सुरु गर्नुहोस्"],
  seeResults: ["See comparison", "तुलना हेर्नुहोस्"],
  checking: ["Checking coverage…", "उपलब्ध विवरण जाँचिँदै छ…"],
  channel: ["How do you reload?", "रकम कसरी थप्नुहुन्छ?"],
  app: ["Mobile app", "मोबाइल एप"],
  branch: ["Bank branch", "बैंक शाखा"],
  form: ["Card format", "कार्डको प्रकार"],
  any: ["Any format", "जुनसुकै प्रकार"],
  virtual: ["Virtual", "भर्चुअल"],
  physical: ["Physical", "भौतिक"],
  account: [
    "Do you already have an account with the issuer?",
    "कार्ड जारी गर्ने संस्थामा तपाईंको खाता छ?",
  ],
  yes: ["Yes", "छ"],
  no: ["No", "छैन"],
  reloads: ["Reloads per year", "वर्षमा रकम थप्ने पटक"],
  years: ["Comparison period", "तुलना अवधि"],
  oneYear: ["1 year", "१ वर्ष"],
  twoYears: ["2 years", "२ वर्ष"],
  invalid: ["Check the highlighted input.", "देखाइएको विवरण जाँच्नुहोस्।"],
  amountError: [
    "Enter a positive amount with up to two decimal places.",
    "शून्यभन्दा बढी रकम बढीमा दुई दशमलव स्थानसहित लेख्नुहोस्।",
  ],
  termError: [
    "Enter a whole number from 1 to 120.",
    "१ देखि १२० सम्मको पूर्ण सङ्ख्या लेख्नुहोस्।",
  ],
  reloadError: [
    "Enter a whole number from 0 to 120.",
    "० देखि १२० सम्मको पूर्ण सङ्ख्या लेख्नुहोस्।",
  ],
  offline: [
    "You’re offline. Your answers are still here. Reconnect and try again.",
    "इन्टरनेट जडान छैन। तपाईंको विवरण सुरक्षित छ। जडान भएपछि फेरि प्रयास गर्नुहोस्।",
  ],
  failure: [
    "We couldn’t check the comparison. Your answers are still here. Try again.",
    "तुलना जाँच्न सकिएन। तपाईंको विवरण सुरक्षित छ। फेरि प्रयास गर्नुहोस्।",
  ],
  edit: ["Edit scenario", "विवरण बदल्नुहोस्"],
  results: ["Your comparison.", "तपाईंको तुलना।"],
  months: ["months", "महिना"],
  perYear: ["per year", "प्रतिवर्ष"],
  offers: ["Eligible offers", "योग्य प्रस्ताव"],
  reviewed: ["Institutions reviewed", "समीक्षा गरिएका संस्था"],
  missing: ["Incomplete evidence", "अपूर्ण प्रमाण"],
  ineligible: ["Outside scenario", "विवरणसँग नमिल्ने"],
  stale: ["Verification expired", "पुष्टि अवधि सकिएको"],
  expired: ["Offer expired", "प्रस्तावको अवधि सकिएको"],
  future: ["Future offer", "पछि लागू हुने प्रस्ताव"],
  changed: ["Source changed", "स्रोत बदलिएको"],
  disputed: ["Conflicting evidence", "विरोधाभासी प्रमाण"],
  pending: ["Awaiting review", "समीक्षा बाँकी"],
  suppressed: ["Withheld from comparison", "तुलनाबाट हटाइएको"],
  overlap: ["Overlapping offers", "सर्त जुधेका प्रस्ताव"],
  unavailable: [
    "Verified offers aren’t available yet.",
    "पुष्टि भएका प्रस्ताव अझै उपलब्ध छैनन्।",
  ],
  unavailableBody: [
    "We’ll list offers after their applicable terms and sources have been reviewed.",
    "लागू हुने सर्त र स्रोतको समीक्षा भएपछि प्रस्तावहरू यहाँ देखिनेछन्।",
  ],
  unsupported: [
    "This scenario is outside current coverage.",
    "यो विवरण हालको तुलनामा समावेश छैन।",
  ],
  unsupportedBody: [
    "The pilot covers individual users. Fixed-deposit comparisons use NPR.",
    "हाल व्यक्तिगत प्रयोगकर्ता समेटिन्छन्। मुद्दती निक्षेपको तुलना नेपाली रुपैयाँमा हुन्छ।",
  ],
  "no-match": [
    "No verified offer matches this scenario.",
    "यो विवरणसँग मिल्ने पुष्टि भएको प्रस्ताव भेटिएन।",
  ],
  "no-matchBody": [
    "Check the exclusions or change your scenario.",
    "हटाइएका प्रस्तावका कारण हेर्नुहोस् वा आफ्नो विवरण बदल्नुहोस्।",
  ],
  revoked: ["This release has been withdrawn.", "यो प्रकाशन फिर्ता लिइएको छ।"],
  revokedBody: [
    "Check coverage for updates before comparing again.",
    "फेरि तुलना गर्नुअघि उपलब्ध विवरण हेर्नुहोस्।",
  ],
  cardVirtual: ["Virtual cards", "भर्चुअल कार्ड"],
  cardPhysical: ["Physical cards", "भौतिक कार्ड"],
  unranked: ["Eligible with incomplete estimates", "योग्य तर अनुमान अपूर्ण"],
  card: [
    "Dollar cards are grouped by format.",
    "डलर कार्डलाई प्रकारअनुसार समूह बनाइएको छ।",
  ],
  netSort: [
    "Fixed deposits are grouped by payout schedule.",
    "मुद्दती निक्षेपलाई भुक्तानी तालिकाअनुसार समूह बनाइएको छ।",
  ],
  sort: ["Sort within each group", "हरेक समूहभित्र क्रम मिलाउनुहोस्"],
  sortEstimate: ["By estimate", "अनुमानअनुसार"],
  sortInstitution: ["By institution name", "संस्थाको नामअनुसार"],
  unknown: ["Unknown", "खुलेको छैन"],
  annualRate: ["Annual rate", "वार्षिक दर"],
  net: ["Estimated net interest", "अनुमानित खुद ब्याज"],
  gross: ["Gross interest", "कुल ब्याज"],
  tax: ["Tax withheld", "कटाइएको कर"],
  fees: ["Opening fee", "खोल्ने शुल्क"],
  receipts: ["Total received", "जम्मा प्राप्त रकम"],
  firstYear: ["First-year total", "पहिलो वर्षको कुल"],
  laterTopUp: ["Later top-ups", "पछिल्लो वर्ष रकम थप्ने शुल्क"],
  laterRenewal: ["Later annual charge", "पछिल्लो वर्षको वार्षिक शुल्क"],
  knownSubtotal: ["Known subtotal", "पुष्टि भएको उपकुल"],
  totalCost: ["Estimated total cost", "अनुमानित कुल खर्च"],
  breakdown: ["See breakdown and evidence", "हिसाब र प्रमाण हेर्नुहोस्"],
  payoutSchedule: ["Payment schedule", "भुक्तानी तालिका"],
  date: ["Date (AD)", "मिति (ईस्वी)"],
  paid: ["Interest paid", "भुक्तानी भएको ब्याज"],
  withdrawal: ["Early withdrawal", "समयअघिको निकासी"],
  withdrawalUnknown: [
    "There isn’t enough evidence to estimate an early withdrawal.",
    "समयअघिको निकासीको अनुमान गर्न पर्याप्त प्रमाण छैन।",
  ],
  evidence: ["Evidence", "प्रमाण"],
  official: [
    "Visit official institution site",
    "संस्थाको आधिकारिक वेबसाइट खोल्नुहोस्",
  ],
  officialSource: ["Open official source", "आधिकारिक स्रोत खोल्नुहोस्"],
  report: ["Report a discrepancy", "फरक विवरणबारे जानकारी दिनुहोस्"],
  pin: ["Pin to compare", "तुलनाका लागि छान्नुहोस्"],
  remove: ["Remove from comparison", "तुलनाबाट हटाउनुहोस्"],
  pinned: ["Pinned comparison", "छानिएका प्रस्तावको तुलना"],
  pinnedLimit: [
    "Compare up to three offers side by side.",
    "बढीमा तीन प्रस्ताव सँगसँगै तुलना गर्नुहोस्।",
  ],
  demoShort: ["Fictional data", "काल्पनिक तथ्याङ्क"],
  dateBasis: [
    "Nepali result cards show verification dates in Bikram Sambat when available. Source records and freshness checks use Gregorian dates (AD).",
    "नेपाली नतिजामा सम्भव भएसम्म पुष्टि मिति विक्रम संवत्‌मा देखाइन्छ। स्रोत अभिलेख र पुष्टि अवधि जाँच्न इस्वी संवत् प्रयोग गरिन्छ।",
  ],
  demo: [
    "Fictional data · demonstration only",
    "काल्पनिक तथ्याङ्क · प्रदर्शनका लागि मात्र",
  ],
  fictional: ["Fictional institution", "काल्पनिक संस्था"],
  referenceOnly: [
    "Reference only. This evidence is outside the current comparison.",
    "सन्दर्भका लागि मात्र। यो प्रमाण हालको तुलनामा पर्दैन।",
  ],
  publisher: ["Publisher", "प्रकाशक"],
  locator: ["Evidence location", "प्रमाणको स्थान"],
  effective: ["Effective date (AD)", "लागू मिति (ईस्वी)"],
  verifiedOn: ["Verified", "पुष्टि मिति"],
  moreOptions: ["More verified options", "थप पुष्टि भएका विकल्प"],
  verified: ["Last verified (AD)", "पछिल्लो पुष्टि (ईस्वी)"],
  banks: [
    "Nepal Rastra Bank institution register",
    "नेपाल राष्ट्र बैंकको संस्था सूची",
  ],
  scope: ["Comparison scope", "तुलनाको दायरा"],
  coverageOffline: [
    "We couldn’t load the current coverage.",
    "हालको उपलब्ध विवरण लोड गर्न सकिएन।",
  ],
  approvedScope: [
    "This release contains reviewed offers. Each comparison checks eligibility and source freshness.",
    "यस प्रकाशनमा समीक्षा भएका प्रस्ताव छन्। प्रत्येक तुलनाले योग्यता र स्रोत अद्यावधिक भए नभएको जाँच्छ।",
  ],
  publicScope: [
    "This release has no independently approved bank offers.",
    "यस प्रकाशनमा स्वतन्त्र रूपमा अनुमोदित बैंक प्रस्ताव छैनन्।",
  ],
  demoScope: [
    "This local release uses a dated fictional dataset.",
    "यस स्थानीय प्रकाशनमा निश्चित मितिको काल्पनिक तथ्याङ्क प्रयोग भएको छ।",
  ],
  sourcePolicy: [
    "We use official bank notices, tariffs and product terms for offer facts. The central bank register is used for institution identity.",
    "प्रस्तावका लागि बैंकका आधिकारिक सूचना, शुल्क सूची र उत्पादनका सर्त प्रयोग हुन्छन्। संस्था पहिचानका लागि केन्द्रीय बैंकको सूची प्रयोग हुन्छ।",
  ],
  methodTitle: ["How we compare.", "तुलना कसरी हुन्छ।"],
  coverageTitle: ["What we cover.", "के समेटिएको छ।"],
  methodMatch: ["Matching offers", "मिल्ने प्रस्ताव"],
  methodMatchText: [
    "We match currency, holder type, amount, duration and payout terms. Effective dates follow Nepal time and the expiry date is excluded.",
    "मुद्रा, खातावाला, रकम, अवधि र भुक्तानी सर्त मिलाइन्छ। लागू मिति नेपालको समयअनुसार हुन्छ र समाप्ति मिति समावेश हुँदैन।",
  ],
  methodMath: ["Fixed-deposit estimates", "मुद्दती निक्षेपको अनुमान"],
  methodMathText: [
    "For supported contracts, interest is the balance × annual rate × period months ÷ 12. We model capitalization and withholding at the stated events. Each interest and withholding event rounds half up to two decimal places. Total received means all incoming payments including principal. Net interest subtracts withholding and opening fees.",
    "समर्थित सर्तमा ब्याज बाँकी मूलधन × वार्षिक दर × अवधिका महिना ÷ १२ बाट गणना हुन्छ। तोकिएको समयमा ब्याज जोडिन्छ र कर काटिन्छ। प्रत्येक रकम दुई दशमलवमा मिलाइन्छ। जम्मा प्राप्त रकममा मूलधनसहित सबै भुक्तानी पर्छन्। खुद ब्याजबाट कर र खाता खोल्ने शुल्क कटाइन्छ।",
  ],
  methodCard: ["Dollar-card estimates", "डलर कार्डको अनुमान"],
  methodCardText: [
    "We add issuance, annual charges and reload fees for the selected period and channel. Other transaction, FX and closure costs are outside this estimate. An unknown applicable fee keeps the result out of the ranking.",
    "छानिएको अवधि र माध्यमअनुसार जारी शुल्क, वार्षिक शुल्क र रकम थप्ने शुल्क जोडिन्छ। अन्य कारोबार, मुद्रा सटही र बन्द गर्ने शुल्क यस अनुमानमा पर्दैन। लागू हुने कुनै शुल्क नखुले प्रस्ताव क्रमबद्ध हुँदैन।",
  ],
  methodFresh: ["Review and freshness", "समीक्षा र अद्यावधिक स्थिति"],
  methodFreshText: [
    `Rate verification is valid for up to ${numberText("en", methodology.rateMaxDays)} days and tariff or term verification for up to ${numberText("en", methodology.tariffMaxDays)} days. A change, dispute or earlier expiry can remove an offer sooner. Ties use stable institution and offer identifiers.`,
    `ब्याजदरको पुष्टि बढीमा ${numberText("ne", methodology.rateMaxDays)} दिन र शुल्क वा सर्तको पुष्टि बढीमा ${numberText("ne", methodology.tariffMaxDays)} दिन मान्य हुन्छ। परिवर्तन, विवाद वा पहिल्यै अवधि सकिए प्रस्ताव छिटै हट्न सक्छ। बराबरीमा संस्था र प्रस्तावको स्थिर पहिचान क्रम प्रयोग हुन्छ।`,
  ],
  methodPrivacy: ["Privacy and independence", "गोपनीयता र स्वतन्त्रता"],
  methodPrivacyText: [
    "Comparison inputs are kept in the current browser visit. We don’t ask for account numbers or documents. The No Series is independent of the banks it compares.",
    "तुलनाका विवरण यही ब्राउजर भ्रमणमा रहन्छन्। हामी खाता नम्बर वा कागजात माग्दैनौँ। द नो सिरिज तुलना गरिएका बैंकबाट स्वतन्त्र छ।",
  ],
  reportBody: [
    "Note the affected term and the official notice, page or row that supports the correction. Keep account details and other personal information out of the report.",
    "सच्याउनुपर्ने सर्त र त्यसलाई पुष्टि गर्ने आधिकारिक सूचना, पृष्ठ वा हरफ लेख्नुहोस्। खाता विवरण र अन्य व्यक्तिगत जानकारी नराख्नुहोस्।",
  ],
  reportStatus: [
    "Online submissions are currently unavailable.",
    "अनलाइन विवरण पठाउने सुविधा हाल उपलब्ध छैन।",
  ],
  unsupportedEstimate: [
    "A full estimate is unavailable for these terms.",
    "यी सर्तका लागि पूर्ण अनुमान उपलब्ध छैन।",
  ],
  furtherScope: [
    "Institutional and foreign-currency deposits, debit cards and bank accounts are outside current coverage.",
    "संस्थागत र विदेशी मुद्राका निक्षेप, डेबिट कार्ड र बैंक खाता अहिले समेटिएका छैनन्।",
  ],
  rankedCount: ["Eligible offers", "योग्य प्रस्ताव"],
  correction: ["Correction", "सुधार"],
} as const;

export type Label = keyof typeof words;
export const t = (locale: Locale, key: Label) =>
  words[key][locale === "ne" ? 1 : 0];
export const local = (locale: Locale, copy: Copy) => copy[locale];
export const titleFor = (product: Product) =>
  product === "fixed-deposits" ? "fixed" : "cards";
export const moneyPath = (locale: Locale) => "/" + locale + "/money";
export const productPath = (locale: Locale, product: Product) =>
  moneyPath(locale) + "/" + product;
function displayDigits(locale: Locale, value: string) {
  return locale === "ne"
    ? value.replace(/[0-9]/g, (digit) =>
        String.fromCharCode(0x0966 + Number(digit)),
      )
    : value;
}

export function numberText(
  locale: Locale,
  value: string | number,
  decimals = 0,
) {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: Math.max(decimals, 2),
  }).format(Number(value));
  return displayDigits(locale, formatted);
}
export function amountText(locale: Locale, value: string, currency = "NPR") {
  const [whole, fraction = ""] = value.split(".");
  const fractionText = displayDigits(locale, fraction.padEnd(2, "0"));
  const grouped = displayDigits(
    locale,
    new Intl.NumberFormat("en-IN").format(BigInt(whole)),
  );
  const sign = whole === "-0" ? "-" : "";
  return (
    (locale === "ne" && currency === "NPR" ? "रु " : currency + " ") +
    sign +
    grouped +
    "." +
    fractionText
  );
}
