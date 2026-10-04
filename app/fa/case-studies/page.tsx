import dynamic from "next/dynamic";

const CaseStudiesHub = dynamic(() => import("@/components/case-studies/CaseStudiesHub"), {
  loading: () => (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", color: "#dfeaf5" }}>
      در حال بارگذاری مطالعات موردی...
    </div>
  ),
});

export default function FaCaseStudiesPage() {
  return <CaseStudiesHub locale="fa" />;
}