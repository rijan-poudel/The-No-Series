import type {
  Band,
  Card,
  Copy,
  Deposit,
  Fact,
  FeeRule,
  Release,
  RuleVersion,
} from "../domain/model.ts";

const copy = (en: string, ne: string): Copy => ({ en, ne });
const fixtureDate = "2026-11-23";
const band = <T>(min: T, max: T): Band<T> => ({
  min,
  max,
  includeMin: true,
  includeMax: true,
});
const examples = [
  ["alder", "Alder Example", "अल्डर उदाहरण"],
  ["basin", "Basin Example", "बेसिन उदाहरण"],
  ["cedar", "Cedar Example", "सिडार उदाहरण"],
  ["dune", "Dune Example", "ड्युन उदाहरण"],
  ["ember", "Ember Example", "एम्बर उदाहरण"],
] as const;

export function demoRelease(): Release {
  const institutions = examples.map(([id, en, ne]) => ({
    id,
    name: copy(en, ne),
    fictional: true,
  }));
  const sources: Release["sources"][number][] = [];
  const citations: Release["citations"][number][] = [];

  function statement<T>(
    id: string,
    tag: string,
    value: T,
    label: Copy,
    excerpt: Copy,
  ): Fact<T> {
    const citation = id + "-" + tag;
    citations.push({
      id: citation,
      sourceId: "demo-" + id,
      title: label,
      excerpt,
      locator: copy(
        "Synthetic data sheet · " + tag,
        "काल्पनिक विवरणपत्र · " + label.ne,
      ),
      effective: "2026-11-01",
      verified: fixtureDate,
    });
    return { value, citations: [citation] };
  }

  function deposit(
    id: string,
    annualRate: string,
    payout: Deposit["payout"]["value"],
    tax?: string,
    compound = false,
  ): Deposit {
    const institution = institutions.find((entry) => entry.id === id)!;
    sources.push({
      id: "demo-" + id,
      publisher: institution.name,
      kind: "fixture",
      fixture: true,
    });
    const fact = <T>(
      tag: string,
      value: T,
      en: string,
      ne: string,
      desc: Copy,
    ) => statement(id, tag, value, copy(en, ne), desc);
    return {
      id: id + "-deposit",
      institutionId: id,
      product: "fixed-deposits",
      name: copy("Fixed deposit", "मुद्दती निक्षेप"),
      status: "verified",
      from: "2026-11-01",
      until: "2026-12-01",
      verified: fixtureDate,
      eligibility: fact(
        "eligibility",
        { customer: "individual", currency: "NPR" },
        "Eligibility",
        "योग्यता",
        copy("Individual NPR deposits.", "व्यक्तिगत नेपाली रुपैयाँको निक्षेप।"),
      ),
      principal: fact(
        "amount",
        band("10000", "10000000"),
        "Deposit amount",
        "निक्षेप रकम",
        copy(
          "NPR 10,000–1,00,00,000 inclusive.",
          "रु १०,००० देखि १,००,००,००० सम्म।",
        ),
      ),
      months: fact(
        "term",
        band(6, 24),
        "Deposit term",
        "निक्षेप अवधि",
        copy("6–24 whole months inclusive.", "६ देखि २४ पूरा महिनासम्म।"),
      ),
      rate: fact(
        "rate",
        annualRate,
        "Annual interest rate",
        "वार्षिक ब्याजदर",
        copy(annualRate + "% per year.", annualRate + "% प्रतिवर्ष।"),
      ),
      payout: fact(
        "payout",
        payout,
        "Interest payout",
        "ब्याज भुक्तानी",
        payout === "quarterly"
          ? copy(
              "Interest paid every three months.",
              "हरेक तीन महिनामा ब्याज भुक्तानी।",
            )
          : copy("Interest paid on maturity.", "अवधि सकिएपछि ब्याज भुक्तानी।"),
      ),
      rule: fact<RuleVersion>(
        "calculation",
        {
          mode: compound ? "compound" : "simple",
          yearBasis: "contract-months",
          intervalMonths: compound || payout === "quarterly" ? 3 : null,
          rounding: "period-half-up",
          withholding: compound
            ? "period"
            : payout === "quarterly"
              ? "period"
              : "maturity",
        },
        "Calculation rule",
        "गणना नियम",
        copy(
          compound
            ? "Interest is capitalized quarterly after withholding. Each event rounds half up to the paisa."
            : "Simple interest is prorated by contract months and rounded half up to the paisa per payment.",
          compound
            ? "कर कटाएपछि हरेक तीन महिनामा ब्याज मूलधनमा थपिन्छ। प्रत्येक गणनाको रकम नजिकको पैसामा मिलाइन्छ।"
            : "पूरा महिनाको आधारमा साधारण ब्याज गणना हुन्छ। प्रत्येक भुक्तानीको रकम नजिकको पैसामा मिलाइन्छ।",
        ),
      ),
      catch: fact(
        "catch",
        copy(
          "Ask about a reduced rate before withdrawing early.",
          "समयअघि रकम निकाल्दा घट्न सक्ने ब्याजदरबारे बुझ्नुहोस्।",
        ),
        "Early withdrawal condition",
        "समयअघिको निकासी",
        copy(
          "Early closure may change the rate. Repricing terms are unspecified.",
          "समयअघि खाता बन्द गर्दा ब्याजदर बदलिन सक्छ। नयाँ दर खुलाइएको छैन।",
        ),
      ),
      withdrawal: fact(
        "withdrawal",
        copy(
          "Early closure may reduce the interest rate. The reduced rate is unavailable.",
          "समयअघि रकम निकाल्दा ब्याजदर घट्न सक्छ। घटाइएको दर उपलब्ध छैन।",
        ),
        "Early withdrawal policy",
        "समयअघिको निकासी नीति",
        copy("Repricing details are unspecified.", "नयाँ दर खुलाइएको छैन।"),
      ),
      openingFee: fact(
        "fee",
        "0",
        "Opening fee",
        "खोल्ने शुल्क",
        copy("Opening fee is NPR 0.", "खोल्ने शुल्क रु ०।"),
      ),
      ...(tax === undefined
        ? {}
        : {
            tax: fact(
              "tax",
              tax,
              "Withholding",
              "कर कट्टी",
              copy(
                "Fictional withholding of " + tax + "%.",
                "काल्पनिक कर कट्टी " + tax + "%।",
              ),
            ),
          }),
    };
  }

  function card(
    id: string,
    issue: string,
    annual: string,
    app: string | undefined,
    branch: string,
    account: "yes" | "no",
  ): Card {
    const institution = institutions.find((entry) => entry.id === id)!;
    const sourceKey = id + "-card";
    sources.push({
      id: "demo-" + sourceKey,
      publisher: institution.name,
      kind: "fixture",
      fixture: true,
    });
    const fact = <T>(tag: string, value: T, title: Copy, excerpt: Copy) =>
      statement(sourceKey, tag, value, title, excerpt);
    const cost = (
      tag: string,
      event: FeeRule["event"],
      value: string,
      title: Copy,
    ) =>
      fact<FeeRule>(
        tag,
        {
          event,
          currency: "NPR",
          fixed: value,
          ...(event === "renewal" ? { startsInYear: 1 } : {}),
        },
        title,
        copy("NPR " + value + " per event.", "प्रति पटक रु " + value + "।"),
      );
    return {
      id: sourceKey,
      institutionId: id,
      product: "dollar-cards",
      name: copy("USD e-commerce card", "डलर ई–कमर्स कार्ड"),
      status: "verified",
      from: "2026-11-01",
      until: "2026-12-01",
      verified: fixtureDate,
      eligibility: fact(
        "eligibility",
        { customer: "individual", currency: "USD" },
        copy("Eligibility", "योग्यता"),
        copy(
          "Individual USD e-commerce card.",
          "व्यक्तिगत अमेरिकी डलरको ई–कमर्स कार्ड।",
        ),
      ),
      form: fact(
        "form",
        "virtual",
        copy("Card format", "कार्डको प्रकार"),
        copy("Virtual card.", "भर्चुअल कार्ड।"),
      ),
      account: fact(
        "account",
        account,
        copy("Account requirement", "खाता सम्बन्धी सर्त"),
        account === "yes"
          ? copy("An account is required.", "खाता आवश्यक छ।")
          : copy(
              "An existing account is optional.",
              "पहिल्यै खाता हुनु अनिवार्य छैन।",
            ),
      ),
      catch: fact(
        "catch",
        copy(
          "Reload fees depend on the channel you choose.",
          "रकम थप्ने माध्यमअनुसार शुल्क फरक पर्छ।",
        ),
        copy("Reload channels", "रकम थप्ने माध्यम"),
        copy(
          "App and branch tariffs are published separately in this fixture.",
          "एप र शाखाको शुल्क यस उदाहरणमा छुट्टाछुट्टै छ।",
        ),
      ),
      fees: {
        issuance: cost(
          "issuance",
          "issuance",
          issue,
          copy("Issuance fee", "कार्ड जारी गर्ने शुल्क"),
        ),
        renewal: cost(
          "annual",
          "renewal",
          annual,
          copy("Annual charge from year one", "पहिलो वर्षदेखिको वार्षिक शुल्क"),
        ),
        topUp: {
          ...(app === undefined
            ? {}
            : {
                app: cost(
                  "app",
                  "top-up",
                  app,
                  copy("App reload", "एपबाट रकम थप्दा"),
                ),
              }),
          branch: cost(
            "branch",
            "top-up",
            branch,
            copy("Branch reload", "शाखाबाट रकम थप्दा"),
          ),
        },
      },
    };
  }

  return {
    id: "demo-2026-11-23-v1",
    kind: "demo",
    revoked: false,
    institutions,
    sources,
    citations,
    corrections: [],
    offers: [
      deposit("alder", "6.00", "maturity", "5"),
      deposit("basin", "5.80", "maturity", "5", true),
      deposit("cedar", "5.90", "maturity", "5"),
      deposit("dune", "6.20", "quarterly", "5"),
      deposit("ember", "6.40", "maturity"),
      card("alder", "500", "500", "0", "100", "no"),
      card("basin", "0", "200", "100", "150", "no"),
      card("cedar", "300", "200", undefined, "75", "yes"),
    ],
  };
}

export function demoClock() {
  return new Date(fixtureDate + "T06:00:00Z");
}
