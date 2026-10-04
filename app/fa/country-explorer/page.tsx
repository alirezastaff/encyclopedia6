import dynamic from "next/dynamic";

const CountryAtlas = dynamic(() => import("@/components/country/CountryAtlas"), {
  loading: () => (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", color: "#4f5f6e" }}>
      در حال بارگذاری اطلس کشورها...
    </div>
  ),
});

export default function FaCountryExplorerPage() {
  return <CountryAtlas locale="fa" />;
}