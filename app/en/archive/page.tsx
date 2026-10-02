import EnglishArchivePage from "@/components/archive/EnglishArchivePage";

export default async function EnArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  return <EnglishArchivePage key={typeof q === "string" ? q : ""} initialQuery={typeof q === "string" ? q : ""} />;
}
