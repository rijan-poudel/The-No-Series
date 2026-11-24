import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";
import { reviewDemo, type ReviewStep } from "../editorial/demo";
import { amountText, isLocale, moneyPath } from "./copy";
import { Editorial } from "./editorial";

export async function ReviewLab({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ step?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { step: query } = await searchParams;
  const step = (
    typeof query === "string" && /^[0-4]$/.test(query) ? Number(query) : 0
  ) as ReviewStep;
  const { candidate, previousNet, currentNet } = reviewDemo(step);
  const ne = locale === "ne";
  const steps = ne
    ? [
        "समीक्षाका लागि तयार",
        "पहिलो स्वीकृति",
        "दोस्रो स्वीकृति",
        "प्रकाशित उदाहरण",
        "विवादित प्रस्ताव हटाइयो",
      ]
    : [
        "Candidate ready",
        "First approval recorded",
        "Second approval recorded",
        "Example published",
        "Conflicting offer withheld",
      ];
  const actions = ne
    ? [
        "पहिलो समीक्षा नक्कल गर्नुहोस्",
        "दोस्रो समीक्षा नक्कल गर्नुहोस्",
        "उदाहरण प्रकाशन गर्नुहोस्",
        "विरोधाभासी सूचना नक्कल गर्नुहोस्",
      ]
    : [
        "Simulate first review",
        "Simulate independent review",
        "Publish demo release",
        "Simulate conflicting notice",
      ];
  const path = moneyPath(locale) + "/review-lab";
  const entries = [
    [
      ne ? "पहिले प्रकाशित वार्षिक दर" : "Previous annual rate",
      candidate.before!.rate + "%",
    ],
    [
      ne ? "प्रस्तावित वार्षिक दर" : "Proposed annual rate",
      candidate.after!.rate + "%",
    ],
    [
      ne ? "लागू मिति (ईस्वी)" : "Effective date (AD)",
      candidate.after!.effective,
    ],
    [
      ne ? "पहिलेको अनुमानित खुद ब्याज" : "Previous estimated net interest",
      amountText(locale, previousNet!),
    ],
    [
      ne ? "हालको अनुमानित खुद ब्याज" : "Current estimated net interest",
      currentNet
        ? amountText(locale, currentNet)
        : ne
          ? "तुलनाबाट हटाइएको"
          : "Withheld from comparison",
    ],
  ];
  return (
    <Editorial
      locale={locale}
      title={ne ? "स्रोत समीक्षा अभ्यास" : "Source review walkthrough"}
      back={moneyPath(locale) + "/coverage"}
    >
      <div className="demo-banner">
        {ne
          ? "स्थानीय अभ्यास · काल्पनिक सूचना"
          : "Local simulation · fictional notices"}
      </div>
      <section>
        <h2>{steps[step]}</h2>
        <p>
          {ne
            ? "व्यक्तिगत मुद्दती निक्षेपको अभ्यास। रु १,००,०००, १२ महिना, अवधि सकिँदा ब्याज।"
            : "Individual fixed deposit scenario. NPR 1,00,000 for 12 months, paid at maturity."}
        </p>
        <dl className="line-list">
          {entries.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p>
          {ne ? "प्रमाणको स्थान" : "Evidence location"} ·{" "}
          {ne
            ? "काल्पनिक ब्याजदर सूचना, अल्डर उदाहरणको हरफ"
            : "Fictional rate notice, Alder Example row"}
        </p>
        {candidate.decisions.length > 0 && (
          <ol>
            {candidate.decisions.map((decision, index) => (
              <li key={decision.actor}>
                {ne
                  ? `समीक्षक ${index + 1} को स्वीकृति`
                  : `Reviewer ${index + 1} approved`}
              </li>
            ))}
          </ol>
        )}
        <div className="row-links">
          {step < 4 && (
            <Link
              className="button primary"
              href={path + "?step=" + (step + 1)}
            >
              {actions[step]} <ArrowRight size={19} aria-hidden />
            </Link>
          )}
          {step > 0 && (
            <Link href={path}>
              <RotateCcw size={16} aria-hidden />{" "}
              {ne ? "फेरि सुरु गर्नुहोस्" : "Restart simulation"}
            </Link>
          )}
        </div>
      </section>
    </Editorial>
  );
}
