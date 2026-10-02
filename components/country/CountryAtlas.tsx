"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import Image from "next/image";
import { geoCentroid } from "d3-geo";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Globe2,
  Layers3,
  Maximize2,
  MapPinned,
  Minus,
  Minimize2,
  Moon,
  Plus,
  Search,
  Share2,
  Sparkles,
  Sun,
} from "lucide-react";
import { ComposableMap, Geography, Geographies, Marker, ZoomableGroup } from "react-simple-maps";
import countryArticles from "@/data/country-articles.json";
import { persianFallbackProfiles } from "@/components/country/countryFallbackProfiles";
import styles from "./CountryAtlas.module.css";

type Country = {
  id: string;
  name: string;
  rsmKey?: string;
  properties?: {
    ADMIN?: string;
    NAME_EN?: string;
    NAME_FA?: string;
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

type EvidenceCoverage = "Strong" | "Some" | "Not mentioned";
type AiComparisonResult = {
  title: string;
  paragraphs: string[];
  evidenceMap: Array<{
    topic: string;
    firstCoverage: EvidenceCoverage;
    secondCoverage: EvidenceCoverage;
    firstEvidence: string;
    secondEvidence: string;
  }>;
};

type Region = "North America" | "South America" | "Europe" | "Asia" | "Africa" | "Oceania";
type AtlasView = "all" | "profiles" | "compare" | "themes";
type ProfilePanelSize = "compact" | "default" | "expanded";

const mapFile = "/maps/world-countries.geojson";
const regions: Region[] = ["North America", "South America", "Europe", "Asia", "Africa", "Oceania"];
const themes = ["Cooperatives", "Nonprofits", "Social enterprise", "Community development", "Policy & law"];
type Locale = "en" | "fa";

const translations = {
  en: {
    worldAtlas: "WORLD ATLAS", exploreWorld: "Explore the world", searchCountry: "Search country...", searchResults: "Country results", noSearchResults: "No countries found.",
    view: "View", allCountries: "All countries", publishedProfiles: "Published profiles", compareView: "Comparative view", exploreThemes: "Explore by theme", filterThemes: "Filter by theme", regions: "Regions", countries: "countries",
    communityNote: ["Stronger communities.", "More inclusive economies.", "A sustainable future."], researchAtlas: "RESEARCH ATLAS", mapLoading: "Preparing the atlas", mapError: "The world boundary data could not be loaded.",
    mapAria: "Interactive world atlas", mapImageAria: "World map. Select a country to open its profile.", sseCoverage: "SSE profile coverage", profileAvailable: "Profile available", countryBoundaries: "Country boundaries", mapControls: "Map controls", zoomIn: "Zoom in", zoomOut: "Zoom out", worldView: "Return to world view", countryProfile: "COUNTRY PROFILE", atlasStamp: "ATLAS",
    population: "estimated population", estimatedPopulation: "Estimated population", gni: "GNI per capita", countryData: "COUNTRY DATA", keyFigures: "Key figures", compareWith: "Compare this profile with", chooseCountry: "Choose a country", checkAi: "Checking AI availability…", aiCheckError: "AI availability could not be checked; free local comparison remains available.", comparisonReady: "Both articles are ready for an AI comparison.", aiUnavailable: "Generative AI is not configured on this server.", noArticleForAi: "This country does not have a published article for AI comparison.", chooseForComparison: "Choose another country to prepare an article-based comparison.", selectedNoArticle: "The selected country does not have a published article for AI comparison.",
    generateComparison: "Generate comparison", readingArticles: "Reading both articles…", comparativeIntelligence: "COMPARATIVE INTELLIGENCE", comparativeStudy: "Evidence-based comparative study", compareDescription: "Read both full country articles and generate a six-paragraph study with a cited evidence chart.", articleBased: "ARTICLE-BASED, QUALITATIVE", evidenceMap: "Comparative evidence map", topic: "Topic", strong: "Strong", some: "Some", notMentioned: "Not mentioned", noEvidence: "No direct evidence identified in the article.", sharedTheme: "Both country profiles connect social and solidarity economy with", generateStudyHint: "Select Generate comparison to receive a full article-based comparative study.", studySourceNote: "The study uses both complete published articles. Its evidence map quotes the source text; it is qualitative, not a numerical score.",
    choosePublished: "Select a country with a published article to compare these profiles.", noPublishedFor: "No published article is available for", cannotGenerate: "so an article-based comparative study cannot be generated.", localComparison: "Free local comparison is active. Generative AI is not configured on this server.", countrySummaryMissing: "No published summary is available for this country.", countryProfileLabel: "COUNTRY PROFILE", sharedLens: "A SHARED LENS", commonGround: "Common ground", noSharedTheme: "The published profiles do not identify a shared theme yet.", distinctFocus: "DISTINCTIVE FOCUS", differentStrengths: "Different strengths", noUniqueThemes: "No unique themes identified", publishedData: "PUBLISHED DATA", comparableIndicators: "Comparable indicators", noMatchingIndicators: "No matching indicators are published for both countries.", chooseCountryToCompare: "Choose a country to compare", comparePrompt: "Compare published country profiles to uncover shared themes, distinct approaches, and any indicators available in both profiles.",
    inProfile: "IN THIS PROFILE", articleNavigation: "Article navigation", countryArticleSections: "Country article sections", overview: "Overview", sources: "Sources", shareProfile: "Share profile", linkCopied: "Link copied", copyAddress: "Select the address bar to copy this profile", socialEconomy: "SOCIAL & SOLIDARITY ECONOMY", researchNote: "RESEARCH NOTE", articleNotPublished: "A country profile has not yet been published for this location. Browse another place or return to all countries.", researchTrail: "RESEARCH TRAIL", endnote: "Research produced and maintained by the Social Economy Media Research Group.",
    countryIndex: "COUNTRY INDEX", profiles: "profiles", previousCountries: "Previous countries", nextCountries: "Next countries", countryProfiles: "Country profiles", selected: "Selected", openProfile: "Open profile", documentaryLandscape: "documentary landscape", restorePanel: "Restore profile panel size", shrinkPanel: "Make profile panel smaller", exitFullscreen: "Exit full-screen profile", expandFullscreen: "Expand profile to full screen", decreaseText: "Decrease profile text size", increaseText: "Increase profile text size", minimumSize: "minimum size", maximumSize: "maximum size", darkTheme: "Switch to dark reading theme", lightTheme: "Switch to light reading theme", returnToProfile: "Return to country profile", openComparison: "Open country comparison", displayControls: "Profile display controls", compareCountryLabel: "Select a country to compare",
    countryProfileAvailable: "country profile available", selectedCountry: "selected", mapLegend: "SSE profile coverage", returnToWorld: "Return to world view",
  },
  fa: {
    worldAtlas: "اطلس جهان", exploreWorld: "کاوش در جهان", searchCountry: "جست‌وجوی کشور...", searchResults: "نتایج کشورها", noSearchResults: "کشوری پیدا نشد.",
    view: "نمایش", allCountries: "همهٔ کشورها", publishedProfiles: "پروفایل‌های منتشرشده", compareView: "مقایسهٔ کشورها", exploreThemes: "کاوش بر پایهٔ موضوع", filterThemes: "فیلتر بر پایهٔ موضوع", regions: "قاره‌ها", countries: "کشور",
    communityNote: ["جامعه‌هایی توانمندتر.", "اقتصادهایی فراگیرتر.", "آینده‌ای پایدار."], researchAtlas: "اطلس پژوهش", mapLoading: "در حال آماده‌سازی اطلس…", mapError: "بارگذاری مرزهای کشورها ممکن نشد.",
    mapAria: "اطلس تعاملی جهان", mapImageAria: "نقشهٔ جهان؛ برای دیدن پروفایل، یک کشور را انتخاب کنید.", sseCoverage: "پوشش پروفایل‌های اقتصاد اجتماعی و همبستگی", profileAvailable: "پروفایل منتشرشده", countryBoundaries: "مرز کشورها", mapControls: "ابزارهای نقشه", zoomIn: "بزرگ‌نمایی", zoomOut: "کوچک‌نمایی", worldView: "بازگشت به نمای جهان", countryProfile: "پروفایل کشور", atlasStamp: "اطلس",
    population: "جمعیت برآوردی", estimatedPopulation: "جمعیت برآوردی", gni: "درآمد ناخالص ملی سرانه", countryData: "داده‌های کشور", keyFigures: "شاخص‌های کلیدی", compareWith: "مقایسهٔ این پروفایل با", chooseCountry: "انتخاب کشور", checkAi: "در حال بررسی دسترس‌پذیری هوش مصنوعی…", aiCheckError: "بررسی هوش مصنوعی ممکن نشد؛ مقایسهٔ محلی همچنان در دسترس است.", comparisonReady: "مقالهٔ هر دو کشور برای مقایسهٔ هوشمند آماده است.", aiUnavailable: "هوش مصنوعی مولد روی این سرور پیکربندی نشده است.", noArticleForAi: "برای این کشور مقالهٔ منتشرشده‌ای جهت مقایسهٔ هوشمند وجود ندارد.", chooseForComparison: "برای آماده‌سازی مقایسهٔ مقاله‌محور، کشور دیگری انتخاب کنید.", selectedNoArticle: "برای کشور انتخاب‌شده مقالهٔ منتشرشده‌ای جهت مقایسهٔ هوشمند وجود ندارد.",
    generateComparison: "ساخت مقایسه", readingArticles: "در حال خواندن مقاله‌ها…", comparativeIntelligence: "تحلیل تطبیقی", comparativeStudy: "مطالعهٔ تطبیقی بر پایهٔ شواهد", compareDescription: "با خواندن مقالهٔ کامل هر کشور، تحلیلی شش‌بندی همراه با جدول شواهد تهیه کنید.", articleBased: "کیفی و مبتنی بر مقاله", evidenceMap: "نقشهٔ شواهد تطبیقی", topic: "موضوع", strong: "پوشش روشن", some: "اشارهٔ محدود", notMentioned: "ذکر نشده", noEvidence: "شاهد مستقیمی در مقاله پیدا نشد.", sharedTheme: "پروفایل هر دو کشور اقتصاد اجتماعی و همبستگی را به این موضوع‌ها پیوند می‌دهد:", generateStudyHint: "برای دریافت مطالعهٔ تطبیقی بر پایهٔ مقاله‌ها، «ساخت مقایسه» را انتخاب کنید.", studySourceNote: "این مطالعه بر پایهٔ مقاله‌های کامل منتشرشده است. نقل‌قول‌های نقشهٔ شواهد مستقیماً از متن منبع می‌آیند؛ نتیجه کیفی است و امتیاز عددی محسوب نمی‌شود.",
    choosePublished: "برای مقایسه، کشوری را انتخاب کنید که مقالهٔ آن منتشر شده باشد.", noPublishedFor: "برای کشور", cannotGenerate: "مقالهٔ منتشرشده‌ای نیست؛ بنابراین مطالعهٔ تطبیقی مقاله‌محور ممکن نیست.", localComparison: "مقایسهٔ محلی رایگان فعال است؛ هوش مصنوعی مولد روی این سرور پیکربندی نشده است.", countrySummaryMissing: "خلاصهٔ منتشرشده‌ای برای این کشور در دسترس نیست.", countryProfileLabel: "پروفایل کشور", sharedLens: "نگاه مشترک", commonGround: "زمینه‌های مشترک", noSharedTheme: "هنوز موضوع مشترکی در پروفایل‌های منتشرشده شناسایی نشده است.", distinctFocus: "تمرکزهای متمایز", differentStrengths: "تفاوت رویکردها", noUniqueThemes: "موضوع متمایزی شناسایی نشد", publishedData: "داده‌های منتشرشده", comparableIndicators: "شاخص‌های قابل‌مقایسه", noMatchingIndicators: "شاخص مشترکی برای هر دو کشور منتشر نشده است.", chooseCountryToCompare: "کشوری را برای مقایسه انتخاب کنید", comparePrompt: "پروفایل‌های منتشرشدهٔ کشورها را مقایسه کنید تا زمینه‌های مشترک، رویکردهای متفاوت و شاخص‌های قابل‌مقایسه را ببینید.",
    inProfile: "در این پروفایل", articleNavigation: "پیمایش مقاله", countryArticleSections: "بخش‌های مقالهٔ کشور", overview: "مرور کلی", sources: "منابع", shareProfile: "اشتراک‌گذاری پروفایل", linkCopied: "پیوند کپی شد", copyAddress: "برای کپی این پروفایل، نوار نشانی مرورگر را انتخاب کنید", socialEconomy: "اقتصاد اجتماعی و همبستگی", researchNote: "یادداشت پژوهشی", articleNotPublished: "هنوز پروفایلی برای این کشور منتشر نشده است. کشور دیگری را ببینید یا به نمای همهٔ کشورها برگردید.", researchTrail: "ردپای پژوهش", endnote: "این پژوهش را گروه پژوهش رسانه‌ای اقتصاد اجتماعی تهیه و نگهداری می‌کند.",
    countryIndex: "نمایهٔ کشورها", profiles: "پروفایل", previousCountries: "کشورهای پیشین", nextCountries: "کشورهای بعدی", countryProfiles: "پروفایل کشورهای جهان", selected: "انتخاب‌شده", openProfile: "نمایش پروفایل", documentaryLandscape: "تصویر مستند از چشم‌انداز کشور", restorePanel: "بازگرداندن اندازهٔ پنل پروفایل", shrinkPanel: "کوچک‌کردن پنل پروفایل", exitFullscreen: "خروج از نمایش تمام‌صفحه", expandFullscreen: "نمایش پروفایل در تمام‌صفحه", decreaseText: "کوچک‌کردن اندازهٔ نوشته", increaseText: "بزرگ‌کردن اندازهٔ نوشته", minimumSize: "حداقل اندازه", maximumSize: "حداکثر اندازه", darkTheme: "تغییر به زمینهٔ تیره", lightTheme: "تغییر به زمینهٔ روشن", returnToProfile: "بازگشت به پروفایل کشور", openComparison: "بازکردن مقایسهٔ کشورها", displayControls: "تنظیمات نمایش پروفایل", compareCountryLabel: "انتخاب کشور برای مقایسه",
    countryProfileAvailable: "پروفایل کشور در دسترس است", selectedCountry: "انتخاب‌شده", mapLegend: "پوشش پروفایل‌های اقتصاد اجتماعی و همبستگی", returnToWorld: "بازگشت به نمای جهان",
  },
} as const;

const regionLabels: Record<Region, { en: string; fa: string }> = {
  "North America": { en: "North America", fa: "آمریکای شمالی" }, "South America": { en: "South America", fa: "آمریکای جنوبی" },
  Europe: { en: "Europe", fa: "اروپا" }, Asia: { en: "Asia", fa: "آسیا" }, Africa: { en: "Africa", fa: "آفریقا" }, Oceania: { en: "Oceania", fa: "اقیانوسیه" },
};

const themeLabels: Record<string, { en: string; fa: string }> = {
  Cooperatives: { en: "Cooperatives", fa: "تعاونی‌ها" }, Nonprofits: { en: "Nonprofits", fa: "سازمان‌های غیرانتفاعی" },
  "Social enterprise": { en: "Social enterprise", fa: "بنگاه اجتماعی" }, "Community development": { en: "Community development", fa: "توسعهٔ جامعه‌محور" }, "Policy & law": { en: "Policy & law", fa: "سیاست‌گذاری و قانون" },
};

const statisticLabelsFa: Record<string, string> = {
  "estimated population": "جمعیت برآوردی",
  population: "جمعیت",
  "gni per capita": "درآمد ناخالص ملی سرانه",
  "gni per person": "درآمد ناخالص ملی سرانه",
  "gdp per capita": "تولید ناخالص داخلی سرانه",
  gdp: "تولید ناخالص داخلی",
  cooperatives: "تعاونی‌ها",
  "number of cooperatives": "تعداد تعاونی‌ها",
  "cooperative members": "اعضای تعاونی‌ها",
  "social enterprises": "بنگاه‌های اجتماعی",
  "nonprofit organizations": "سازمان‌های غیرانتفاعی",
  "non-profit organizations": "سازمان‌های غیرانتفاعی",
  employment: "اشتغال",
  employees: "شاغلان",
  jobs: "فرصت‌های شغلی",
  organizations: "سازمان‌ها",
  members: "اعضا",
};

const themeTerms: Record<string, string[]> = {
  Cooperatives: ["cooperat", "mutual", "worker ownership", "تعاونی", "همیاری", "مالکیت کارگری"],
  Nonprofits: ["nonprofit", "non-profit", "association", "charit", "غیرانتفاعی", "انجمن", "خیریه"],
  "Social enterprise": ["social enterprise", "social business", "purpose-led", "بنگاه اجتماعی", "کسب‌وکار اجتماعی", "هدف‌محور"],
  "Community development": ["community", "local development", "neighborhood", "جامعه", "توسعه محلی", "محله", "محلی"],
  "Policy & law": ["policy", "legislation", "law", "regulation", "framework", "سیاست", "قانون", "مقررات", "چارچوب"],
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

function countryName(country?: Country | null, locale: Locale = "en"): string {
  if (locale === "fa") return country?.properties?.NAME_FA || country?.name || country?.properties?.ADMIN || "کشور";
  return country?.properties?.ADMIN || country?.properties?.NAME_EN || country?.name || "Country";
}

function localizeDigits(value: string | number, locale: Locale): string {
  return String(value).replace(/[0-9]/g, (digit) => locale === "fa" ? "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] : digit);
}

function localizeStatisticLabel(label: string, locale: Locale): string {
  return locale === "fa" ? statisticLabelsFa[label.trim().toLowerCase()] || label : label;
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

function isAiComparisonResult(value: unknown): value is AiComparisonResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;
  if (
    typeof result.title !== "string"
    || !Array.isArray(result.paragraphs)
    || result.paragraphs.length < 5
    || result.paragraphs.length > 6
    || result.paragraphs.some((paragraph) => typeof paragraph !== "string" || paragraph.trim().split(/\s+/).length < 40)
    || !Array.isArray(result.evidenceMap)
    || result.evidenceMap.length < 3
    || result.evidenceMap.length > 6
  ) return false;

  return result.evidenceMap.every((item) => {
    if (!item || typeof item !== "object") return false;
    const evidence = item as Record<string, unknown>;
    const validCoverage = (coverage: unknown) =>
      coverage === "Strong" || coverage === "Some" || coverage === "Not mentioned";
    return typeof evidence.topic === "string"
      && validCoverage(evidence.firstCoverage)
      && validCoverage(evidence.secondCoverage)
      && typeof evidence.firstEvidence === "string"
      && typeof evidence.secondEvidence === "string";
  });
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

function profileThemes(profile?: CountryProfile): string[] {
  const text = `${profile?.title || ""} ${profile?.summary || ""} ${profile?.article || ""}`.toLowerCase();
  return Object.entries(themeTerms)
    .filter(([, terms]) => terms.some((term) => text.includes(term)))
    .map(([theme]) => theme);
}

function CountrySearch({
  className,
  locale,
  label,
  query,
  countries,
  selectedId,
  onQueryChange,
  onSelect,
  compact = false,
}: {
  className?: string;
  locale: Locale;
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
    return countries.filter((country) => countryName(country, locale).toLowerCase().includes(normalized)
      || countryName(country, "en").toLowerCase().includes(normalized)).slice(0, 7);
  }, [countries, locale, query]);

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
        <div className={styles.searchResults} id={compact ? "atlas-search-results-top" : "atlas-search-results-rail"} role="listbox" aria-label={translations[locale].searchResults}>
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
                <span>{countryName(country, locale)}</span>
                <small>{getRegion(country) ? regionLabels[getRegion(country)!][locale] : locale === "fa" ? "جهان" : "World"}</small>
              </button>
            );
          }) : <p className={styles.emptyResult}>{translations[locale].noSearchResults}</p>}
        </div>
      ) : null}
    </div>
  );
}

export default function CountryAtlas({ locale = "en" }: { locale?: "en" | "fa" }) {
  const isPersian = locale === "fa";
  const copy = translations[locale];
  const [countries, setCountries] = useState<Country[]>([]);
  const [profiles, setProfiles] = useState<CountryProfile[]>(isPersian ? persianFallbackProfiles : countryArticles);
  const [selectedId, setSelectedId] = useState("USA");
  const [profilePanelSize, setProfilePanelSize] = useState<ProfilePanelSize>("compact");
  const [profileFontScale, setProfileFontScale] = useState(140);
  const [profileLightMode, setProfileLightMode] = useState(false);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [zoom, setZoom] = useState(1);
  const [query, setQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [activeView, setActiveView] = useState<AtlasView>("all");
  const [activeTheme, setActiveTheme] = useState(themes[0]);
  const [compareId, setCompareId] = useState("");
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<AiComparisonResult | null>(null);
  const [aiError, setAiError] = useState("");
  const [aiStatusError, setAiStatusError] = useState("");
  const [hoveredCountry, setHoveredCountry] = useState<{ country: Country; name: string; x: number; y: number } | null>(null);
  const [mapError, setMapError] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [sections, setSections] = useState<Array<{ id: string; title: string }>>([{ id: "overview", title: translations[locale].overview }]);
  const [shareMessage, setShareMessage] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselDrag = useRef<{ startX: number; scrollLeft: number } | null>(null);
  const draggedCarousel = useRef(false);
  const articleScrollRef = useRef<HTMLDivElement>(null);
  const articleContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profilePanelSize !== "expanded") return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setProfilePanelSize("default");
        setProfileLightMode(false);
        setActiveView("all");
        setCompareId("");
        setAiInsight(null);
        setAiError("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [profilePanelSize]);

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
    fetch(`${apiBase}/wp-json/sse/v1/countries?locale=${locale}`)
      .then((response) => {
        if (!response.ok) throw new Error("Country profiles unavailable");
        return response.json();
      })
      .then((data: CountryProfile[]) => {
        if (!active || !Array.isArray(data)) return;
        const merged = isPersian ? [...data, ...persianFallbackProfiles] : [...countryArticles, ...data];
        const unique = merged.filter((profile, index) => merged.findIndex((item) => item.id.toUpperCase() === profile.id.toUpperCase()) === index);
        setProfiles(unique);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [isPersian, locale]);

  useEffect(() => {
    let active = true;
    fetch(`/api/country-comparison?locale=${locale}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("AI availability could not be checked.");
        const data: unknown = await response.json();
        if (active && data && typeof data === "object" && "aiAvailable" in data && typeof data.aiAvailable === "boolean") {
          setAiAvailable(data.aiAvailable);
        } else {
          throw new Error("AI availability response was invalid.");
        }
      })
      .catch(() => { if (active) setAiStatusError(copy.aiCheckError); });
    return () => { active = false; };
  }, [copy.aiCheckError, locale]);

  const selectedCountry = countries.find((country) => countryId(country) === selectedId)
    || ({ id: selectedId, name: profiles.find((profile) => profile.id === selectedId)?.name || "United States of America" } as Country);
  const profile = profileForCountry(selectedCountry, profiles);
  const selectedName = profile?.name || countryName(selectedCountry, locale);
  const selectedRegion = getRegion(selectedCountry) || "North America";
  const selectedRegionName = regionLabels[selectedRegion][locale];
  const selectedPoint: [number, number] = typeof profile?.longitude === "number" && typeof profile.latitude === "number"
    ? [profile.longitude, profile.latitude]
    : pointForCountry(selectedCountry);
  const selectedImage = imageForCountry(selectedId);
  const profilePanelStyle: CSSProperties & { "--profile-font-scale": number } = {
    "--profile-font-scale": profileFontScale / 100,
  };
  const stats = displayStatistics(profile?.statistics).map((stat) => ({ ...stat, label: localizeStatisticLabel(stat.label, locale) }));
  const articleHtml = articleMarkup(profile?.article);
  const activeCompareProfile = profiles.find((item) => item.id.toUpperCase() === compareId.toUpperCase());
  const activeCompareCountry = countries.find((country) => countryId(country).toUpperCase() === compareId.toUpperCase());
  const activeCompareName = activeCompareProfile?.name || (activeCompareCountry ? countryName(activeCompareCountry, locale) : "");
  const canGenerateComparison = Boolean(profile?.article && activeCompareProfile?.article && aiAvailable);
  const comparisonAvailabilityMessage = !profile?.article
    ? copy.noArticleForAi
    : !compareId
      ? copy.chooseForComparison
      : !activeCompareProfile?.article
        ? copy.selectedNoArticle
        : aiAvailable === null
          ? aiStatusError || copy.checkAi
          : aiAvailable
            ? copy.comparisonReady
            : copy.aiUnavailable;
  const sharedThemes = profileThemes(profile).filter((theme) => profileThemes(activeCompareProfile).includes(theme));
  const selectedOnlyThemes = profileThemes(profile).filter((theme) => !profileThemes(activeCompareProfile).includes(theme));
  const compareOnlyThemes = profileThemes(activeCompareProfile).filter((theme) => !profileThemes(profile).includes(theme));
  const compareStats = displayStatistics(activeCompareProfile?.statistics).map((stat) => ({ ...stat, label: localizeStatisticLabel(stat.label, locale) }));
  const comparableStatistics = [
    ...stats,
    ...(typeof selectedCountry.properties?.POP_EST === "number"
      ? [{ label: copy.estimatedPopulation, value: new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en", { notation: "compact", maximumFractionDigits: 1 }).format(selectedCountry.properties.POP_EST) }]
      : []),
  ].flatMap((stat) => {
    const match = compareStats.find((item) => item.label.trim().toLowerCase() === stat.label.trim().toLowerCase())
      || (stat.label === copy.estimatedPopulation && typeof activeCompareCountry?.properties?.POP_EST === "number"
        ? { label: stat.label, value: new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en", { notation: "compact", maximumFractionDigits: 1 }).format(activeCompareCountry.properties.POP_EST) }
        : undefined);
    return match ? [{ label: stat.label, first: stat.value, second: match.value }] : [];
  });


  const regionCounts = useMemo(() => regions.map((region) => ({
    region,
    count: localizeDigits(countries.filter((country) => getRegion(country) === region).length, locale),
  })), [countries, locale]);

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
      return { id, title: heading.textContent?.trim() || `${locale === "fa" ? "بخش" : "Section"} ${localizeDigits(index + 1, locale)}` };
    });
    const nextSections = [{ id: "overview", title: copy.overview }, ...entries];
    if (profile?.sources) nextSections.push({ id: "sources", title: copy.sources });
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
  }, [articleHtml, copy.overview, copy.sources, locale, profile?.sources, selectedId]);

  function selectCountry(country: Country, shouldFly = true) {
    const id = countryId(country);
    if (activeView === "compare" && id !== selectedId) {
      chooseCompareCountry(id);
      return;
    }
    setAiInsight(null);
    setAiError("");
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
    const nextView = activeView === view && view === "compare" ? "all" : view;
    setActiveView(nextView);
    if (nextView !== "compare") {
      setCompareId("");
      setAiInsight(null);
      setAiError("");
    }
  }

  function exitExpandedProfile() {
    setProfilePanelSize("default");
    setProfileLightMode(false);
    changeView("all");
  }

  function chooseCompareCountry(id: string) {
    setCompareId(id);
    setAiInsight(null);
    setAiError("");
  }

  async function requestAiComparison() {
    if (!profile || !activeCompareProfile) {
      setAiError(copy.choosePublished);
      return;
    }
    setAiLoading(true);
    setAiError("");
    try {
      const response = await fetch("/api/country-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          first: {
            id: selectedId,
            name: selectedName,
            summary: profile.summary || "",
            article: profile.article || "",
            statistics: stats,
            population: selectedCountry.properties?.POP_EST,
          },
          second: {
            id: compareId,
            name: activeCompareProfile.name,
            summary: activeCompareProfile.summary || "",
            article: activeCompareProfile.article || "",
            statistics: compareStats,
            population: activeCompareCountry?.properties?.POP_EST,
          },
        }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : (isPersian ? "ساخت مقایسهٔ هوشمند ممکن نشد." : "The AI comparison could not be generated.");
        throw new Error(message);
      }
      if (!data || typeof data !== "object" || !("comparison" in data) || !isAiComparisonResult(data.comparison)) {
        throw new Error(isPersian ? "پاسخ مقایسهٔ هوشمند معتبر نیست." : "The AI service returned an invalid comparison.");
      }
      setAiInsight(data.comparison);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : (isPersian ? "ساخت مقایسهٔ هوشمند ممکن نشد." : "The AI comparison could not be generated."));
    } finally {
      setAiLoading(false);
    }
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
    setHoveredCountry({ country, name: countryName(country, locale), x: event.clientX - bounds.left + 14, y: event.clientY - bounds.top + 12 });
  }

  async function shareCountry() {
    const shareUrl = `${window.location.origin}/${locale}/country-explorer#${selectedId.toLowerCase()}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage(copy.linkCopied);
    } catch {
      setShareMessage(copy.copyAddress);
    }
    window.setTimeout(() => setShareMessage(""), 2200);
  }

  return (
    <main className={`${styles.atlas} ${isPersian ? styles.atlasPersian : ""}`} dir={isPersian ? "rtl" : "ltr"} lang={locale}>
      <section className={styles.atlasStage} aria-label={copy.mapAria}>
        <div className={styles.mapSurface} ref={mapRef}>
          {mapError ? <div className={styles.mapMessage}>{copy.mapError}</div> : countries.length === 0 ? (
            <div className={styles.mapMessage}><span className={styles.loadingPulse} />{copy.mapLoading}</div>
          ) : (
            <ComposableMap
              className={styles.worldMap}
              projection="geoEqualEarth"
              projectionConfig={{ scale: 156 }}
              width={1200}
              height={720}
              role="img"
              aria-label={copy.mapImageAria}
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
                        aria-label={`${isPersian ? "کاوش در" : "Explore"} ${countryName(country, locale)}${profileForCountry(country, profiles) ? `${isPersian ? "، " : ", "}${copy.countryProfileAvailable}` : ""}`}
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
          <div className={styles.mapCoordinates} aria-hidden="true">{localizeDigits(selectedPoint[1].toFixed(2), locale)}° {selectedPoint[1] >= 0 ? (isPersian ? "ش" : "N") : (isPersian ? "ج" : "S")}<span />{localizeDigits(Math.abs(selectedPoint[0]).toFixed(2), locale)}° {selectedPoint[0] >= 0 ? (isPersian ? "خ" : "E") : (isPersian ? "غ" : "W")}</div>
          {hoveredCountry && hoveredCountry.name !== selectedName ? (
            <div className={styles.mapTooltip} style={{ left: hoveredCountry.x, top: hoveredCountry.y }} role="status">
              <CountryFlag country={hoveredCountry.country} className={styles.tooltipFlag} />{hoveredCountry.name}
            </div>
          ) : null}
          <div className={styles.mapLegend}>
            <span className={styles.legendTitle}>{copy.sseCoverage}</span>
            <span><i className={styles.legendDotStrong} />{copy.profileAvailable}</span>
            <span><i className={styles.legendDotQuiet} />{copy.countryBoundaries}</span>
          </div>
          <div className={styles.mapControls} aria-label={copy.mapControls}>
            <button type="button" aria-label={copy.zoomIn} title={copy.zoomIn} onClick={() => setZoom((value) => Math.min(value + 0.65, 7))}><Plus size={16} /></button>
            <button type="button" aria-label={copy.zoomOut} title={copy.zoomOut} onClick={() => setZoom((value) => Math.max(value - 0.65, 1))}><Minus size={16} /></button>
            <span />
            <button type="button" aria-label={copy.worldView} title={copy.worldView} onClick={() => { setCenter([0, 20]); setZoom(1); }}><Compass size={16} /></button>
          </div>
          <div className={styles.mapStamp}>{copy.atlasStamp} <span>/</span> {localizeDigits("01", locale)}</div>
        </div>

        <aside className={styles.exploreRail} aria-label={copy.exploreThemes}>
          <div className={styles.railKicker}><span />{copy.worldAtlas}</div>
          <h1>{isPersian ? <>کاوش در<br />جهان</> : <>Explore<br />the world</>}</h1>
          <CountrySearch
            locale={locale}
            label={copy.searchCountry}
            query={query}
            countries={countries}
            selectedId={selectedId}
            onQueryChange={setQuery}
            onSelect={selectCountry}
          />
          <div className={styles.railSection}>
            <div className={styles.sectionLabel}>{copy.view}</div>
            <div className={styles.viewList}>
              <button className={activeView === "all" ? styles.viewActive : ""} type="button" aria-pressed={activeView === "all"} onClick={() => changeView("all")}><Globe2 size={16} />{copy.allCountries}</button>
              <button className={activeView === "profiles" ? styles.viewActive : ""} type="button" aria-pressed={activeView === "profiles"} onClick={() => changeView("profiles")}><MapPinned size={16} />{copy.publishedProfiles}</button>
              <button className={activeView === "compare" ? styles.viewActive : ""} type="button" aria-pressed={activeView === "compare"} onClick={() => changeView("compare")}><ArrowDownUp size={16} />{copy.compareView}</button>
              <button className={activeView === "themes" ? styles.viewActive : ""} type="button" aria-pressed={activeView === "themes"} onClick={() => changeView("themes")}><Layers3 size={16} />{copy.exploreThemes}</button>
            </div>
            {activeView === "themes" ? (
              <div className={styles.themePicker} aria-label={copy.filterThemes}>
                {themes.map((theme) => <button type="button" key={theme} className={activeTheme === theme ? styles.themeActive : ""} onClick={() => setActiveTheme(theme)}>{themeLabels[theme][locale]}</button>)}
              </div>
            ) : null}
          </div>
          <div className={styles.railSection}>
            <div className={styles.sectionLabel}>{copy.regions} <span>{localizeDigits(countries.length, locale)} {copy.countries}</span></div>
            <div className={styles.regionList}>
              {regionCounts.map(({ region, count }) => (
                <button className={`${styles.regionButton} ${activeRegion === region ? styles.regionActive : ""}`} key={region} type="button" aria-pressed={activeRegion === region} onClick={() => setActiveRegion((current) => current === region ? null : region)}>
                  <span className={styles.regionIndicator} />{regionLabels[region][locale]}<small>{count}</small>
                </button>
              ))}
            </div>
          </div>
          <div className={styles.railNote}><span>✳</span><p>{copy.communityNote.map((line, index) => <Fragment key={line}>{index === 2 ? <em>{line}</em> : line}{index < 2 ? <br /> : null}</Fragment>)}</p></div>
          <div className={styles.railFooter}><span>{copy.researchAtlas}</span><span>v. {localizeDigits("1.0", locale)}</span></div>
        </aside>

        <section
          className={`${styles.profilePanel} ${profilePanelSize === "compact" ? styles.profilePanelCompact : profilePanelSize === "expanded" ? styles.profilePanelExpanded : ""} ${profilePanelSize === "expanded" && profileLightMode ? styles.profilePanelLight : ""}`}
          style={profilePanelStyle}
          aria-label={`${selectedName} ${copy.countryProfile}`}
          aria-live="polite"
          key={selectedId}
        >
          <div className={styles.profileHero}>
            <Image className={styles.heroImage} src={selectedImage} loader={countryImageLoader} alt={`${selectedName}، ${copy.documentaryLandscape}`} width={1200} height={480} sizes="(max-width: 760px) 100vw, 43vw" quality={82} loading="lazy" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
            <div className={styles.heroOverlay} />
            <div className={styles.heroTopline}>
              <span>{copy.countryProfile} <i /> {copy.atlasStamp} / {localizeDigits("01", locale)}</span>
              <div className={styles.panelControls} aria-label={copy.displayControls}>
                <button
                  type="button"
                  className={styles.comparisonToggle}
                  onClick={() => changeView("compare")}
                  aria-label={activeView === "compare" ? copy.returnToProfile : copy.openComparison}
                  aria-pressed={activeView === "compare"}
                  title={activeView === "compare" ? copy.returnToProfile : copy.openComparison}
                >
                  <ArrowDownUp size={15} aria-hidden="true" />
                </button>
                {profilePanelSize === "expanded" ? (
                  <>
                    <button
                      type="button"
                      className={styles.fontDecrease}
                      onClick={() => setProfileFontScale((scale) => Math.max(80, scale - 10))}
                      aria-label={`${copy.decreaseText}${profileFontScale <= 80 ? ` (${copy.minimumSize})` : ` (${localizeDigits(profileFontScale - 10, locale)}٪)`}`}
                      disabled={profileFontScale <= 80}
                      title={copy.decreaseText}
                    >
                      <Minus size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={styles.fontIncrease}
                      onClick={() => setProfileFontScale((scale) => Math.min(180, scale + 10))}
                      aria-label={`${copy.increaseText}${profileFontScale >= 180 ? ` (${copy.maximumSize})` : ` (${localizeDigits(profileFontScale + 10, locale)}٪)`}`}
                      disabled={profileFontScale >= 180}
                      title={copy.increaseText}
                    >
                      <Plus size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={styles.lightModeToggle}
                      onClick={() => setProfileLightMode((isLight) => !isLight)}
                      aria-label={profileLightMode ? copy.darkTheme : copy.lightTheme}
                      aria-pressed={profileLightMode}
                      title={profileLightMode ? copy.darkTheme : copy.lightTheme}
                    >
                      {profileLightMode ? <Moon size={15} aria-hidden="true" /> : <Sun size={15} aria-hidden="true" />}
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  className={styles.panelSizeToggle}
                  onClick={() => profilePanelSize === "expanded" ? exitExpandedProfile() : setProfilePanelSize((size) => size === "compact" ? "default" : "compact")}
                  aria-label={profilePanelSize === "compact" ? copy.restorePanel : copy.shrinkPanel}
                  aria-pressed={profilePanelSize === "compact"}
                  title={profilePanelSize === "compact" ? copy.restorePanel : copy.shrinkPanel}
                >
                  <Minimize2 size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={styles.expandProfile}
                  onClick={() => {
                    if (profilePanelSize === "expanded") {
                      exitExpandedProfile();
                    } else {
                      setProfileFontScale((scale) => Math.max(140, scale));
                      setProfilePanelSize("expanded");
                    }
                  }}
                  aria-label={profilePanelSize === "expanded" ? copy.exitFullscreen : copy.expandFullscreen}
                  aria-pressed={profilePanelSize === "expanded"}
                  title={profilePanelSize === "expanded" ? copy.exitFullscreen : copy.expandFullscreen}
                >
                  {profilePanelSize === "expanded" ? <Minimize2 size={15} aria-hidden="true" /> : <Maximize2 size={15} aria-hidden="true" />}
                </button>
              </div>
            </div>
            <div className={styles.heroHeading}><CountryFlag country={selectedCountry} className={styles.flag} /><h2>{selectedName}</h2></div>
            <div className={styles.heroMeta}>
              <span>{selectedRegionName}</span>
              {typeof selectedCountry.properties?.POP_EST === "number" ? <span>{new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en", { notation: "compact", maximumFractionDigits: 1 }).format(selectedCountry.properties.POP_EST)} {copy.population}</span> : null}
              {stats.find((stat) => /gni per capita|درآمد ناخالص ملی سرانه/i.test(stat.label)) ? <span>{localizeDigits(stats.find((stat) => /gni per capita|درآمد ناخالص ملی سرانه/i.test(stat.label))?.value || "", locale)} {copy.gni}</span> : null}
            </div>
          </div>

          {stats.length ? (
            <div className={styles.keyFigures} aria-label={copy.keyFigures}>
              <div className={styles.keyFiguresLabel}><span>{copy.countryData}</span><strong>{copy.keyFigures}</strong></div>
              {stats.slice(0, 3).map((stat) => <div className={styles.figure} key={`${stat.label}-${stat.value}`}><strong>{localizeDigits(stat.value, locale)}</strong><span>{stat.label}</span></div>)}
            </div>
          ) : null}

          {activeView === "compare" ? (
            <div className={styles.compareBar}>
              <span><ArrowDownUp size={16} /> {copy.compareWith}</span>
              <select aria-label={copy.compareCountryLabel} value={compareId} onChange={(event) => chooseCompareCountry(event.target.value)}>
                <option value="">{copy.chooseCountry}</option>
                {featuredCountries.filter(({ country }) => countryId(country) !== selectedId).map(({ country }) => <option value={countryId(country)} key={countryId(country)}>{countryName(country, locale)}</option>)}
              </select>
              <span className={styles.compareSummary} role="status">{comparisonAvailabilityMessage}</span>
              <button
                className={styles.generateComparisonButton}
                type="button"
                onClick={requestAiComparison}
                disabled={!canGenerateComparison || aiLoading}
                title={comparisonAvailabilityMessage}
              >
                {aiLoading ? copy.readingArticles : <><Sparkles size={14} /> {copy.generateComparison}</>}
              </button>
            </div>
          ) : null}

          {activeView === "compare" ? (
            <div className={styles.compareWorkspace}>
              {activeCompareProfile || activeCompareCountry ? (
                <>
                  <section className={styles.aiPanel} aria-live="polite">
                    <div className={styles.aiPanelHeading}>
                      <div>
                        <span className={styles.articleEyebrow}><Sparkles size={12} /> {copy.comparativeIntelligence}</span>
                        <h3>{aiInsight?.title || copy.comparativeStudy}</h3>
                        <p>{copy.compareDescription}</p>
                      </div>
                    </div>
                    {aiInsight ? (
                      <div className={styles.aiStudy}>
                        <div className={styles.aiParagraphs}>
                          {aiInsight.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)}
                        </div>
                        <section className={styles.evidenceChart} aria-label={copy.evidenceMap}>
                          <div className={styles.evidenceChartHeading}>
                            <div><span className={styles.articleEyebrow}>{copy.articleBased}</span><h4>{copy.evidenceMap}</h4></div>
                            <div className={styles.evidenceLegend}><span><i className={styles.coverageStrong} />{copy.strong}</span><span><i className={styles.coverageSome} />{copy.some}</span><span><i className={styles.coverageAbsent} />{copy.notMentioned}</span></div>
                          </div>
                          <div className={styles.evidenceChartHeader}><span>{copy.topic}</span><span>{selectedName}</span><span>{activeCompareName}</span></div>
                          {aiInsight.evidenceMap.map((item) => (
                            <div className={styles.evidenceChartRow} key={item.topic}>
                              <strong>{item.topic}</strong>
                              {[{ coverage: item.firstCoverage, quote: item.firstEvidence }, { coverage: item.secondCoverage, quote: item.secondEvidence }].map(({ coverage, quote }, index) => (
                                <div className={styles.evidenceCell} key={`${item.topic}-${index}`}>
                                  <span className={`${styles.coverageMarker} ${coverage === "Strong" ? styles.coverageStrong : coverage === "Some" ? styles.coverageSome : styles.coverageAbsent}`}>{coverage === "Strong" ? copy.strong : coverage === "Some" ? copy.some : copy.notMentioned}</span>
                                  <small>{quote ? `“${quote}”` : copy.noEvidence}</small>
                                </div>
                              ))}
                            </div>
                          ))}
                        </section>
                      </div>
                    ) : (
                      <div className={styles.localInsights}>
                        <p>{sharedThemes.length ? `${copy.sharedTheme} ${sharedThemes.map((theme) => themeLabels[theme]?.[locale] || theme).join("، ")}.` : copy.generateStudyHint}</p>
                        <p>{copy.studySourceNote}</p>
                      </div>
                    )}
                    {!profile && activeCompareProfile ? <p className={styles.aiFootnote}>{copy.choosePublished}</p> : null}
                    {!activeCompareProfile ? <p className={styles.aiFootnote}>{copy.noPublishedFor} {activeCompareName} {copy.cannotGenerate}</p> : null}
                    {activeCompareProfile && aiAvailable === false ? <p className={styles.aiFootnote}>{copy.localComparison}</p> : null}
                    {aiStatusError ? <p className={styles.aiFootnote} role="status">{aiStatusError}</p> : null}
                    {aiError ? <p className={styles.aiError} role="alert">{aiError}</p> : null}
                  </section>
                  <div className={styles.compareCountries}>
                    {[{ name: selectedName, profile }, { name: activeCompareName, profile: activeCompareProfile }].map(({ name, profile: countryProfile }) => (
                      <article className={styles.compareCountryCard} key={name}>
                        <span className={styles.articleEyebrow}>{copy.countryProfileLabel}</span>
                        <h3>{name}</h3>
                        <p>{countryProfile?.summary || copy.countrySummaryMissing}</p>
                      </article>
                    ))}
                  </div>
                  <section className={styles.compareSection}>
                    <div className={styles.compareSectionHeading}><span className={styles.articleEyebrow}>{copy.sharedLens}</span><h3>{copy.commonGround}</h3></div>
                    {sharedThemes.length ? (
                      <div className={styles.compareTags}>{sharedThemes.map((theme) => <span key={theme}>{themeLabels[theme]?.[locale] || theme}</span>)}</div>
                    ) : <p className={styles.compareEmpty}>{copy.noSharedTheme}</p>}
                  </section>
                  <section className={styles.compareSection}>
                    <div className={styles.compareSectionHeading}><span className={styles.articleEyebrow}>{copy.distinctFocus}</span><h3>{copy.differentStrengths}</h3></div>
                    <div className={styles.compareDifferenceGrid}>
                      <div><strong>{selectedName}</strong><div className={styles.compareTags}>{selectedOnlyThemes.length ? selectedOnlyThemes.map((theme) => <span key={theme}>{themeLabels[theme]?.[locale] || theme}</span>) : <small>{copy.noUniqueThemes}</small>}</div></div>
                      <div><strong>{activeCompareName}</strong><div className={styles.compareTags}>{compareOnlyThemes.length ? compareOnlyThemes.map((theme) => <span key={theme}>{themeLabels[theme]?.[locale] || theme}</span>) : <small>{copy.noUniqueThemes}</small>}</div></div>
                    </div>
                  </section>
                  <section className={styles.compareSection}>
                    <div className={styles.compareSectionHeading}><span className={styles.articleEyebrow}>{copy.publishedData}</span><h3>{copy.comparableIndicators}</h3></div>
                    {comparableStatistics.length ? (
                      <div className={styles.compareMetrics}>
                        {comparableStatistics.map((stat) => <div className={styles.compareMetric} key={stat.label}><strong>{stat.label}</strong><span>{localizeDigits(stat.first, locale)}</span><span>{localizeDigits(stat.second, locale)}</span></div>)}
                      </div>
                    ) : <p className={styles.compareEmpty}>{copy.noMatchingIndicators}</p>}
                  </section>
                </>
              ) : (
                <div className={styles.comparePrompt}><ArrowDownUp size={22} /><h3>{copy.chooseCountryToCompare}</h3><p>{copy.comparePrompt}</p></div>
              )}
            </div>
          ) : (
            <div className={styles.articleWorkspace}>
              <aside className={styles.articleRail} aria-label={copy.articleNavigation}>
                <span className={styles.tocLabel}>{copy.inProfile}</span>
                <nav className={styles.toc} aria-label={copy.countryArticleSections}>
                  {sections.map((section) => <button className={activeSection === section.id ? styles.tocActive : ""} type="button" key={section.id} aria-current={activeSection === section.id ? "location" : undefined} onClick={() => scrollToSection(section.id)}><span />{section.title}</button>)}
                </nav>
                <button className={styles.shareButton} type="button" onClick={shareCountry}><Share2 size={14} />{copy.shareProfile}</button>
                {shareMessage ? <span className={styles.shareStatus} role="status">{shareMessage}</span> : null}
              </aside>
              <div className={styles.articleScroll} ref={articleScrollRef} key={`${selectedId}-article`}>
                <div className={styles.articleIntro}>
                  <span className={styles.articleEyebrow}>{copy.socialEconomy}</span>
                  <h3>{profile?.title || selectedName}</h3>
                  {profile?.summary ? <p className={styles.articleSummary}>{profile.summary}</p> : null}
                </div>
                {profile?.article ? (
                  <div className={styles.articleCopy} ref={articleContentRef} dangerouslySetInnerHTML={{ __html: articleHtml }} />
                ) : (
                  <div className={styles.articleUnavailable}><span>{copy.researchNote}</span><p>{copy.articleNotPublished}</p></div>
                )}
                {profile?.sources ? (
                  <section className={styles.sources} id="atlas-sources">
                    <span className={styles.articleEyebrow}>{copy.researchTrail}</span><h4>{copy.sources}</h4>
                    {Array.isArray(profile.sources) ? <ul>{profile.sources.map((source, index) => <li key={index}>{typeof source === "string" ? source : JSON.stringify(source)}</li>)}</ul> : <p>{typeof profile.sources === "string" ? profile.sources : JSON.stringify(profile.sources)}</p>}
                  </section>
                ) : null}
                <div className={styles.articleEndnote}><span>SEMRG</span><p>{copy.endnote}</p></div>
              </div>
            </div>
          )}
        </section>

        <div className={styles.carouselDock}>
          <div className={styles.carouselHeading}><span><i />{copy.countryIndex}</span><strong>{localizeDigits(featuredCountries.length, locale)} {copy.profiles}</strong></div>
          <button className={styles.carouselArrow} type="button" aria-label={copy.previousCountries} onClick={() => moveCarousel(-1)}>{isPersian ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}</button>
          <div
            className={styles.countryCarousel}
            ref={carouselRef}
            aria-label={copy.countryProfiles}
            tabIndex={0}
            onKeyDown={(event) => { if (event.key === (isPersian ? "ArrowLeft" : "ArrowRight")) moveCarousel(1); if (event.key === (isPersian ? "ArrowRight" : "ArrowLeft")) moveCarousel(-1); }}
            onWheel={(event) => { if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) { event.preventDefault(); event.currentTarget.scrollBy({ left: event.deltaY * (isPersian ? -1 : 1), behavior: "auto" }); } }}
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
                <button className={`${styles.countryCard} ${selected ? styles.countryCardSelected : ""}`} type="button" key={id} aria-current={selected ? "true" : undefined} aria-label={`${countryName(country, locale)}${selected ? `، ${copy.selectedCountry}` : ""}`} onClick={() => selectCountry(country)}>
                  <Image className={styles.cardImage} src={imageForCountry(id)} loader={countryImageLoader} alt="" width={430} height={200} sizes="158px" quality={68} loading="lazy" />
                  <span className={styles.cardContent}><span><CountryFlag country={country} className={styles.cardFlag} /> <i>{getRegion(country) ? regionLabels[getRegion(country)!][locale] : (locale === "fa" ? "جهان" : "World")}</i></span><strong>{item.name}</strong><small>{selected ? <><Check size={11} /> {copy.selected}</> : copy.openProfile}</small></span>
                  {selected ? <span className={styles.cardSelectionMark} /> : null}
                </button>
              );
            })}
          </div>
          <button className={styles.carouselArrow} type="button" aria-label={copy.nextCountries} onClick={() => moveCarousel(1)}>{isPersian ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</button>
        </div>
      </section>
    </main>
  );
}