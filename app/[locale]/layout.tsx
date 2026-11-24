import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/noto-sans-devanagari";
import "../styles.css";
import { isLocale } from "../../src/ui/copy";
import { SiteShell } from "../../src/ui/shell";

export const metadata: Metadata = {
  title: "No. 01 — Money | The No Series",
  description:
    "Independent fixed deposit and dollar card comparisons for Nepal.",
  robots: { index: false, follow: true },
};

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale}>
      <body>
        <SiteShell locale={locale}>{children}</SiteShell>
      </body>
    </html>
  );
}
