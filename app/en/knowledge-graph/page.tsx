import type { Metadata } from "next";
import KnowledgeGraphResults from "@/components/knowledge-graph/KnowledgeGraphResults";

export const metadata: Metadata = {
  title: "Knowledge Graph Search | SSE Knowledge Platform",
  description: "Explore connections across the Social Economy knowledge network.",
};

export default async function KnowledgeGraphPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; ai?: string | string[] }>;
}) {
  const { q, ai } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  return <KnowledgeGraphResults initialQuery={query || "solidarity"} initialAiSearch={ai === "1"} />;
}
