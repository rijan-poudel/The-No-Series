import { notFound } from "next/navigation";
import { currentData } from "../../../../src/data/current";
import {
  editorialPicks,
  priorityQuery,
  type Priority,
} from "../../../../src/domain/picks";
import {
  isLocale,
  t,
  productPath,
  moneyPath,
  type Label,
} from "../../../../src/ui/copy";
import { Editorial } from "../../../../src/ui/editorial";
import { PickNote } from "../../../../src/ui/guide";
import { pageMetadata } from "../../../../src/ui/page-metadata";

export const dynamic = "force-dynamic";
const goals: readonly { label: Label; choice: Priority }[] = [
  {
    label: "oneYearMaturity",
    choice: { product: "fixed-deposits", term: 12, payout: "maturity" },
  },
  {
    label: "oneYearQuarterly",
    choice: { product: "fixed-deposits", term: 12, payout: "quarterly" },
  },
  {
    label: "openVirtual",
    choice: { product: "dollar-cards", fee: "issuance", form: "virtual" },
  },
  {
    label: "reloadVirtualApp",
    choice: { product: "dollar-cards", fee: "app", form: "virtual" },
  },
  {
    label: "reloadVirtualBranch",
    choice: { product: "dollar-cards", fee: "branch", form: "virtual" },
  },
];
type Params = Promise<{ locale: string }>;
export async function generateMetadata({ params }: { params: Params }) {
  return pageMetadata((await params).locale, "bestFor", "bestForIntro");
}
export default async function BestFor({ params }: { params: Params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { release, clock, unavailable } = await currentData();
  const results = goals.map((goal) => ({
    ...goal,
    leaders: editorialPicks(goal.choice, release, clock).leaders,
  }));
  return (
    <Editorial locale={locale} title={t(locale, "bestFor")}>
      <p>{t(locale, "bestForIntro")}</p>
      {release.kind === "demo" && <p>{t(locale, "demo")}</p>}
      {unavailable ? (
        <p role="status">{t(locale, "unavailablePicks")}</p>
      ) : (
        results.every((result) => !result.leaders.length) && (
          <p className="coverage-note">{t(locale, "noRankedGoals")}</p>
        )
      )}
      <nav className="profile-actions">
        <a href={moneyPath(locale) + "/savings"}>{t(locale, "balanceGoal")}</a>
        <a href={moneyPath(locale) + "/usage-cost"}>{t(locale, "usageCost")}</a>
      </nav>
      {results.map(({ label, choice, leaders }) => {
        const path = productPath(locale, choice.product),
          query = priorityQuery(choice);
        return (
          <section key={label} className="goal-section">
            <h2>{t(locale, label)}</h2>
            {leaders.map((row) => (
              <PickNote
                key={row.offer.id}
                locale={locale}
                row={row}
                path={path}
                query={query}
                demo={release.kind === "demo"}
              />
            ))}
            {!leaders.length &&
              results.some((result) => result.leaders.length > 0) && (
                <p>{t(locale, "noVerifiedPicks")}</p>
              )}
            <a href={path + query + "#picks"}>
              {t(
                locale,
                choice.product === "fixed-deposits"
                  ? "compareDeposits"
                  : "compareCardFees",
              )}{" "}
              →
            </a>
          </section>
        );
      })}
      <section className="goal-section">
        <h2>{t(locale, "mobileGoal")}</h2>
        <a href={moneyPath(locale) + "/mobile-banking"}>
          {t(locale, "mobileBankingFees")} →
        </a>
      </section>
    </Editorial>
  );
}
