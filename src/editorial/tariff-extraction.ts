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

// Section 12 names the personal and corporate cards in adjacent columns.
// Match the personal issuance cell against the virtual/physical footnote.
export function extractGlobalImeCardFees(text: string) {
  const sections = [
    ...text.matchAll(
      /^\s*12\. DEBIT\/CREDIT CARD\s*$([\s\S]*?)^\s*Credit Card Fees & Charges\s*$/gmu,
    ),
  ];
  if (sections.length !== 1) return null;
  const section = sections[0][1];
  if (
    !/Global E-com\s*$/mu.test(section) ||
    !/Card \(Rs\.\)\s*$/mu.test(section)
  )
    return null;

  const issuance = [
    ...section.matchAll(/^\s*Card Issuance Fee \(in advance\) {2,}(.+)$/gmu),
  ];
  const variants = [
    ...section.matchAll(
      /^\* NPR (\d+) for virtual card, NPR (\d+) for physical card\.$/gmu,
    ),
  ];
  const counter = [
    ...section.matchAll(
      /^E-Com Top-Up Charge over the counter: NPR (\d+(?:\.\d{2})?) on each top up\/ withdrawal$/gmu,
    ),
  ];
  if (issuance.length !== 1 || variants.length !== 1 || counter.length !== 1)
    return null;

  const columns = issuance[0][1].trim().split(/ {2,}/u);
  const [, globalVirtualIssuanceNpr, globalPhysicalIssuanceNpr] = variants[0];
  if (
    columns.length !== 6 ||
    columns[4] !== `${globalVirtualIssuanceNpr}/${globalPhysicalIssuanceNpr}*`
  )
    return null;

  return {
    globalVirtualIssuanceNpr,
    globalPhysicalIssuanceNpr,
    globalCounterTopUpNpr: counter[0][1],
  };
}

// Scope PIN fees to Omni Banking. Corporate e-banking has its own reset fee.
export function extractEverestMobileFees(html: string) {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/giu)].map(
    ([, row]) =>
      [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/giu)].map(([, cell]) =>
        cell
          .replace(/<[^>]*>/gu, " ")
          .replace(/&nbsp;|&#160;/giu, " ")
          .replace(/&#8211;|&ndash;/giu, "–")
          .replace(/\s+/gu, " ")
          .trim(),
      ),
  );
  const start = rows.findIndex(([heading]) => heading === "MBanking section:");
  const end = rows.findIndex(
    ([heading], i) => i > start && heading === "QR Services:",
  );
  if (
    start < 0 ||
    end < 0 ||
    rows.filter(([heading]) => heading === "MBanking section:").length !== 1
  )
    return null;

  const section = rows.slice(start + 1, end);
  if (section[0]?.[0] !== "OMNI BANKING") return null;
  const resetRows = section.filter(([label]) => label === "Repin generation");
  if (resetRows.length !== 2 || resetRows.some((row) => row.length !== 2))
    return null;

  function read(prefix: string, amount: RegExp) {
    const rows = resetRows.filter(([, fee]) => fee.startsWith(prefix));
    if (rows.length !== 1) return undefined;
    const match = amount.exec(rows[0][1]);
    return match ? (match[1] ?? "0") : undefined;
  }

  const everestSelfPinResetNpr = read(
    "Self Reset",
    /^Self Reset\s*[–-]\s*(?:Free|Rs\.?\s*(\d+)\/-)$/u,
  );
  const everestBranchPinResetNpr = read(
    "Branch Service",
    /^Branch Service\s*:\s*Rs\.?\s*(\d+)\/-$/u,
  );
  return everestSelfPinResetNpr !== undefined &&
    everestBranchPinResetNpr !== undefined
    ? { everestSelfPinResetNpr, everestBranchPinResetNpr }
    : null;
}
