import { ArrowUpRight } from "lucide-react";
import { moneyPath, productPath, t, type Label, type Locale } from "./copy";

export const intents = ["compare", "existing", "feature"] as const;
export type Intent = (typeof intents)[number];

export function MoneyHome({
  locale,
  intent,
}: {
  locale: Locale;
  intent?: Intent;
}) {
  const home = moneyPath(locale);
  const deposits = productPath(locale, "fixed-deposits");
  const cards = productPath(locale, "dollar-cards");
  const choices: readonly (readonly [Label, string])[] =
    intent === "existing"
      ? [["chooseBank", home + "/banks"]]
      : intent === "feature"
        ? [
            ["quarterlyInterest", deposits + "?term=12&payout=quarterly#picks"],
            ["virtualCardFeature", cards + "?fee=issuance&form=virtual#picks"],
            ["appFee", cards + "?fee=app&form=virtual#picks"],
          ]
        : [
            ["fixed", deposits],
            ["cards", cards],
          ];
  const labels = {
    compare: "intentCompare",
    existing: "intentExisting",
    feature: "intentFeature",
  } as const;
  return (
    <section className="intent-home container">
      <h1>{t(locale, "bankingChoices")}</h1>
      <nav className="intent-switch" aria-label={t(locale, "bankingChoices")}>
        {intents.map((key) => (
          <a
            key={key}
            href={home + "?intent=" + key}
            aria-current={(intent ?? "compare") === key ? "page" : undefined}
          >
            {t(locale, labels[key])}
          </a>
        ))}
      </nav>
      <div className="intent-links">
        {choices.map(([label, href]) => (
          <a key={label} href={href}>
            <span>{t(locale, label)}</span>
            <ArrowUpRight size={19} aria-hidden />
          </a>
        ))}
      </div>
    </section>
  );
}
