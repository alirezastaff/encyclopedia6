import EnglishArchivePage from "@/components/archive/EnglishArchivePage";

export default async function FaArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  return <EnglishArchivePage key={typeof q === "string" ? q : ""} locale="fa" initialQuery={typeof q === "string" ? q : ""} />;
}
