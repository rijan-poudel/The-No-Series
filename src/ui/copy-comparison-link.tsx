"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { t, type Locale } from "./copy";

export function CopyComparisonLink({
  locale,
  path,
}: {
  locale: Locale;
  path: string;
}) {
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState("");
  async function copy() {
    const url = new URL(path, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setManual("");
    } catch {
      setCopied(false);
      setManual(url);
    }
  }
  return (
    <div className="copy-comparison">
      <button type="button" onClick={copy}>
        <Link2 size={16} aria-hidden />
        {t(locale, "copyComparison")}
      </button>
      <span role="status">{copied ? t(locale, "linkCopied") : ""}</span>
      {manual && (
        <label>
          {t(locale, "copyManually")}
          <input
            type="url"
            readOnly
            value={manual}
            ref={(field) => {
              if (field) {
                field.focus();
                field.select();
              }
            }}
          />
        </label>
      )}
    </div>
  );
}
