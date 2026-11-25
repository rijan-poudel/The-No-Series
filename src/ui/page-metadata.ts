import { notFound } from "next/navigation";
import { isLocale, t, type Label } from "./copy";

export function pageMetadata(
  locale: string,
  title: Label,
  description: Label,
  subject?: string,
) {
  if (!isLocale(locale)) notFound();
  return {
    title: [subject, t(locale, title), "The No Series"]
      .filter(Boolean)
      .join(" | "),
    description: [subject, t(locale, description)].filter(Boolean).join(" · "),
  };
}
