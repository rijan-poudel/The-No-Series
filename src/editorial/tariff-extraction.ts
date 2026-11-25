// Strict adapter for the published Everest prepaid e-commerce card fee section.
export function extractEverestCardFees(html: string) {
  const document = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ");
  if (!/EBL E-Com Dollar/i.test(document)) return null;
  const feeSection = document.match(
    /Card Issuance\s*:\s*([\s\S]{1,2200}?)Security Features/i,
  )?.[1];
  if (!feeSection) return null;
  const issuance = feeSection.match(
    /Physical Card\s*:\s*USD\s*(\d+(?:\.\d+)?)\s+Virtual Card\s*:\s*USD\s*(\d+(?:\.\d+)?)/i,
  );
  const reload = feeSection.match(
    /Load\s*\/\s*reload fee\s*:\s*(Free|USD\s*\d+(?:\.\d+)?)/i,
  )?.[1];
  const payment = feeSection.match(
    /Transactions? Fee\s*:\s*Min\.?\s*USD\s*(\d+(?:\.\d+)?)\s+or\s+(\d+(?:\.\d+)?)%\s+whichever is higher/i,
  );
  if (!issuance || !reload || !payment) return null;
  return {
    physicalIssuanceUsd: issuance[1],
    virtualIssuanceUsd: issuance[2],
    reloadUsd: /^free$/i.test(reload) ? "0" : reload.replace(/^USD\s*/i, ""),
    paymentMinimumUsd: payment[1],
    paymentPercent: payment[2],
  };
}

// All four labels must appear together in one unambiguous fee table.
export function extractNepalMobileFees(html: string) {
  const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)];
  const candidates = tables.flatMap(([, table]) => {
    const rows = new Map<string, string[]>();
    for (const [, row] of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
        ([, cell]) =>
          cell
            .replace(/<[^>]*>/g, " ")
            .replace(/&nbsp;/gi, " ")
            .replace(/\s+/g, " ")
            .trim(),
      );
      if (cells.length !== 3) continue;
      const key = cells[1].toLowerCase();
      rows.set(key, [...(rows.get(key) ?? []), cells[2]]);
    }

    function read(label: string, pattern: RegExp) {
      const values = rows.get(label);
      return values?.length === 1 ? pattern.exec(values[0])?.[1] : undefined;
    }

    const registrationNpr = read("registration", /^NPR (\d+) per account$/i);
    const renewalNpr = read("renewal fee", /^NPR (\d+) per account$/i);
    const renewalYears = read("renewal period", /^(\d+) year$/i);
    const pinResetNpr = read("pin reset", /^NPR (\d+)$/i);
    return registrationNpr && renewalNpr && renewalYears && pinResetNpr
      ? [{ registrationNpr, renewalNpr, renewalYears, pinResetNpr }]
      : [];
  });
  return candidates.length === 1 ? candidates[0] : null;
}

// Read Poppler layout text for the numbered Nepal SBI Yono tariff section.
export function extractSbiMobileFees(text: string) {
  const lines = text.split(/\r?\n/u);
  function fee(section: string, label: string) {
    const rows = lines.filter((line) =>
      line.trimStart().startsWith(section + " "),
    );
    if (rows.length !== 1) return undefined;
    const [, category, event, amount] = rows[0].trim().split(/\s{2,}/u);
    if (category !== "MOBILE BANKING" || event !== label) return undefined;
    if (amount === "Nil") return "0";
    return /^NPR (\d+(?:\.\d{2})?)$/u.exec(amount ?? "")?.[1];
  }

  const sbiRegistrationNpr = fee("30.1", "Mobile Banking Registration");
  const sbiAnnualNpr = fee("30.2", "Mobile Banking Annual Charge");
  const sbiPinResetNpr = fee("30.3", "Mobile Banking Re Pin for Yono");
  const sbiChequeRequestNpr = fee("30.4", "Cheque book request via Yono");
  if (
    sbiRegistrationNpr === undefined ||
    sbiAnnualNpr === undefined ||
    sbiPinResetNpr === undefined ||
    sbiChequeRequestNpr === undefined
  )
    return null;

  return {
    sbiRegistrationNpr,
    sbiAnnualNpr,
    sbiPinResetNpr,
    sbiChequeRequestNpr,
  };
}
