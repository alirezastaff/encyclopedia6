import dynamic from "next/dynamic";

const CountryAtlas = dynamic(() => import("@/components/country/CountryAtlas"), {
  loading: () => (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", color: "#4f5f6e" }}>
      Loading country explorer...
    </div>
  ),
});

export default function EnCountryExplorerPage() {
  return <CountryAtlas />;
}
