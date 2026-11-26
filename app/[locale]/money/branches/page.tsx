import { notFound } from "next/navigation";
import { banks } from "../../../../src/data/banks";
import {
  registerDetails,
  nrbBranchDirectory,
} from "../../../../src/data/bank-register-details";
import { searchBranches, ipsSource } from "../../../../src/data/branch-search";
import { isLocale, moneyPath, t, numberText } from "../../../../src/ui/copy";
import { Editorial } from "../../../../src/ui/editorial";
import { pageMetadata } from "../../../../src/ui/page-metadata";

type Params = Promise<{ locale: string }>;
export async function generateMetadata({ params }: { params: Params }) {
  return pageMetadata((await params).locale, "branchFinder", "branchScope");
}
export default async function Branches({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const fields = await searchParams;
  const bank = banks.find((entry) => entry.id === fields.bank);
  if (fields.bank && !bank) notFound();
  const query =
    typeof fields.q === "string" ? fields.q.trim().slice(0, 100) : "";
  const result = searchBranches(bank?.id ?? "", query, Number(fields.page));
  const home = moneyPath(locale);
  const path = home + "/branches";
  const paramsForPage = new URLSearchParams();
  if (bank) paramsForPage.set("bank", bank.id);
  if (query) paramsForPage.set("q", query);
  function pageLink(page: number) {
    const q = new URLSearchParams(paramsForPage);
    q.set("page", String(page));
    return path + "?" + q + "#branch-results";
  }
  return (
    <Editorial
      locale={locale}
      title={t(locale, "branchFinder")}
      back={bank ? home + "/banks/" + bank.id : home + "/banks"}
    >
      <p>
        {t(locale, "branchScope")}{" "}
        <a href={ipsSource}>{t(locale, "branchEdition")}</a>
      </p>
      <form action={path + "#branch-results"} className="pair-form branch-form">
        <label>
          {t(locale, "mobileFeeBank")}
          <select name="bank" defaultValue={bank?.id ?? ""}>
            <option value="">{t(locale, "anyBank")}</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t(locale, "branchSearch")}
          <input type="search" name="q" maxLength={100} defaultValue={query} />
        </label>
        <button>{t(locale, "findBranches")}</button>
      </form>
      <section id="branch-results" tabIndex={-1}>
        <h2>
          {t(locale, "branchResults")} · {numberText(locale, result.total)}
        </h2>
        {bank && (
          <p>
            <a href={registerDetails[bank.id].branchUrl ?? nrbBranchDirectory}>
              {t(
                locale,
                registerDetails[bank.id].branchUrl
                  ? "bankBranches"
                  : "nrbBranches",
              )}
            </a>
          </p>
        )}
        {result.total ? (
          <>
            <table className="mobile-fee-table">
              <caption>{t(locale, "ipsBranches")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t(locale, "mobileFeeBank")}</th>
                  <th scope="col">{t(locale, "branchName")}</th>
                  <th scope="col">{t(locale, "branchCode")}</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.bankCode + "/" + row.code}>
                    <td>
                      <a href={home + "/banks/" + row.bank.id}>
                        {row.bank.name}
                      </a>
                      <small>
                        {t(locale, "ipsBankCode")} {row.bankCode}
                      </small>
                    </td>
                    <th scope="row">{row.name}</th>
                    <td>{row.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.pages > 1 && (
              <nav
                className="profile-actions"
                aria-label={t(locale, "resultPages")}
              >
                {result.current > 1 && (
                  <a href={pageLink(result.current - 1)}>
                    {t(locale, "previousPage")}
                  </a>
                )}
                <span>
                  {numberText(locale, result.current)} /{" "}
                  {numberText(locale, result.pages)}
                </span>
                {result.current < result.pages && (
                  <a href={pageLink(result.current + 1)}>
                    {t(locale, "nextPage")}
                  </a>
                )}
              </nav>
            )}
          </>
        ) : (
          <p>
            {t(locale, "noBranchRows")}{" "}
            {!bank && (
              <a href={nrbBranchDirectory}>{t(locale, "nrbBranches")}</a>
            )}
          </p>
        )}
      </section>
    </Editorial>
  );
}
