"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { geoCentroid } from "d3-geo";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Compass,
  Globe2,
  Layers3,
  Maximize2,
  MapPinned,
  Minus,
  Minimize2,
  Plus,
  Search,
  Share2,
} from "lucide-react";
import { ComposableMap, Geography, Geographies, Marker, ZoomableGroup } from "react-simple-maps";
import countryArticles from "@/data/country-articles.json";
import styles from "./CountryAtlas.module.css";

type Country = {
  id: string;
  name: string;
  rsmKey?: string;
  properties?: {
    ADMIN?: string;
    NAME_EN?: string;
    ISO_A3?: string;
    ISO_A2?: string;
    ISO_A2_EH?: string;
    CONTINENT?: string;
    POP_EST?: number;
    LABEL_X?: number;
    LABEL_Y?: number;
  };
};

type CountryProfile = {
  id: string;
  name: string;
  title?: string;
  summary?: string;
  article?: string;
  latitude?: number;
  longitude?: number;
  statistics?: unknown;
  sources?: unknown;
};

type Region = "North America" | "South America" | "Europe" | "Asia" | "Africa" | "Oceania";
type AtlasView = "all" | "profiles" | "compare" | "themes";
type ProfilePanelSize = "compact" | "default" | "expanded";

const mapFile = "/maps/world-countries.geojson";
const regions: Region[] = ["North America", "South America", "Europe", "Asia", "Africa", "Oceania"];
const themes = ["Cooperatives", "Nonprofits", "Social enterprise", "Community development", "Policy & law"];
const themeTerms: Record<string, string[]> = {
  Cooperatives: ["cooperat", "mutual", "worker ownership"],
  Nonprofits: ["nonprofit", "non-profit", "association", "charit"],
  "Social enterprise": ["social enterprise", "social business", "purpose-led"],
  "Community development": ["community", "local development", "neighborhood"],
  "Policy & law": ["policy", "legislation", "law", "regulation", "framework"],
};

const editorialImages: Record<string, string> = {
  USA: "photo-1519501025264-65ba15a82390",
  CAN: "photo-1517935706615-2717063c2225",
  BRA: "photo-1483729558449-99ef09a8c325",
  COL: "photo-1533105079780-92b9be482077",
  FRA: "photo-1499856871958-5b9627545d1a",
  KOR: "photo-1517154421773-0529f29ea451",
  DEU: "photo-1467269204594-9661b134dd2b",
  ESP: "photo-1509840841025-9088ba78a826",
  ITA: "photo-1516483638261-f4dbaf036963",
  NLD: "photo-1512470876302-972faa2aa9a4",
  IND: "photo-1524492412937-b28074a5d7da",
  JPN: "photo-1493976040374-85c8e12f0c0e",
  MEX: "photo-1512813195386-6cf811ad3542",
  ZAF: "photo-1484318571209-661cf29a69c3",
  AUS: "photo-1506973035872-a4ec16b8e8d9",
  NZL: "photo-1469521669194-babb45599def",
};
const imagePool = Object.values(editorialImages);
const twoLetterOverrides: Record<string, string> = { USA: "US", XKX: "XK", KOS: "XK" };

function countryId(country?: Country | null): string {
  return country?.properties?.ISO_A3 || country?.id || "USA";
}

function countryName(country?: Country | null): string {
  return country?.properties?.ADMIN || country?.properties?.NAME_EN || country?.name || "Country";
}

function countryFlag(country?: Country | null): string {
  const alpha2 = countryAlpha2(country);
  if (!alpha2) return "◎";
  return [...alpha2.toUpperCase()].map((character) => String.fromCodePoint(127397 + character.charCodeAt(0))).join("");
}

function countryAlpha2(country?: Country | null): string | undefined {
  const id = countryId(country);
  const code = twoLetterOverrides[id]
    || [country?.properties?.ISO_A2, country?.properties?.ISO_A2_EH].find((candidate) => candidate && candidate !== "-99");
  return code && /^[a-z]{2}$/i.test(code) ? code.toLowerCase() : undefined;
}

function CountryFlag({ country, className }: { country?: Country | null; className?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const alpha2 = countryAlpha2(country);
  if (!alpha2 || imageFailed) return <span className={className} aria-hidden="true">{countryFlag(country)}</span>;
  return (
    <Image
      className={className}
      src={`https://flagcdn.com/w80/${alpha2}.png`}
      alt=""
      width={40}
      height={30}
      unoptimized
      aria-hidden="true"
      onError={() => setImageFailed(true)}
    />
  );
}

function getRegion(country?: Country | null): Region | null {
  const continent = country?.properties?.CONTINENT;
  return regions.find((region) => region === continent) || null;
}

function pointForCountry(country?: Country | null): [number, number] {
  if (country?.properties?.LABEL_X && country.properties.LABEL_Y) {
    return [country.properties.LABEL_X, country.properties.LABEL_Y];
  }
  if (!country) return [0, 20];
  try {
    return geoCentroid(country as never) as [number, number];
  } catch {
    return [0, 20];
  }
}

function imageForCountry(id: string): string {
  let hash = 0;
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  const photo = editorialImages[id] || imagePool[hash % imagePool.length];
  return `https://images.unsplash.com/${photo}`;
}

function countryImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  if (src.startsWith("/")) return src;
  return `${src}?auto=format&fit=crop&w=${width}&q=${quality || 80}`;
}

function displayStatistics(value: unknown): Array<{ label: string; value: string }> {
  let source = value;
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return [];
    }
  }
  if (Array.isArray(source)) {
    return source.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const entry = item as Record<string, unknown>;
      const label = String(entry.label || entry.name || entry.title || "").trim();
      const statistic = entry.value ?? entry.amount;
      return label && (typeof statistic === "string" || typeof statistic === "number")
        ? [{ label, value: String(statistic) }]
        : [];
    });
  }
  if (source && typeof source === "object") {
    return Object.entries(source as Record<string, unknown>).flatMap(([label, statistic]) => {
      if (typeof statistic === "string" || typeof statistic === "number") return [{ label, value: String(statistic) }];
      if (statistic && typeof statistic === "object") {
        const entry = statistic as Record<string, unknown>;
        const text = entry.value ?? entry.amount;
        if (typeof text === "string" || typeof text === "number") return [{ label: String(entry.label || label), value: String(text) }];
      }
      return [];
    });
  }
  return [];
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

function articleMarkup(article?: string): string {
  if (!article) return "";
  if (/<[a-z][\s\S]*>/i.test(article)) return article;
  return `<p>${escapeHtml(article).replace(/\n\s*\n/g, "</p><p>").replace(/\n/g, "<br />")}</p>`;
}

function profileForCountry(country: Country, profiles: CountryProfile[]): CountryProfile | undefined {
  const id = countryId(country);
  return profiles.find((profile) => profile.id.toUpperCase() === id.toUpperCase())
    || profiles.find((profile) => profile.name.toLowerCase() === countryName(country).toLowerCase());
}

function CountrySearch({
  className,
  label,
  query,
  countries,
  selectedId,
  onQueryChange,
  onSelect,
  compact = false,
}: {
  className?: string;
  label: string;
  query: string;
  countries: Country[];
  selectedId: string;
  onQueryChange: (value: string) => void;
  onSelect: (country: Country) => void;
  compact?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return countries.filter((country) => countryName(country).toLowerCase().includes(normalized)).slice(0, 7);
  }, [countries, query]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && matches.length) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % matches.length);
    } else if (event.key === "ArrowUp" && matches.length) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter" && matches[activeIndex]) {
      event.preventDefault();
      onSelect(matches[activeIndex]);
      onQueryChange("");
    } else if (event.key === "Escape") {
      onQueryChange("");
    }
  }

  return (
    <div className={`${styles.searchBox} ${compact ? styles.searchCompact : ""} ${className || ""}`}>
      {compact ? <Search size={15} aria-hidden="true" /> : null}
      <label className={styles.visuallyHidden} htmlFor={compact ? "atlas-search-top" : "atlas-search-rail"}>{label}</label>
      <input
        id={compact ? "atlas-search-top" : "atlas-search-rail"}
        type="search"
        value={query}
        placeholder={label}
        autoComplete="off"
        aria-label={label}
        aria-expanded={matches.length > 0}
        aria-controls={compact ? "atlas-search-results-top" : "atlas-search-results-rail"}
        role="combobox"
        aria-autocomplete="list"
        onChange={(event) => { onQueryChange(event.target.value); setActiveIndex(0); }}
        onKeyDown={handleKeyDown}
      />
      {query.trim() ? (
        <div className={styles.searchResults} id={compact ? "atlas-search-results-top" : "atlas-search-results-rail"} role="listbox" aria-label="Country results">
          {matches.length ? matches.map((country, index) => {
            const id = countryId(country);
            return (
              <button
                className={`${styles.searchResult} ${id === selectedId ? styles.searchResultSelected : ""} ${index === activeIndex ? styles.searchResultActive : ""}`}
                type="button"
                role="option"
                aria-selected={id === selectedId}
                key={id}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => { onSelect(country); onQueryChange(""); }}
              >
                <CountryFlag country={country} className={styles.resultFlag} />
                <span>{countryName(country)}</span>
                <small>{getRegion(country) || "World"}</small>
              </button>
            );
          }) : <p className={styles.emptyResult}>No countries found.</p>}
        </div>
      ) : null}
    </div>
  );
}

export default function CountryAtlas() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [profiles, setProfiles] = useState<CountryProfile[]>(countryArticles);
  const [selectedId, setSelectedId] = useState("USA");
  const [profilePanelSize, setProfilePanelSize] = useState<ProfilePanelSize>("compact");
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [zoom, setZoom] = useState(1);
  const [query, setQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [activeView, setActiveView] = useState<AtlasView>("all");
  const [activeTheme, setActiveTheme] = useState(themes[0]);
  const [compareId, setCompareId] = useState("");
  const [hoveredCountry, setHoveredCountry] = useState<{ country: Country; name: string; x: number; y: number } | null>(null);
  const [mapError, setMapError] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [sections, setSections] = useState<Array<{ id: string; title: string }>>([{ id: "overview", title: "Overview" }]);
  const [shareMessage, setShareMessage] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselDrag = useRef<{ startX: number; scrollLeft: number } | null>(null);
  const draggedCarousel = useRef(false);
  const articleScrollRef = useRef<HTMLDivElement>(null);
  const articleContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch(mapFile)
      .then((response) => {
        if (!response.ok) throw new Error("Map data unavailable");
        return response.json();
      })
      .then((data: { features: Country[] }) => {
        if (!active) return;
        setCountries(data.features);
        const unitedStates = data.features.find((country) => countryId(country) === "USA");
        if (unitedStates) setSelectedId("USA");
      })
      .catch(() => { if (active) setMapError(true); });
    const apiBase = (process.env.NEXT_PUBLIC_WORDPRESS_URL || "").replace(/\/$/, "");
    fetch(`${apiBase}/wp-json/sse/v1/countries?locale=en`)
      .then((response) => {
        if (!response.ok) throw new Error("Country profiles unavailable");
        return response.json();
      })
      .then((data: CountryProfile[]) => {
        if (!active || !Array.isArray(data)) return;
        const merged = [...countryArticles, ...data];
        const unique = merged.filter((profile, index) => merged.findIndex((item) => item.id.toUpperCase() === profile.id.toUpperCase()) === index);
        setProfiles(unique);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const selectedCountry = countries.find((country) => countryId(country) === selectedId)
    || ({ id: selectedId, name: profiles.find((profile) => profile.id === selectedId)?.name || "United States of America" } as Country);
  const profile = profileForCountry(selectedCountry, profiles);
  const selectedName = profile?.name || countryName(selectedCountry);
  const selectedRegion = getRegion(selectedCountry) || "North America";
  const selectedPoint: [number, number] = typeof profile?.longitude === "number" && typeof profile.latitude === "number"
    ? [profile.longitude, profile.latitude]
    : pointForCountry(selectedCountry);
  const selectedImage = imageForCountry(selectedId);
  const stats = displayStatistics(profile?.statistics);
  const articleHtml = articleMarkup(profile?.article);
  const activeCompareProfile = profiles.find((item) => item.id.toUpperCase() === compareId.toUpperCase());

  const regionCounts = useMemo(() => regions.map((region) => ({
    region,
    count: countries.filter((country) => getRegion(country) === region).length,
  })), [countries]);

  const visibleIds = useMemo(() => {
    let matchingProfiles = profiles;
    if (activeView === "themes") {
      const terms = themeTerms[activeTheme] || [];
      matchingProfiles = profiles.filter((item) => terms.some((term) => `${item.name} ${item.title || ""} ${item.summary || ""} ${item.article || ""}`.toLowerCase().includes(term)));
    }
    const profileIds = new Set(matchingProfiles.map((item) => item.id.toUpperCase()));
    return new Set(countries.filter((country) => {
      if (activeRegion && getRegion(country) !== activeRegion) return false;
      if (activeView === "profiles" || activeView === "themes") return profileIds.has(countryId(country).toUpperCase());
      return true;
    }).map(countryId));
  }, [activeRegion, activeTheme, activeView, countries, profiles]);

    const mapFeatureCollection = useMemo(() => ({ type: "FeatureCollection" as const, features: countries as never }), [countries]);

  const featuredCountries = useMemo(() => profiles.flatMap((item) => {
    const country = countries.find((entry) => countryId(entry).toUpperCase() === item.id.toUpperCase());
    return country ? [{ country, profile: item }] : [];
  }), [countries, profiles]);

  useEffect(() => {
    const root = articleScrollRef.current;
    const content = articleContentRef.current;
    if (!root || !content) return;
    const headings = Array.from(content.querySelectorAll<HTMLElement>("h2, h3"));
    const sources = root.querySelector<HTMLElement>("#atlas-sources");
    const entries = headings.map((heading, index) => {
      const id = `atlas-section-${index}`;
      heading.id = id;
      return { id, title: heading.textContent?.trim() || `Section ${index + 1}` };
    });
    const nextSections = [{ id: "overview", title: "Overview" }, ...entries];
    if (profile?.sources) nextSections.push({ id: "sources", title: "Sources" });
    setSections(nextSections);
    setActiveSection("overview");
    if (!headings.length && !sources) return;
    const observer = new IntersectionObserver((observations) => {
      const visible = observations.filter((observation) => observation.isIntersecting)
        .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0];
      if (visible) {
        const id = (visible.target as HTMLElement).id;
        setActiveSection(id === "atlas-sources" ? "sources" : id);
      }
    }, { root, rootMargin: "-12% 0px -66% 0px", threshold: 0 });
    headings.forEach((heading) => observer.observe(heading));
    if (sources) observer.observe(sources);
    return () => observer.disconnect();
  }, [articleHtml, profile?.sources, selectedId]);

  function selectCountry(country: Country, shouldFly = true) {
    const id = countryId(country);
    if (activeView === "compare" && id !== selectedId) {
      setCompareId(id);
      return;
    }
    setSelectedId(id);
    setActiveSection("overview");
    if (shouldFly) {
      const profileMatch = profileForCountry(country, profiles);
      const nextPoint: [number, number] = typeof profileMatch?.longitude === "number" && typeof profileMatch.latitude === "number"
        ? [profileMatch.longitude, profileMatch.latitude]
        : pointForCountry(country);
      setCenter(nextPoint);
      setZoom((current) => Math.max(current, 2.15));
    }
    setHoveredCountry(null);
  }

  function changeView(view: AtlasView) {
    setActiveView((current) => current === view && view === "compare" ? "all" : view);
    if (view !== "compare") setCompareId("");
  }

  function scrollToSection(id: string) {
    const root = articleScrollRef.current;
    if (!root) {
      setActiveSection(id);
      return;
    }
    if (id === "overview") {
      root.scrollTo({ top: 0, behavior: "smooth" });
    } else if (id === "sources") {
      const sourcesElement = root.querySelector<HTMLElement>("#atlas-sources");
      if (sourcesElement) {
        root.scrollTo({ top: sourcesElement.offsetTop - 14, behavior: "smooth" });
      }
    } else {
      const sectionElement = root.querySelector<HTMLElement>(`#${id}`);
      if (sectionElement) {
        root.scrollTo({ top: sectionElement.offsetTop - 14, behavior: "smooth" });
      }
    }
    setActiveSection(id);
  }

  function moveCarousel(direction: -1 | 1) {
    carouselRef.current?.scrollBy({ left: direction * 250, behavior: "smooth" });
  }

  function beginCarouselDrag(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || !carouselRef.current) return;
    carouselDrag.current = { startX: event.clientX, scrollLeft: carouselRef.current.scrollLeft };
    draggedCarousel.current = false;
    event.currentTarget.style.cursor = "grabbing";
  }

  function moveCarouselDrag(event: MouseEvent<HTMLDivElement>) {
    if (!carouselDrag.current || !(event.buttons & 1)) return;
    const distance = event.clientX - carouselDrag.current.startX;
    if (Math.abs(distance) > 5) draggedCarousel.current = true;
    if (draggedCarousel.current) event.currentTarget.scrollLeft = carouselDrag.current.scrollLeft - distance;
  }

  function endCarouselDrag(event: MouseEvent<HTMLDivElement>) {
    carouselDrag.current = null;
    event.currentTarget.style.cursor = "";
  }

  function suppressDraggedClick(event: MouseEvent<HTMLDivElement>) {
    if (!draggedCarousel.current) return;
    event.preventDefault();
    event.stopPropagation();
    draggedCarousel.current = false;
  }

  function handleMapHover(country: Country, event: MouseEvent<SVGPathElement>) {
    const bounds = mapRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setHoveredCountry({ country, name: countryName(country), x: event.clientX - bounds.left + 14, y: event.clientY - bounds.top + 12 });
  }

  async function shareCountry() {
    const shareUrl = `${window.location.origin}/en/country-explorer#${selectedId.toLowerCase()}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Link copied");
    } catch {
      setShareMessage("Select the address bar to copy this profile");
    }
    window.setTimeout(() => setShareMessage(""), 2200);
  }

  return (
    <main className={styles.atlas} dir="ltr" lang="en">
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/en" aria-label="Social and Solidarity Economy Atlas home">
          <span className={styles.brandMark}><Globe2 size={19} strokeWidth={1.5} /></span>
          <span className={styles.brandName}>Social and Solidarity<br />Economy Atlas</span>
        </Link>
        <div className={styles.headerTools}>
          <CountrySearch
            className={styles.headerSearch}
            compact
            label="Search for a country..."
            query={query}
            countries={countries}
            selectedId={selectedId}
            onQueryChange={setQuery}
            onSelect={selectCountry}
          />
          <Link className={styles.language} href="/fa/country-explorer" aria-label="Switch language to Persian">EN <ChevronDown size={13} /></Link>
        </div>
      </header>

      <section className={styles.atlasStage} aria-label="Interactive world atlas">
        <div className={styles.mapSurface} ref={mapRef}>
          {mapError ? <div className={styles.mapMessage}>The world boundary data could not be loaded.</div> : countries.length === 0 ? (
            <div className={styles.mapMessage}><span className={styles.loadingPulse} />Preparing the atlas</div>
          ) : (
            <ComposableMap
              className={styles.worldMap}
              projection="geoEqualEarth"
              projectionConfig={{ scale: 156 }}
              width={1200}
              height={720}
              role="img"
              aria-label="World map. Select a country to open its profile."
            >
              <ZoomableGroup center={center} zoom={zoom} minZoom={1} maxZoom={7} onMoveEnd={({ coordinates, zoom: nextZoom }: { coordinates: [number, number]; zoom: number }) => { setCenter(coordinates); setZoom(nextZoom); }}>
                <Geographies geography={mapFeatureCollection}>
                  {({ geographies }: { geographies: Country[] }) => geographies.map((country, index) => {
                    const id = countryId(country);
                    const selected = id === selectedId;
                    const visible = visibleIds.has(id) || selected;
                    return (
                      <Geography
                        className={`${styles.countryShape} ${selected ? styles.countrySelected : ""} ${profileForCountry(country, profiles) ? styles.countryPublished : ""}`}
                        key={`${id}-${country.rsmKey || index}`}
                        geography={country}
                        style={{
                          default: { fill: selected ? "#b6dfbd" : profileForCountry(country, profiles) ? "#587f70" : "#385e57", opacity: visible ? 1 : 0.14, outline: "none" },
                          hover: { fill: selected ? "#d3efd0" : "#91bda0", opacity: visible ? 1 : 0.74, outline: "none" },
                          pressed: { fill: "#d3efd0", outline: "none" },
                        }}
                        role="button"
                        tabIndex={visible ? 0 : -1}
                        aria-label={`Explore ${countryName(country)}${profileForCountry(country, profiles) ? ", country profile available" : ""}`}
                        aria-pressed={selected}
                        onClick={() => visible && selectCountry(country)}
                        onMouseEnter={(event: MouseEvent<SVGPathElement>) => handleMapHover(country, event)}
                        onMouseLeave={() => setHoveredCountry(null)}
                        onKeyDown={(event: KeyboardEvent<SVGPathElement>) => {
                          if (visible && (event.key === "Enter" || event.key === " ")) {
                            event.preventDefault();
                            selectCountry(country);
                          }
                        }}
                      />
                    );
                  })}
                </Geographies>
                <Marker coordinates={selectedPoint}>
                  <circle className={styles.markerHalo} r="9" />
                  <circle className={styles.markerPoint} r="2.6" />
                  <g className={styles.markerLabel} transform="translate(12 -16)">
                    <rect width={Math.max(90, Math.min(180, selectedName.length * 6.5 + 28))} height="28" rx="3" />
                    <text x="10" y="18">{selectedName}</text>
                  </g>
                </Marker>
              </ZoomableGroup>
            </ComposableMap>
          )}
          <div className={styles.mapCoordinates} aria-hidden="true">{selectedPoint[1].toFixed(2)}° {selectedPoint[1] >= 0 ? "N" : "S"}<span />{Math.abs(selectedPoint[0]).toFixed(2)}° {selectedPoint[0] >= 0 ? "E" : "W"}</div>
          {hoveredCountry && hoveredCountry.name !== selectedName ? (
            <div className={styles.mapTooltip} style={{ left: hoveredCountry.x, top: hoveredCountry.y }} role="status">
              <CountryFlag country={hoveredCountry.country} className={styles.tooltipFlag} />{hoveredCountry.name}
            </div>
          ) : null}
          <div className={styles.mapLegend}>
            <span className={styles.legendTitle}>SSE profile coverage</span>
            <span><i className={styles.legendDotStrong} />Profile available</span>
            <span><i className={styles.legendDotQuiet} />Country boundaries</span>
          </div>
          <div className={styles.mapControls} aria-label="Map controls">
            <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => setZoom((value) => Math.min(value + 0.65, 7))}><Plus size={16} /></button>
            <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => setZoom((value) => Math.max(value - 0.65, 1))}><Minus size={16} /></button>
            <span />
            <button type="button" aria-label="Return to world view" title="Return to world view" onClick={() => { setCenter([0, 20]); setZoom(1); }}><Compass size={16} /></button>
          </div>
          <div className={styles.mapStamp}>ATLAS <span>/</span> 01</div>
        </div>

        <aside className={styles.exploreRail} aria-label="Explore countries">
          <div className={styles.railKicker}><span />WORLD ATLAS</div>
          <h1>Explore<br />the world</h1>
          <CountrySearch
            label="Search country..."
            query={query}
            countries={countries}
            selectedId={selectedId}
            onQueryChange={setQuery}
            onSelect={selectCountry}
          />
          <div className={styles.railSection}>
            <div className={styles.sectionLabel}>Regions <span>{countries.length} countries</span></div>
            <div className={styles.regionList}>
              {regionCounts.map(({ region, count }) => (
                <button className={`${styles.regionButton} ${activeRegion === region ? styles.regionActive : ""}`} key={region} type="button" aria-pressed={activeRegion === region} onClick={() => setActiveRegion((current) => current === region ? null : region)}>
                  <span className={styles.regionIndicator} />{region}<small>{count}</small>
                </button>
              ))}
            </div>
          </div>
          <div className={styles.railSection}>
            <div className={styles.sectionLabel}>View</div>
            <div className={styles.viewList}>
              <button className={activeView === "all" ? styles.viewActive : ""} type="button" aria-pressed={activeView === "all"} onClick={() => changeView("all")}><Globe2 size={14} />All countries</button>
              <button className={activeView === "profiles" ? styles.viewActive : ""} type="button" aria-pressed={activeView === "profiles"} onClick={() => changeView("profiles")}><MapPinned size={14} />Published profiles</button>
              <button className={activeView === "compare" ? styles.viewActive : ""} type="button" aria-pressed={activeView === "compare"} onClick={() => changeView("compare")}><ArrowDownUp size={14} />Comparative view</button>
              <button className={activeView === "themes" ? styles.viewActive : ""} type="button" aria-pressed={activeView === "themes"} onClick={() => changeView("themes")}><Layers3 size={14} />Explore by theme</button>
            </div>
            {activeView === "themes" ? (
              <div className={styles.themePicker} aria-label="Filter by theme">
                {themes.map((theme) => <button type="button" key={theme} className={activeTheme === theme ? styles.themeActive : ""} onClick={() => setActiveTheme(theme)}>{theme}</button>)}
              </div>
            ) : null}
          </div>
          <div className={styles.railNote}><span>✳</span><p>Stronger communities.<br />More inclusive economies.<br /><em>A sustainable future.</em></p></div>
          <div className={styles.railFooter}><span>RESEARCH ATLAS</span><span>v. 1.0</span></div>
        </aside>

        <section
          className={`${styles.profilePanel} ${profilePanelSize === "compact" ? styles.profilePanelCompact : profilePanelSize === "expanded" ? styles.profilePanelExpanded : ""}`}
          aria-label={`${selectedName} country profile`}
          aria-live="polite"
          key={selectedId}
        >
          <div className={styles.profileHero}>
            <Image className={styles.heroImage} src={selectedImage} loader={countryImageLoader} alt={`${selectedName}, documentary landscape`} width={1200} height={480} sizes="(max-width: 760px) 100vw, 43vw" quality={82} loading="lazy" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
            <div className={styles.heroOverlay} />
            <div className={styles.heroTopline}>
              <span>COUNTRY PROFILE <i /> ATLAS / 01</span>
              <div className={styles.panelControls} aria-label="Profile panel size">
                <button
                  type="button"
                  onClick={() => setProfilePanelSize("compact")}
                  aria-label="Make profile panel smaller"
                  aria-pressed={profilePanelSize === "compact"}
                  title="Make profile panel smaller"
                >
                  <Minus size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setProfilePanelSize("default")}
                  aria-label="Restore profile panel size"
                  aria-pressed={profilePanelSize === "default"}
                  title="Restore profile panel size"
                >
                  <Minimize2 size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setProfilePanelSize("expanded")}
                  aria-label="Expand profile to the edge of the World Atlas sidebar"
                  aria-pressed={profilePanelSize === "expanded"}
                  title="Expand profile to the edge of the World Atlas sidebar"
                >
                  <Maximize2 size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className={styles.heroHeading}><CountryFlag country={selectedCountry} className={styles.flag} /><h2>{selectedName}</h2></div>
            <div className={styles.heroMeta}>
              <span>{selectedRegion}</span>
              {typeof selectedCountry.properties?.POP_EST === "number" ? <span>{new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(selectedCountry.properties.POP_EST)} estimated population</span> : null}
              {stats.find((stat) => /gni per capita/i.test(stat.label)) ? <span>{stats.find((stat) => /gni per capita/i.test(stat.label))?.value} GNI per capita</span> : null}
            </div>
          </div>

          {stats.length ? (
            <div className={styles.keyFigures} aria-label="Key figures">
              <div className={styles.keyFiguresLabel}><span>COUNTRY DATA</span><strong>Key figures</strong></div>
              {stats.slice(0, 3).map((stat) => <div className={styles.figure} key={`${stat.label}-${stat.value}`}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
            </div>
          ) : null}

          {activeView === "compare" ? (
            <div className={styles.compareBar}>
              <span><ArrowDownUp size={14} /> Compare this profile with</span>
              <select aria-label="Select a country to compare" value={compareId} onChange={(event) => setCompareId(event.target.value)}>
                <option value="">Choose a country</option>
                {featuredCountries.filter(({ country }) => countryId(country) !== selectedId).map(({ country }) => <option value={countryId(country)} key={countryId(country)}>{countryName(country)}</option>)}
              </select>
              {activeCompareProfile ? <span className={styles.compareSummary}>{activeCompareProfile.name}: {activeCompareProfile.summary}</span> : null}
            </div>
          ) : null}

          <div className={styles.articleWorkspace}>
            <aside className={styles.articleRail} aria-label="Article navigation and related topics">
              <span className={styles.tocLabel}>IN THIS PROFILE</span>
              <nav className={styles.toc} aria-label="Country article sections">
                {sections.map((section) => <button className={activeSection === section.id ? styles.tocActive : ""} type="button" key={section.id} aria-current={activeSection === section.id ? "location" : undefined} onClick={() => scrollToSection(section.id)}><span />{section.title}</button>)}
              </nav>
              <div className={styles.relatedTopics}><span className={styles.tocLabel}>RELATED THEMES</span>{themes.slice(0, 4).map((theme) => <button type="button" key={theme} onClick={() => { setActiveView("themes"); setActiveTheme(theme); }}>{theme}</button>)}</div>
              <button className={styles.shareButton} type="button" onClick={shareCountry}><Share2 size={14} />Share profile</button>
              {shareMessage ? <span className={styles.shareStatus} role="status">{shareMessage}</span> : null}
            </aside>
            <div className={styles.articleScroll} ref={articleScrollRef} key={`${selectedId}-article`}>
              <div className={styles.articleIntro}>
                <span className={styles.articleEyebrow}>SOCIAL & SOLIDARITY ECONOMY</span>
                <h3>{profile?.title || selectedName}</h3>
                {profile?.summary ? <p className={styles.articleSummary}>{profile.summary}</p> : null}
              </div>
              {profile?.article ? (
                <div className={styles.articleCopy} ref={articleContentRef} dangerouslySetInnerHTML={{ __html: articleHtml }} />
              ) : (
                <div className={styles.articleUnavailable}><span>RESEARCH NOTE</span><p>A country profile has not yet been published for this location. Browse another place or return to all countries.</p></div>
              )}
              {profile?.sources ? (
                <section className={styles.sources} id="atlas-sources">
                  <span className={styles.articleEyebrow}>RESEARCH TRAIL</span><h4>Sources</h4>
                  {Array.isArray(profile.sources) ? <ul>{profile.sources.map((source, index) => <li key={index}>{typeof source === "string" ? source : JSON.stringify(source)}</li>)}</ul> : <p>{typeof profile.sources === "string" ? profile.sources : JSON.stringify(profile.sources)}</p>}
                </section>
              ) : null}
              <div className={styles.articleEndnote}><span>SEMRG</span><p>Research produced and maintained by the Social Economy Media Research Group.</p></div>
            </div>
          </div>
        </section>

        <div className={styles.carouselDock}>
          <div className={styles.carouselHeading}><span><i />COUNTRY INDEX</span><strong>{featuredCountries.length} profiles</strong></div>
          <button className={styles.carouselArrow} type="button" aria-label="Previous countries" onClick={() => moveCarousel(-1)}><ArrowLeft size={16} /></button>
          <div
            className={styles.countryCarousel}
            ref={carouselRef}
            aria-label="Country profiles"
            tabIndex={0}
            onKeyDown={(event) => { if (event.key === "ArrowRight") moveCarousel(1); if (event.key === "ArrowLeft") moveCarousel(-1); }}
            onWheel={(event) => { if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) { event.preventDefault(); event.currentTarget.scrollBy({ left: event.deltaY, behavior: "auto" }); } }}
            onMouseDown={beginCarouselDrag}
            onMouseMove={moveCarouselDrag}
            onMouseUp={endCarouselDrag}
            onMouseLeave={endCarouselDrag}
            onClickCapture={suppressDraggedClick}
          >
            {featuredCountries.map(({ country, profile: item }) => {
              const id = countryId(country);
              const selected = id === selectedId;
              return (
                <button className={`${styles.countryCard} ${selected ? styles.countryCardSelected : ""}`} type="button" key={id} aria-current={selected ? "true" : undefined} aria-label={`${countryName(country)}${selected ? ", selected" : ""}`} onClick={() => selectCountry(country)}>
                  <Image className={styles.cardImage} src={imageForCountry(id)} loader={countryImageLoader} alt="" width={430} height={200} sizes="158px" quality={68} loading="lazy" />
                  <span className={styles.cardContent}><span><CountryFlag country={country} className={styles.cardFlag} /> <i>{getRegion(country) || "World"}</i></span><strong>{item.name}</strong><small>{selected ? <><Check size={11} /> Selected</> : "Open profile"}</small></span>
                  {selected ? <span className={styles.cardSelectionMark} /> : null}
                </button>
              );
            })}
          </div>
          <button className={styles.carouselArrow} type="button" aria-label="Next countries" onClick={() => moveCarousel(1)}><ArrowRight size={16} /></button>
        </div>
      </section>
    </main>
  );
}