import dynamic from "next/dynamic";

const CaseStudiesHub = dynamic(() => import("@/components/case-studies/CaseStudiesHub"), {
  loading: () => (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", color: "#dfeaf5" }}>
      Loading case studies...
    </div>
  ),
});

export default function CaseStudiesPage() {
  return <CaseStudiesHub />;
}
