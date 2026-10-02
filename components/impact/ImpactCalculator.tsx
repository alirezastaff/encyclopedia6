"use client";

import ImpactConsoleDashboard from "./ImpactConsoleDashboard";

type Locale = "en" | "fa";

export default function ImpactCalculator({ locale = "en" }: { locale?: Locale }) {
  return <ImpactConsoleDashboard locale={locale} />;
}
