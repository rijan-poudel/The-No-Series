# Money design direction

The site is a bilingual editorial guide to Nepal banking products. Start with two category choices. Show one practical catch on the category page. Ask only which comparison matters. After the reader chooses, show the strongest verified option for that criterion, its conditions and its catch. Put alternatives, official evidence and methodology behind separate disclosures or links.

## Visual language

Use the supplied digital scrapbook reference for warm paper, serif headlines, muted green and yellow category sheets and soft shadows. The home uses a single torn-grid paper layer behind the category links. Category pages use one yellow catch note and plain editorial sections. Use the existing locally bundled sans and Devanagari families for controls and body copy. Georgian-style serif headlines apply to English only. Keep the palette, navigation and content density consistent across routes.

## Editorial rules

- Fixed deposits compare the advertised annual rate at the selected term and payout schedule for personal NPR deposits. Show the qualifying deposit band with each pick. Readers never submit a deposit amount. These rankings answer a rate question and do not estimate earnings.
- Dollar cards compare one chosen flat NPR fee for the selected card type. Show any required bank account. Withhold ranking for missing or amount-dependent fees. Each result concerns that fee only. The source disclosure includes the official bank link when the pick has a reviewed institution URL. Coverage remains available in the footer.
- Open the first source disclosure to see evidence for the chosen rate or fee and the catch. Keep eligibility and other supporting terms under a second disclosure. Ties share the lead. Show the first two runners-up and fold any remaining alternatives. Shared verification excludes revoked, stale, conflicting and unsupported records. Empty coverage has no pick.
- Old browser comparison URLs lead to the category guide. The existing comparison API and local calculation commands remain available for internal verification and existing callers.

## Task-first navigation

The first screen offers Compare banks, Use my bank and Find a feature. Compare keeps the two available product categories together. Use my bank opens bank-specific published deposit notices or official card sources. Feature shortcuts go directly to quarterly interest, virtual cards or app reload fees. A compact header holds the home link and a utility disclosure containing language, coverage and methodology. Category pages use the same native radio component for every choice, with a full-width action. A card guide with no verified fee points to official bank material.

## Tariff reading

The homepage starts with a single bank search. The directory renders no banks until the reader searches and shows at most six matches. A bank page explains the charges from an identified product and tariff edition. The catch stays visible and the underlying evidence opens on request. NMB section 2.17 is the first decoded card tariff.

The homepage also offers three visible feature links for readers who have yet to choose a bank. They can open deposit or dollar-card comparisons without selecting an institution first. The header wordmark reads No.

The No wordmark uses heavy white lettering on the blue brand stamp. Primary actions, selected controls and keyboard focus share that blue. The link retains its localized Home label and a 44 px minimum target height.

Fixed-deposit results show sourced advertised rates inline when a reviewed pick is unavailable. The notice rate applies to the selected term. Payout and withdrawal terms still need separate confirmation.

The bilingual homepage introduces rates and fees together, then leads to a bank profile or a feature guide. The footer identifies editorial independence. The FD guide opens with early withdrawal, defaults to 12 months at maturity and states the verification window beside the action. Only ranked picks carry that assurance. Published notices and dated tariff readings retain their separate evidence labels. Page titles and descriptions follow the route and language. Review indexing at public launch.

English headings use self-hosted Instrument Serif and Nepali headings use self-hosted Tiro Devanagari Hindi. The lead figure, bank name, applicable conditions and verification date appear together. The verification date is the oldest verification among the citations for that figure. Every demo card carries its own fictional-data label, including alternatives. Coverage and Methodology are in the footer, and the header language switch preserves the current route and query.

Result cards use lining figures and a smaller percent sign on the same baseline. Each demo card carries a short label with the full explanation in its title. The results section gives that explanation once in plain text. Homepage top padding responds to both viewport width and height.

Verification dates on Nepali cards use Bikram Sambat. The machine-readable date, evidence and freshness calculations retain the original Gregorian day. The pinned calendar converter accepts an ISO civil date, has no runtime dependencies and reports unsupported dates explicitly. Those dates display with a Gregorian label. The tests cross-check the start of Mangsir 2083 and the demo verification day against the [published calendar](https://nepcalendar.com/2083/mangsir/).

The home now pairs bank lookup with a browsable directory and three task cards. Compare banks in the masthead opens a two-bank worksheet in either language. Bank profiles preselect the first institution. Geographic coverage and published price observations are presented independently of reviewed product picks.

Best by use groups the leading reviewed offers for two deposit payout choices and three virtual-card fee events. Each goal links to its full comparison and evidence. The production empty state links to the relevant published notices and tariff breakdowns.

The homepage uses four filled marks based on a passbook, deposit certificate, payment card and mobile receipt. Product links form a single index below bank search. Each has a serif title and a smaller description in the body face. The masthead and footer use plain navigation links. Inline sources keep their link treatment, and keyboard focus has its own visible ring. See the [homepage audit](verification.md#homepage-visual-audit--28-november-2026).
