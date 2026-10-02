import type { Metadata } from "next";
import KnowledgeGraphResults from "@/components/knowledge-graph/KnowledgeGraphResults";

export const metadata: Metadata = {
  title: "نمودار دانش | پلتفرم دانشی اقتصاد اجتماعی و همبستگی",
  description: "پیوند میان مفاهیم، پژوهش‌ها و تجربه‌های اقتصاد اجتماعی و همبستگی را کاوش کنید.",
};

export default async function PersianKnowledgeGraphPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  return <KnowledgeGraphResults initialQuery={query || "solidarity"} locale="fa" />;
}
