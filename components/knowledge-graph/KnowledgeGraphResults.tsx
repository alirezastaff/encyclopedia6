"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Bookmark,
  BriefcaseBusiness,
  Calculator,
  Check,
  ChevronRight,
  Compass,
  FileText,
  Film,
  Globe2,
  GraduationCap,
  Handshake,
  History,
  Home,
  Info,
  Languages,
  Landmark,
  Lightbulb,
  Link2,
  Maximize,
  Minus,
  Network,
  Plus,
  Podcast,
  Search,
  Settings,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties, FormEvent } from "react";
import styles from "./KnowledgeGraphResults.module.css";

type GraphChild = { label: string; x: number; y: number };
type NavItem = { label: string; Icon: LucideIcon; href?: string; active?: boolean };
type GraphCategory = {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  tint: string;
  Icon: LucideIcon;
  children: GraphChild[];
};

const categories: GraphCategory[] = [
  {
    id: "theories",
    label: "Theories & Thinkers",
    x: 245,
    y: 210,
    color: "#8b2ac3",
    tint: "#f3e7fa",
    Icon: UsersRound,
    children: [
      { label: "Durkheim", x: 155, y: 105 },
      { label: "Polanyi", x: 115, y: 158 },
      { label: "Elinor Ostrom", x: 82, y: 222 },
      { label: "Marx", x: 115, y: 281 },
      { label: "Amartya Sen", x: 170, y: 332 },
    ],
  },
  {
    id: "social-economy",
    label: "Social Economy",
    x: 455,
    y: 116,
    color: "#159b83",
    tint: "#e2f7f1",
    Icon: Handshake,
    children: [
      { label: "Cooperatives", x: 320, y: 45 },
      { label: "Social Enterprises", x: 405, y: 20 },
      { label: "Mutualism", x: 520, y: 48 },
      { label: "Community Development", x: 575, y: 110 },
      { label: "Collective Action", x: 530, y: 170 },
    ],
  },
  {
    id: "policy",
    label: "Policy & Institutions",
    x: 720,
    y: 205,
    color: "#1674e8",
    tint: "#e6f1ff",
    Icon: Landmark,
    children: [
      { label: "Welfare State", x: 735, y: 88 },
      { label: "NGOs", x: 805, y: 135 },
      { label: "International Organizations", x: 870, y: 185 },
      { label: "Social Policy", x: 825, y: 242 },
      { label: "Civil Society", x: 775, y: 300 },
    ],
  },
  {
    id: "cases",
    label: "Real-World Cases",
    x: 730,
    y: 370,
    color: "#d52c5b",
    tint: "#fff0f3",
    Icon: BookMarked,
    children: [
      { label: "Co-ops in Mondragon", x: 830, y: 337 },
      { label: "Qarzeh-Hasaneh", x: 865, y: 380 },
      { label: "Baloch Embroidery", x: 830, y: 425 },
      { label: "Housing Cooperatives", x: 765, y: 474 },
      { label: "Disaster Relief Networks", x: 690, y: 500 },
    ],
  },
  {
    id: "regions",
    label: "Regions & Countries",
    x: 505,
    y: 450,
    color: "#0d9ea6",
    tint: "#e2f8f8",
    Icon: Globe2,
    children: [
      { label: "European Union", x: 390, y: 490 },
      { label: "Global South", x: 445, y: 525 },
      { label: "Iran", x: 525, y: 535 },
      { label: "Latin America", x: 575, y: 510 },
      { label: "Nordic Countries", x: 625, y: 475 },
    ],
  },
  {
    id: "related",
    label: "Related Concepts",
    x: 300,
    y: 370,
    color: "#c18a1c",
    tint: "#fbf3df",
    Icon: Lightbulb,
    children: [
      { label: "Social Justice", x: 170, y: 335 },
      { label: "Equity", x: 100, y: 380 },
      { label: "Inclusion", x: 125, y: 435 },
      { label: "Common Good", x: 195, y: 480 },
      { label: "Resilience", x: 280, y: 515 },
    ],
  },
];

const insights = [
  {
    type: "Case Study",
    title: "Qarzeh-Hasaneh and Social Solidarity in Iran",
    image: "/pics/o4.jpg",
    tags: ["Iran", "Finance", "Community"],
    category: "cases",
  },
  {
    type: "Thinker",
    title: "Elinor Ostrom and the Commons",
    image: "/pics/o6.jpg",
    tags: ["Governance", "Collective Action"],
    category: "theories",
  },
  {
    type: "Article",
    title: "Solidarity Economy in the Global South",
    image: "/homepage/encyclopedia.png",
    tags: ["Global South", "Development"],
    category: "regions",
  },
  {
    type: "Video",
    title: "The Power of Mutual Aid",
    image: "/pics/milad-tower.jpg",
    tags: ["Documentary", "Social Economy"],
    category: "social-economy",
  },
];

const navGroups: NavItem[][] = [
  [
    { label: "Home", Icon: Home, href: "/en" },
    { label: "Knowledge Graph", Icon: Network, href: "/en/knowledge-graph", active: true },
    { label: "Encyclopedia", Icon: BookOpen, href: "/en/archive" },
    { label: "Marginalia", Icon: FileText, href: "/profile" },
    { label: "Country Explorer", Icon: Globe2, href: "/en/country-explorer" },
    { label: "Case Studies Hub", Icon: BriefcaseBusiness, href: "/en/case-studies" },
    { label: "Impact Calculator", Icon: Calculator, href: "/en/impact-calculator" },
  ],
  [
    { label: "Courses", Icon: GraduationCap },
    { label: "Podcasts", Icon: Podcast },
    { label: "Translations", Icon: Languages },
    { label: "Articles", Icon: FileText, href: "/en/archive" },
    { label: "Films", Icon: Film },
  ],
  [
    { label: "Saved", Icon: Bookmark },
    { label: "History", Icon: History },
    { label: "Settings", Icon: Settings },
  ],
];

const persianLabels: Record<string, string> = {
  "SSE Knowledge Platform": "پلتفرم دانشی",
  "Social Economy · Solidarity · Shared Future": "اقتصاد اجتماعی · همبستگی · آینده‌ای مشترک",
  "Search the knowledge network": "جست‌وجو در شبکهٔ دانشی",
  "Clear search": "پاک‌کردن جست‌وجو",
  "AI Search": "جست‌وجوی هوشمند",
  "Main navigation": "ناوبری اصلی",
  Home: "خانه",
  "Knowledge Graph": "نمودار دانش",
  Encyclopedia: "دانشنامه",
  Marginalia: "حاشیه‌نگار",
  "Country Explorer": "کاوش کشورها",
  "Case Studies Hub": "تجربه‌های همبستگی",
  "Impact Calculator": "سنجش اثرگذاری",
  Courses: "دوره‌ها",
  Podcasts: "پادکست‌ها",
  Translations: "ترجمه‌ها",
  Articles: "مقاله‌ها",
  Films: "فیلم‌ها",
  Saved: "ذخیره‌شده‌ها",
  History: "تاریخچه",
  Settings: "تنظیمات",
  Learning: "یادگیری",
  Tools: "ابزارها",
  "Knowledge builds stronger societies.": "دانش، جامعه‌ای نیرومندتر می‌سازد.",
  "Knowledge graph search results": "نتایج جست‌وجو در نمودار دانش",
  "Knowledge Platform": "پلتفرم دانشی",
  "AI analysis in progress": "تحلیل هوشمند در حال انجام است",
  "SMART KNOWLEDGE SEARCH": "جست‌وجوی هوشمند دانش",
  "Building your knowledge graph": "در حال ساخت نمودار دانش شما",
  "Exploring connections for": "در حال کاوش پیوندهای مرتبط با",
  "The knowledge network is being mapped across research, people, places and real-world experiences.": "شبکهٔ دانشی در میان پژوهش‌ها، افراد، مکان‌ها و تجربه‌های واقعی در حال نقشه‌برداری است.",
  "Knowledge graph analysis progress": "میزان پیشرفت تحلیل نمودار دانش",
  "Gathering relevant sources": "گردآوری منابع مرتبط",
  "Tracing conceptual connections": "ردیابی پیوندهای مفهومی",
  "Comparing evidence across topics": "مقایسهٔ شواهد میان موضوع‌ها",
  "Preparing your knowledge graph": "آماده‌سازی نمودار دانش شما",
  "Mapping a living network of ideas": "ترسیم شبکه‌ای زنده از ایده‌ها",
  "Graph Search Results for": "نتایج جست‌وجوی نموداری برای",
  "AI-powered graph search across the Social Economy knowledge network": "جست‌وجوی هوشمند در شبکهٔ دانشی اقتصاد اجتماعی و همبستگی",
  "Explore how concepts connect across the knowledge network": "پیوند میان مفاهیم این شبکهٔ دانشی را کاوش کنید",
  "About graph search": "دربارهٔ جست‌وجوی نموداری",
  "Search result type": "نوع نتیجهٔ جست‌وجو",
  Graph: "نمودار",
  Documents: "منابع",
  People: "افراد",
  Places: "مکان‌ها",
  Media: "رسانه‌ها",
  "Graph controls": "ابزارهای نمودار",
  "Collapse graph": "بستن نمای گستردهٔ نمودار",
  "Expand graph": "گسترش نمودار",
  "Zoom in": "بزرگ‌نمایی",
  "Zoom out": "کوچک‌نمایی",
  "Reset graph view": "بازنشانی نمای نمودار",
  "Main concept": "مفهوم محوری",
  "Core Concept": "مفهوم محوری",
  "Featured Insights": "مطالب برگزیده",
  "View all": "مشاهدهٔ همه",
  "Case Study": "مطالعهٔ موردی",
  Thinker: "اندیشمند",
  Article: "مقاله",
  Video: "ویدئو",
  "Qarzeh-Hasaneh and Social Solidarity in Iran": "قرض‌الحسنه و همبستگی اجتماعی در ایران",
  "Elinor Ostrom and the Commons": "الینور استروم و منابع مشترک",
  "Solidarity Economy in the Global South": "اقتصاد همبستگی در جنوب جهانی",
  "The Power of Mutual Aid": "قدرت یاری متقابل",
  Iran: "ایران",
  Finance: "تأمین مالی",
  Community: "جامعه",
  Governance: "حکمرانی",
  "Collective Action": "کنش جمعی",
  "Global South": "جنوب جهانی",
  Development: "توسعه",
  Documentary: "مستند",
  "Save insight": "ذخیرهٔ مطلب",
  "Remove insight from saved": "حذف مطلب از ذخیره‌شده‌ها",
  "Concept details": "جزئیات مفهوم",
  Concept: "مفهوم",
  solidarity: "همبستگی",
  Solidarity: "همبستگی",
  "A social and moral principle of mutual support and collective action, essential for building just and resilient societies.": "همبستگی، اصلی اجتماعی و اخلاقی بر پایهٔ پشتیبانی متقابل و کنش جمعی است؛ اصلی که برای ساختن جامعه‌ای عادلانه و تاب‌آور اهمیت دارد.",
  "Social Economy": "اقتصاد اجتماعی",
  Justice: "عدالت",
  "AI Summary": "خلاصهٔ هوشمند",
  "Solidarity in the social economy refers to the active cooperation among individuals and communities to achieve shared goals, reduce inequality, and create sustainable systems. It connects economic, social, and ethical dimensions, and is fundamental to movements such as cooperatives, mutual aid, and civil society initiatives.": "در اقتصاد اجتماعی، همبستگی یعنی همکاری فعال افراد و جوامع برای رسیدن به هدف‌های مشترک، کاهش نابرابری و ساختن سازوکارهایی پایدار. همبستگی بُعدهای اقتصادی، اجتماعی و اخلاقی را به هم پیوند می‌دهد و پایهٔ شکل‌گیری تعاونی‌ها، یاری متقابل و کنش‌های جامعهٔ مدنی است.",
  "Show less": "نمایش کمتر",
  "Show more": "نمایش بیشتر",
  "Related Topics": "موضوعات مرتبط",
  "Social Economy and Solidarity": "اقتصاد اجتماعی و همبستگی",
  "Cooperatives and Solidarity": "تعاونی‌ها و همبستگی",
  "Social Justice": "عدالت اجتماعی",
  "Community Development": "توسعهٔ جامعه‌محور",
  "Explore in Encyclopedia": "در دانشنامه بخوانید",
  "View full article": "مشاهدهٔ مقالهٔ کامل",
  "Dismiss notification": "بستن پیام",
  "Theories & Thinkers": "نظریه‌ها و اندیشمندان",
  "Social Enterprises": "کسب‌وکارهای اجتماعی",
  Mutualism: "یاری متقابل",
  "Policy & Institutions": "سیاست‌گذاری و نهادها",
  "Welfare State": "دولت رفاه",
  NGOs: "سازمان‌های مردم‌نهاد",
  "International Organizations": "سازمان‌های بین‌المللی",
  "Social Policy": "سیاست اجتماعی",
  "Civil Society": "جامعهٔ مدنی",
  "Real-World Cases": "تجربه‌های میدانی",
  "Co-ops in Mondragon": "تعاونی‌های موندراگون",
  "Qarzeh-Hasaneh": "قرض‌الحسنه",
  "Baloch Embroidery": "سوزن‌دوزی بلوچ",
  "Housing Cooperatives": "تعاونی‌های مسکن",
  "Disaster Relief Networks": "شبکه‌های امدادرسانی",
  "Regions & Countries": "منطقه‌ها و کشورها",
  "European Union": "اتحادیهٔ اروپا",
  "Latin America": "آمریکای لاتین",
  "Nordic Countries": "کشورهای نوردیک",
  "Related Concepts": "مفاهیم مرتبط",
  Equity: "برابری",
  Inclusion: "فراگیری",
  "Common Good": "خیر همگانی",
  Resilience: "تاب‌آوری",
  Durkheim: "دورکیم",
  Polanyi: "پولانی",
  "Elinor Ostrom": "الینور استروم",
  Marx: "مارکس",
  "Amartya Sen": "آمارتیا سن",
  Cooperatives: "تعاونی‌ها",
};

type KnowledgeGraphResultsProps = { initialQuery: string; locale?: "en" | "fa"; initialAiSearch?: boolean };

function curvePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  bend: number,
) {
  const controlX = (from.x + to.x) / 2;
  const controlY = (from.y + to.y) / 2 + bend;
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

export default function KnowledgeGraphResults({
  initialQuery,
  locale = "en",
  initialAiSearch = false,
}: KnowledgeGraphResultsProps) {
  const isPersian = locale === "fa";
  const localize = (value: string) => isPersian ? persianLabels[value] ?? value : value;
  const [query, setQuery] = useState(
    isPersian && initialQuery.toLowerCase() === "solidarity" ? "همبستگی" : initialQuery,
  );
  const [activeTab, setActiveTab] = useState("Graph");
  const [selectedConcept, setSelectedConcept] = useState("Solidarity");
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [graphExpanded, setGraphExpanded] = useState(false);
  const [savedInsights, setSavedInsights] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [activeNav, setActiveNav] = useState("Knowledge Graph");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(initialAiSearch);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    if (!initialAiSearch) return;

    const analysisDuration = 10_000;
    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      setAnalysisProgress(Math.min(99, Math.floor((Date.now() - startedAt) / (analysisDuration / 100))));
    }, 80);
    const finishTimer = window.setTimeout(() => {
      setAnalysisProgress(100);
      setIsAiAnalyzing(false);
    }, analysisDuration);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(finishTimer);
    };
  }, [initialAiSearch]);

  const formattedQuery = localize(query.trim() || "solidarity");
  const titleQuery = query.trim() || "solidarity";
  const shortSummary = localize("Solidarity in the social economy refers to the active cooperation among individuals and communities to achieve shared goals, reduce inequality, and create sustainable systems. It connects economic, social, and ethical dimensions, and is fundamental to movements such as cooperatives, mutual aid, and civil society initiatives.");

  function submitLocalSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) setQuery(isPersian ? "همبستگی" : "solidarity");
    setSelectedConcept(query.trim() || "Solidarity");
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function toggleInsight(title: string) {
    setSavedInsights((current) =>
      current.includes(title)
        ? current.filter((savedTitle) => savedTitle !== title)
        : [...current, title],
    );
  }

  const styleForCategory = (category: GraphCategory): CSSProperties => ({
    "--node-color": category.color,
    "--node-tint": category.tint,
    left: `${(isPersian ? 1000 - category.x : category.x) / 10}%`,
    top: `${(category.y / 540) * 100}%`,
  } as CSSProperties);

  function localizedHref(href: string) {
    if (!isPersian) return href;
    return href === "/profile" ? "/fa/profile" : href.replace(/^\/en(?=\/|$)/, "/fa");
  }

  if (isAiAnalyzing) {
    const stages = [
      localize("Gathering relevant sources"),
      localize("Tracing conceptual connections"),
      localize("Comparing evidence across topics"),
      localize("Preparing your knowledge graph"),
    ];
    const activeStage = Math.min(3, Math.floor(analysisProgress / 25));

    return (
      <main className={styles.analysisPage} lang={locale} dir={isPersian ? "rtl" : "ltr"}>
        <div className={styles.analysisGrid} aria-hidden="true" />
        <header className={styles.analysisHeader}>
          <Link href={localizedHref(isPersian ? "/fa" : "/en")} className={styles.analysisBrand}>
            <span className={styles.analysisBrandMark}><Network aria-hidden="true" /></span>
            <span><strong>SSE</strong><small>{localize("Knowledge Platform")}</small></span>
          </Link>
          <span className={styles.analysisLive}><i />{localize("AI analysis in progress")}</span>
        </header>

        <section className={styles.analysisBody} aria-labelledby="analysis-title" aria-live="polite">
          <div className={styles.analysisCopy}>
            <p className={styles.analysisEyebrow}><Sparkles aria-hidden="true" />{localize("SMART KNOWLEDGE SEARCH")}</p>
            <h1 id="analysis-title">{localize("Building your knowledge graph")}</h1>
            <p className={styles.analysisQuery}>{localize("Exploring connections for")} <strong>“{formattedQuery}”</strong></p>
            <p className={styles.analysisDescription}>{localize("The knowledge network is being mapped across research, people, places and real-world experiences.")}</p>

            <div className={styles.analysisProgressLabel}>
              <span>{stages[activeStage]}</span>
              <span>{isPersian ? String(analysisProgress).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]) : `${analysisProgress}%`}</span>
            </div>
            <div
              className={styles.analysisProgressTrack}
              role="progressbar"
              aria-label={localize("Knowledge graph analysis progress")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={analysisProgress}
            >
              <span style={{ width: `${analysisProgress}%` }} />
            </div>
            <ol className={styles.analysisStages}>
              {stages.map((stage, index) => (
                <li className={index < activeStage ? styles.analysisStageDone : index === activeStage ? styles.analysisStageActive : ""} key={stage}>
                  <i aria-hidden="true" />{stage}
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.analysisScene} aria-hidden="true">
            <div className={styles.analysisGlow} />
            <div className={`${styles.analysisOrbit} ${styles.analysisOrbitOuter}`}><i /><i /><i /></div>
            <div className={`${styles.analysisOrbit} ${styles.analysisOrbitMiddle}`}><i /><i /></div>
            <div className={`${styles.analysisOrbit} ${styles.analysisOrbitInner}`}><i /></div>
            <div className={styles.analysisCore}><Network /></div>
            <span className={`${styles.analysisSatellite} ${styles.analysisSatelliteOne}`}><BookOpen /></span>
            <span className={`${styles.analysisSatellite} ${styles.analysisSatelliteTwo}`}><Globe2 /></span>
            <span className={`${styles.analysisSatellite} ${styles.analysisSatelliteThree}`}><UsersRound /></span>
            <span className={`${styles.analysisSatellite} ${styles.analysisSatelliteFour}`}><Handshake /></span>
            <span className={styles.analysisSceneCaption}>{localize("Mapping a living network of ideas")}</span>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page} lang={locale} dir={isPersian ? "rtl" : "ltr"} data-locale={locale}>
      <header className={styles.topbar}>
        <Link href={localizedHref(isPersian ? "/fa" : "/en")} className={styles.brand} aria-label={`${localize("SSE Knowledge Platform")}؛ خانه`}>
          <span className={styles.brandMark}><Network aria-hidden="true" /></span>
          <span className={styles.brandText}>
            <strong>{localize("SSE Knowledge Platform")}</strong>
            <small>{localize("Social Economy · Solidarity · Shared Future")}</small>
          </span>
        </Link>

        <div className={styles.topSearchArea}>
          <form className={styles.topSearch} onSubmit={submitLocalSearch} role="search">
            <Search aria-hidden="true" />
            <input
              aria-label={localize("Search the knowledge network")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              dir={isPersian ? "rtl" : "ltr"}
            />
            <button
              type="button"
              className={styles.clearSearch}
              aria-label={localize("Clear search")}
              onClick={() => setQuery("")}
            >
              <X aria-hidden="true" />
            </button>
          </form>
          <button
            className={styles.aiSearch}
            type="button"
            onClick={() => showNotice(isPersian ? "جست‌وجوی هوشمند آماده است." : "AI Search is ready")}
          >
            <Sparkles aria-hidden="true" />
            <span>{localize("AI Search")}</span>
          </button>
        </div>

      </header>

      <div className={styles.appBody}>
        <aside className={styles.sidebar}>
          <nav aria-label={localize("Main navigation")} className={styles.navGroups}>
            {navGroups.map((group, groupIndex) => (
              <div className={styles.navGroup} key={groupIndex}>
                {groupIndex === 1 && <p className={styles.navHeading}>{localize("Learning")}</p>}
                {groupIndex === 2 && <p className={styles.navHeading}>{localize("Tools")}</p>}
                {group.map(({ label, Icon, href, active }) => {
                  const isActive = active || activeNav === label;
                  const className = `${styles.navItem} ${isActive ? styles.navItemActive : ""}`;
                  const handleClick = () => {
                    setActiveNav(label);
                    if (!href) showNotice(isPersian ? `${localize(label)} به‌زودی در دسترس قرار می‌گیرد.` : `${label} will be available here soon`);
                  };

                  if (href) {
                    return (
                      <Link
                        href={localizedHref(href)}
                        className={className}
                        key={label}
                        onClick={handleClick}
                      >
                        <Icon aria-hidden="true" />
                        <span>{localize(label)}</span>
                      </Link>
                    );
                  }

                  return (
                    <button
                      type="button"
                      className={className}
                      key={label}
                      onClick={handleClick}
                    >
                      <Icon aria-hidden="true" />
                      <span>{localize(label)}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <Link href={localizedHref(isPersian ? "/fa/case-studies" : "/en/case-studies")} className={styles.sidebarPromo}>
            <span>{localize("Knowledge builds stronger societies.")}</span>
            <span className={styles.promoArrows} aria-hidden="true">
              <ArrowRight /><ArrowRight />
            </span>
          </Link>
        </aside>

        <section className={styles.workspace} aria-label={localize("Knowledge graph search results")}>
          <div className={styles.resultsHeader}>
            <div>
              <h1>{localize("Graph Search Results for")} «{localize(titleQuery)}»</h1>
              <p>
                {localize("AI-powered graph search across the Social Economy knowledge network")}
                <span className={styles.infoTip} title={localize("Explore how concepts connect across the knowledge network")}>
                  <Info aria-label={localize("About graph search")} />
                </span>
              </p>
            </div>
            <div className={styles.tabs} role="tablist" aria-label={localize("Search result type")}>
              {["Graph", "Documents", "People", "Places", "Media"].map((tab) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {localize(tab)}
                </button>
              ))}
            </div>
          </div>

          <div className={`${styles.graphPanel} ${graphExpanded ? styles.graphExpanded : ""}`}>
            <div className={styles.graphControls} aria-label={localize("Graph controls")}>
              <button
                type="button"
                aria-label={localize(graphExpanded ? "Collapse graph" : "Expand graph")}
                aria-pressed={graphExpanded}
                onClick={() => setGraphExpanded((current) => !current)}
              >
                <Maximize aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={localize("Zoom in")}
                onClick={() => setZoom((current) => Math.min(1.25, current + 0.1))}
              >
                <Plus aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={localize("Zoom out")}
                onClick={() => setZoom((current) => Math.max(0.8, current - 0.1))}
              >
                <Minus aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={localize("Reset graph view")}
                onClick={() => setZoom(1)}
              >
                <Compass aria-hidden="true" />
              </button>
            </div>

            <div className={styles.graphStage}>
              <div
                className={styles.graphCanvas}
                style={{ transform: `scale(${zoom})` }}
              >
                <svg
                  className={styles.connections}
                  viewBox="0 0 1000 540"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient id="coreGlow">
                      <stop offset="0%" stopColor="#2e79f7" stopOpacity=".18" />
                      <stop offset="100%" stopColor="#2e79f7" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="500" cy="270" r="105" fill="url(#coreGlow)" />
                  <circle cx="500" cy="270" r="145" className={styles.orbitRing} />
                  <circle cx="500" cy="270" r="220" className={styles.orbitRing} />
                  <circle cx="500" cy="270" r="300" className={styles.orbitRing} />
                  {categories.map((category) => (
                    <g key={category.id} style={{ color: category.color }}>
                      <circle cx={category.x} cy={category.y} r="34" className={styles.categoryAura} />
                      <path
                        d={curvePath({ x: 500, y: 270 }, category, category.y < 270 ? -20 : 20)}
                        className={styles.mainConnection}
                      />
                      {category.children.map((child, childIndex) => (
                        <g key={child.label}>
                          <path
                            d={curvePath(category, child, childIndex % 2 === 0 ? -9 : 9)}
                            className={styles.childConnection}
                          />
                          <circle cx={child.x} cy={child.y} r="3.7" className={styles.childDot} />
                        </g>
                      ))}
                      <circle cx={category.x} cy={category.y} r="5" className={styles.hubDot} />
                    </g>
                  ))}
                </svg>

                <button
                  type="button"
                  className={styles.coreNode}
                  style={{ left: "50%", top: "50%" }}
                  onClick={() => setSelectedConcept(formattedQuery)}
                  aria-label={`${localize("Main concept")}: ${formattedQuery}`}
                >
                  <strong>{formattedQuery}</strong>
                  <span>{localize("Core Concept")}</span>
                </button>

                {categories.map((category) => {
                  const Icon = category.Icon;
                  return (
                    <div key={category.id}>
                      <button
                        type="button"
                        className={`${styles.categoryNode} ${selectedConcept === category.label ? styles.categoryNodeSelected : ""}`}
                        style={styleForCategory(category)}
                        onClick={() => setSelectedConcept(category.label)}
                      >
                        <span className={styles.categoryIcon}>
                          <Icon aria-hidden="true" />
                        </span>
                        <span className={styles.categoryLabel}>{localize(category.label)}</span>
                      </button>
                      {category.children.map((child) => (
                        <button
                          type="button"
                          className={`${styles.childNode} ${selectedConcept === child.label ? styles.childNodeSelected : ""}`}
                          key={child.label}
                          style={{
                            left: `${(isPersian ? 1000 - child.x : child.x) / 10}%`,
                            top: `${(child.y / 540) * 100}%`,
                            "--node-color": category.color,
                          } as CSSProperties}
                          onClick={() => setSelectedConcept(child.label)}
                        >
                          {localize(child.label)}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <section className={styles.insightsSection} aria-labelledby="insights-title">
            <div className={styles.insightsHeading}>
              <h2 id="insights-title"><Sparkles aria-hidden="true" /> {localize("Featured Insights")}</h2>
              <button type="button" onClick={() => setActiveTab("Documents")}>
                {localize("View all")} <ArrowRight aria-hidden="true" />
              </button>
            </div>
            <div className={styles.insightsGrid}>
              {insights.map((insight) => {
                const isSaved = savedInsights.includes(insight.title);
                return (
                  <article className={styles.insightCard} key={insight.title}>
                    <div className={styles.insightImage}>
                      <Image
                        src={insight.image}
                        alt=""
                        fill
                        sizes="(max-width: 800px) 80vw, 22vw"
                        className={insight.category === "theories" ? styles.grayscaleImage : ""}
                      />
                      {insight.type === "Video" && (
                        <span className={styles.playButton} aria-hidden="true">
                          <span />
                        </span>
                      )}
                      <button
                        type="button"
                        className={`${styles.cardBookmark} ${isSaved ? styles.cardBookmarkSaved : ""}`}
                        aria-label={isPersian
                          ? isSaved ? `حذف «${localize(insight.title)}» از ذخیره‌شده‌ها` : `ذخیرهٔ «${localize(insight.title)}»`
                          : isSaved ? `Remove ${insight.title} from saved` : `Save ${insight.title}`}
                        aria-pressed={isSaved}
                        onClick={() => toggleInsight(insight.title)}
                      >
                        {isSaved ? <Check aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
                      </button>
                    </div>
                    <div className={styles.insightBody}>
                      <p className={styles.insightType}>{localize(insight.type)}</p>
                      <button
                        type="button"
                        className={styles.insightTitle}
                        onClick={() => setSelectedConcept(insight.title)}
                      >
                        {localize(insight.title)}
                      </button>
                      <div className={styles.insightTags}>
                        {insight.tags.map((tag) => <span key={tag}>{localize(tag)}</span>)}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </section>

        <aside className={styles.detailPanel} aria-label={localize("Concept details")}>
          <div className={styles.conceptCover}>
            <Image
              src="/pics/o4.jpg"
              alt=""
              fill
              sizes="(max-width: 1100px) 0px, 230px"
              priority
            />
            <div className={styles.coverOverlay}>
              <span className={styles.conceptPill}>{localize("Concept")}</span>
              <h2>{localize(selectedConcept)}</h2>
              <p>{localize("A social and moral principle of mutual support and collective action, essential for building just and resilient societies.")}</p>
              <div className={styles.conceptTags}>
                <span>{localize("Social Economy")}</span><span>{localize("Collective Action")}</span><span>{localize("Justice")}</span>
              </div>
            </div>
          </div>

          <div className={styles.detailContent}>
            <section className={styles.detailSection}>
              <h3><Sparkles aria-hidden="true" /> {localize("AI Summary")}</h3>
              <p className={`${styles.summaryText} ${summaryExpanded ? styles.summaryExpanded : ""}`}>
                {shortSummary}
              </p>
              <button
                type="button"
                className={styles.showMore}
                aria-expanded={summaryExpanded}
                onClick={() => setSummaryExpanded((current) => !current)}
              >
                {localize(summaryExpanded ? "Show less" : "Show more")}
                <ChevronRight aria-hidden="true" />
              </button>
            </section>

            <section className={styles.detailSection}>
              <h3><Link2 aria-hidden="true" /> {localize("Related Topics")}</h3>
              <div className={styles.relatedTopics}>
                {[
                  "Social Economy and Solidarity",
                  "Cooperatives and Solidarity",
                  "Social Justice",
                  "Community Development",
                ].map((topic) => (
                  <button
                    type="button"
                    key={topic}
                    onClick={() => setSelectedConcept(topic)}
                  >
                    <span>{localize(topic)}</span><ChevronRight aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.detailSection}>
              <h3><BookOpen aria-hidden="true" /> {localize("Explore in Encyclopedia")}</h3>
              <Link
                className={styles.articleLink}
                href={localizedHref(`/en/archive?q=${encodeURIComponent(titleQuery)}`)}
              >
                {localize("View full article")} <ArrowRight aria-hidden="true" />
              </Link>
            </section>
          </div>
        </aside>
      </div>

      {notice && (
        <div className={styles.notice} role="status">
          {notice}
          <button type="button" aria-label={localize("Dismiss notification")} onClick={() => setNotice("")}>
            <X aria-hidden="true" />
          </button>
        </div>
      )}
    </main>
  );
}
