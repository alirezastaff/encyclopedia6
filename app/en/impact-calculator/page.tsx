import type { Metadata } from "next";
import ImpactCalculator from "@/components/impact/ImpactCalculator";

export const metadata: Metadata = {
  title: "Social Impact Calculator | SSE Knowledge Platform",
  description: "Estimate social value and review the assumptions behind your project's impact.",
};

export default function ImpactCalculatorPage() {
  return <ImpactCalculator />;
}
