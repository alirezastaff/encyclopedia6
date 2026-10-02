"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  CircleHelp,
  Download,
  Gauge,
  Menu,
  Recycle,
  Save,
  Settings2,
  Target,
  Users,
  WalletCards,
  X,
} from "lucide-react";

type Stage = "overview" | "financial" | "outputs" | "outcomes" | "adjustments" | "results";
type Locale = "en" | "fa";
type Form = {
  budget: number;
  volunteerHours: number;
  hourlyRate: number;
  beneficiaries: number;
  jobs: number;
  waste: number;
  changeRate: number;
  socialProxy: number;
  environmentalProxy: number;
  economicProxy: number;
  deadweight: number;
  attribution: number;
  displacement: number;
  dropoff: number;
};
type Result = {
  investment: number;
  total: number;
  ratio: number;
  adjustment: number;
  values: { social: number; economic: number; environmental: number };
};

const initial: Form = {
  budget: 100000,
  volunteerHours: 1200,
  hourlyRate: 12,
  beneficiaries: 240,
  jobs: 18,
  waste: 800,
  changeRate: 65,
  socialProxy: 450,
  environmentalProxy: 30,
  economicProxy: 8500,
  deadweight: 15,
  attribution: 10,
  displacement: 5,
  dropoff: 8,
};

const persianInitial: Form = {
  ...initial,
  budget: 1000000000,
  hourlyRate: 500000,
  socialProxy: 2000000,
  environmentalProxy: 50000,
  economicProxy: 200000000,
};

const stages: { id: Stage; label: string; icon: typeof Gauge }[] = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "financial", label: "Financial inputs", icon: WalletCards },
  { id: "outputs", label: "Direct outputs", icon: BarChart3 },
  { id: "outcomes", label: "Outcomes & values", icon: Target },
  { id: "adjustments", label: "Adjustments", icon: Settings2 },
  { id: "results", label: "Results", icon: Activity },
];

const faCopy = {
  status: "ارزیابی در حال انجام",
  updated: "به‌تازگی به‌روزرسانی شد",
  encyclopedia: "دانشنامه",
  workspace: "فضای کار",
  activeView: "نمای فعلی",
  ready: "آماده",
  dataTip: "راهنمای داده",
  dataTipText: "اولویت با داده‌های سنجیده و مستند است؛ از برآوردهای جایگزین فقط وقتی استفاده کنید که شواهد مستقیم در دسترس نیست.",
  decisionSupport: "پشتیبانی از تصمیم‌گیری",
  heading: "ارزیابی اثر اجتماعی",
  totalValue: "مجموع ارزش اجتماعی",
  valueCreated: "ارزش ایجادشده",
  netValue: "ارزش خالص",
  liveResult: "نتیجهٔ زنده",
  ratio: "نسبت بازده اجتماعی سرمایه‌گذاری (SROI)",
  ratioSentenceBefore: "به‌ازای هر ۱ ریال سرمایه‌گذاری، حدود",
  ratioSentenceAfter: "ریال ارزش اجتماعی ایجاد می‌شود.",
  valueMix: "ترکیب ارزش",
  currentEstimate: "برآورد فعلی",
  valueBridge: "مسیر تبدیل ارزش",
  netEffect: "اثر خالص",
  grossOutcomes: "ارزش ناخالص پیامدها",
  adjustments: "تعدیلات",
  adjustmentNote: "تعدیلات از بزرگ‌نمایی اثر جلوگیری می‌کنند.",
  social: "اجتماعی",
  economic: "اقتصادی",
  environmental: "زیست‌محیطی",
  peopleReached: "افراد تحت پوشش",
  jobsCreated: "شغل ایجادشده",
  wasteRecovered: "پسماند بازیابی‌شده",
  scenario: "سناریو",
  conservative: "محافظه‌کارانه",
  expected: "محتمل",
  optimistic: "خوش‌بینانه",
  assumptions: "فرض‌ها",
  finalReview: "بازبینی نهایی",
  readyToExport: "آمادهٔ دریافت گزارش",
  netSocialValue: "ارزش خالص اجتماعی",
  totalInvestment: "کل سرمایه‌گذاری",
  downloadPdf: "چاپ / ذخیرهٔ گزارش PDF",
  screeningEstimate: "این برآورد اولیه است و ارزش‌گذاری حسابرسی‌شده محسوب نمی‌شود.",
  stages: {
    overview: "نمای کلی",
    financial: "منابع مالی",
    outputs: "خروجی‌های مستقیم",
    outcomes: "پیامدها و ارزش‌ها",
    adjustments: "تعدیل اثر",
    results: "نتیجهٔ ارزیابی",
  } satisfies Record<Stage, string>,
  guides: {
    overview: "با فرض‌هایی شروع کنید که برایشان شواهد دارید و هر ورودی را با اطلاعات محلی دقیق‌تر کنید. برآورد با تغییر داده‌ها به‌روز می‌شود.",
    financial: "مبالغی را وارد کنید که واقعاً به برنامه اختصاص یافته‌اند. ارزش زمان داوطلبان را فقط زمانی حساب کنید که مبنای نرخ ساعتی و دورهٔ سنجش روشن باشد.",
    outputs: "افراد، مشاغل و موادی را بشمارید که مستقیماً و به‌طور قابل‌راستی‌آزمایی تحت تأثیر برنامه بوده‌اند؛ از پیش‌بینی‌های بی‌پشتوانه استفاده نکنید.",
    outcomes: "ارزشِ تغییر معنادار را بسنجید، نه صرفاً حجم فعالیت را. منبع هر برآورد را ثبت کنید و در نبود شواهد کافی، نرخ تغییر محتاطانه‌ای در نظر بگیرید.",
    adjustments: "برای جلوگیری از انتساب بیش‌ازحد، تغییراتِ مستقل از برنامه، سهم دیگران، پیامدهای ناخواسته و کاهش اثر در گذر زمان را لحاظ کنید.",
    results: "نسبت را در کنار فرض‌های محاسبه‌شده بررسی کنید، سناریوها را بسنجید و شواهد خود را ثبت کنید. این نتیجه برآورد اولیه است، نه ارزش‌گذاری حسابرسی‌شده.",
  } satisfies Record<Stage, string>,
} as const;

const faFields = {
  budget: { label: "بودجهٔ سالانه / سرمایه‌گذاری اولیه", help: "وجه نقدی که مستقیماً به برنامه اختصاص یافته است.", suffix: "ریال" },
  volunteerHours: { label: "ساعت داوطلبی", help: "زمانی که افراد در دورهٔ ارزیابی بدون دریافت دستمزد صرف کرده‌اند.", suffix: "ساعت" },
  hourlyRate: { label: "ارزش هر ساعت داوطلبی", help: "برآوردی محتاطانه از ارزش یک ساعت کار داوطلبانه.", suffix: "ریال / ساعت" },
  beneficiaries: { label: "ذی‌نفعان مستقیم", help: "افرادی که مستقیماً از برنامه خدمات یا حمایت دریافت کرده‌اند.", suffix: "نفر" },
  jobs: { label: "مشاغل پایدار ایجادشده", help: "مشاغلی که برای گروه‌های کمتر برخوردار ایجاد شده‌اند.", suffix: "شغل" },
  waste: { label: "پسماند بازیابی‌شده", help: "موادی که در نتیجهٔ مداخله از چرخهٔ دورریز خارج شده‌اند.", suffix: "کیلوگرم" },
  changeRate: { label: "نرخ تغییر مثبت", help: "برآورد مستند یا سنجیده‌شدهٔ میزان تغییر منتسب به برنامه.", suffix: "٪" },
  socialProxy: { label: "ارزش اجتماعی هر ذی‌نفع", help: "برای نمونه، هزینه‌های سلامت یا رفاهی که از آن‌ها جلوگیری شده است.", suffix: "ریال / نفر" },
  environmentalProxy: { label: "ارزش زیست‌محیطی هر کیلوگرم", help: "هزینهٔ جمع‌آوریِ حذف‌شده به‌علاوهٔ ارزش کربن ذخیره‌شده.", suffix: "ریال / کیلوگرم" },
  economicProxy: { label: "ارزش اقتصادی هر شغل", help: "ارزش برآوردی اشتغال پایدار برای خانوار و جامعه.", suffix: "ریال / شغل" },
  deadweight: { label: "تغییر بدون مداخله", help: "بخشی از تغییر که احتمالاً حتی بدون برنامه رخ می‌داد.", suffix: "٪" },
  attribution: { label: "سهم سایر نهادها", help: "بخشی از موفقیت که باید به سازمان‌ها یا افراد دیگر نسبت داد.", suffix: "٪" },
  displacement: { label: "جابه‌جایی اثر", help: "ارزش مثبتی که در جای دیگری زیان یا پیامد منفی ایجاد می‌کند.", suffix: "٪" },
  dropoff: { label: "کاهش اثر در گذر زمان", help: "کاهش سالانهٔ ارزش پیامدها در طول زمان.", suffix: "٪" },
} satisfies Record<keyof Form, { label: string; help: string; suffix: string }>;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  :root {
    --social: #86e0cd;
    --economic: #f0d07a;
    --environmental: #afcfe1;
    --text-primary: rgba(255,255,255,0.96);
    --text-secondary: rgba(255,255,255,0.72);
    --text-muted: rgba(255,255,255,0.48);
    --glass-bg: rgba(54, 76, 86, 0.34);
    --glass-bg-strong: rgba(34, 48, 56, 0.52);
    --glass-border: rgba(255,255,255,0.22);
    --glass-highlight: rgba(255,255,255,0.06);
    --track: rgba(255,255,255,0.12);
    --track-strong: rgba(255,255,255,0.18);
    --shadow: rgba(0, 0, 0, 0.18);
    --dark: rgba(8, 19, 26, 0.8);
    --coral: #efb1a4;
  }

  .er-console {
    position: relative;
    height: 100vh;
    min-height: 100vh;
    padding: 8px 16px 6px;
    color: var(--text-primary);
    background: #081d28 url('/bg.png') center center / cover no-repeat fixed;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif;
    overflow: hidden;
  }

  .er-console * { box-sizing: border-box; }

  .er-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, rgba(5, 22, 27, 0.76), rgba(8, 20, 27, 0.56) 35%, rgba(7, 19, 28, 0.68));
    backdrop-filter: blur(1.5px);
    pointer-events: none;
  }

  .er-shell {
    position: relative;
    z-index: 1;
    max-width: 1460px;
    margin: 0 auto;
    height: calc(100vh - 14px);
    min-height: 0;
    display: grid;
    grid-template-rows: 32px minmax(0, 1fr) 18px;
    gap: 8px;
  }

  .glass {
    background: linear-gradient(180deg, rgba(91, 110, 120, 0.28), rgba(30, 40, 49, 0.36));
    border: 1px solid var(--glass-border);
    box-shadow: inset 0 1px rgba(255,255,255,0.12), 0 18px 36px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px) saturate(125%);
    -webkit-backdrop-filter: blur(18px) saturate(125%);
  }

  .er-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0 2px;
  }

  .er-brand {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 160px;
    height: 28px;
    text-decoration: none;
    color: var(--text-primary);
    overflow: hidden;
  }

  .er-brand img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: left center;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
  }

  .er-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 9px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-secondary);
    line-height: 1;
    flex: 1;
    white-space: nowrap;
  }

  .er-status .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--social);
    box-shadow: 0 0 0 3px rgba(134,224,205,0.14);
  }

  .er-status .divider {
    opacity: 0.55;
    letter-spacing: 0.08em;
  }

  .er-topbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .er-icon-btn,
  .er-topbar-actions a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    border-radius: 10px;
    border: 1px solid var(--glass-border);
    background: rgba(255,255,255,0.08);
    color: var(--text-primary);
    text-decoration: none;
  }

  .er-icon-btn {
    width: 30px;
    padding: 0;
  }

  .er-topbar-actions a {
    padding: 0 12px 0 10px;
    color: var(--text-secondary);
    gap: 8px;
    font-size: 11px;
    letter-spacing: 0.02em;
  }

  .er-body {
    display: grid;
    grid-template-columns: 190px minmax(0, 1fr) 280px;
    gap: 12px;
    min-height: 0;
  }

  .er-rail {
    border-radius: 18px;
    padding: 10px 8px 12px;
    background: linear-gradient(180deg, rgba(67, 82, 94, 0.28), rgba(23, 35, 42, 0.34));
    border: 1px solid var(--glass-border);
    box-shadow: inset 0 1px rgba(255,255,255,0.1), 0 18px 36px rgba(0,0,0,0.12);
    backdrop-filter: blur(18px) saturate(125%);
  }

  .er-rail-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px 12px;
    color: var(--text-muted);
    font-size: 8px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .er-rail-head button {
    display: none;
  }

  .er-rail nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .rail-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    border: 1px solid transparent;
    background: transparent;
    border-radius: 12px;
    color: var(--text-primary);
    padding: 8px 8px;
    text-align: left;
    cursor: pointer;
    transition: background 180ms ease, border-color 180ms ease;
  }

  .rail-item.active {
    background: rgba(152, 164, 172, 0.12);
    border-color: rgba(255,255,255,0.15);
  }

  .rail-item .icon-shell {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    color: rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
  }

  .rail-item .copy {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .rail-item .copy strong {
    font-size: 11px;
    font-weight: 500;
    line-height: 1.2;
  }

  .rail-item .copy small {
    color: var(--text-muted);
    font-size: 7px;
    letter-spacing: 0.05em;
    margin-top: 2px;
    text-transform: none;
  }

  .rail-item .state-mark {
    color: rgba(255,255,255,0.72);
    opacity: 0;
  }

  .rail-item.active .state-mark {
    opacity: 1;
  }

  .rail-tip {
    margin-top: 18px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 10px 0;
    color: var(--text-secondary);
    border-top: 1px solid rgba(255,255,255,0.08);
    font-size: 10px;
    line-height: 1.4;
  }

  .rail-tip strong {
    display: block;
    margin-bottom: 2px;
    color: var(--text-primary);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .er-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .er-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    min-height: 178px;
  }

  .er-heading-copy {
    flex: 1;
    min-width: 0;
    padding-top: 2px;
  }

  .eyebrow {
    display: inline-block;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }

  .er-heading h1 {
    margin: 0;
    font-size: clamp(3.2rem, 4vw, 5.1rem);
    line-height: 0.88;
    letter-spacing: -0.07em;
    font-weight: 600;
    color: var(--text-primary);
  }

  .er-heading h1 em {
    color: var(--social);
    font-style: normal;
    display: block;
    margin-top: 2px;
  }

  .er-heading p {
    margin: 16px 0 0;
    font-size: 14px;
    color: var(--text-secondary);
    max-width: 560px;
    line-height: 1.5;
  }

  .total-value {
    width: 440px;
    min-width: 360px;
    height: 178px;
    border-radius: 18px;
    padding: 18px 22px 18px 24px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(67, 93, 110, 0.35), rgba(255,255,255,0.08));
  }

  .total-value::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent 55%);
    pointer-events: none;
  }

  .total-value-label {
    display: block;
    color: var(--text-secondary);
    font-size: 8px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }

  .total-value strong {
    display: block;
    font-size: clamp(2.4rem, 2.7vw, 4.15rem);
    line-height: 1;
    letter-spacing: -0.06em;
    font-weight: 600;
    margin: 0 0 10px;
  }

  .total-value small {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .total-value small b {
    color: var(--social);
    font-weight: 600;
    font-size: 12px;
  }

  .total-value .value-pill {
    position: absolute;
    top: 16px;
    right: 16px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 10px;
    background: rgba(255,255,255,0.14);
    border: 1px solid rgba(255,255,255,0.12);
    font-size: 9px;
    color: var(--text-secondary);
    letter-spacing: 0.04em;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 12px;
    min-height: 0;
  }

  .panel {
    border-radius: 18px;
    padding: 14px 16px 12px;
    min-height: 0;
  }

  .panel-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
    color: var(--text-secondary);
  }

  .panel-head span {
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .panel-head small {
    font-size: 8px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .value-panel {
    min-height: 216px;
  }

  .value-layout {
    display: grid;
    grid-template-columns: 190px minmax(0, 1fr);
    gap: 8px;
    align-items: center;
    min-height: 162px;
  }

  .donut {
    --segment-social: var(--social);
    --segment-economic: var(--economic);
    --segment-environmental: var(--environmental);
    width: 175px;
    aspect-ratio: 1;
    border-radius: 50%;
    position: relative;
    display: grid;
    place-items: center;
    margin: 0 auto;
    background: conic-gradient(
      var(--segment-social) 0deg 137deg,
      var(--segment-economic) 137deg 255deg,
      var(--segment-environmental) 255deg 360deg
    );
  }

  .donut::before {
    content: "";
    position: absolute;
    inset: 18px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.02);
    box-shadow: none;
  }

  .donut .center {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 2px;
  }

  .donut .center strong {
    font-size: 1.05rem;
    letter-spacing: -0.04em;
    font-weight: 600;
  }

  .donut .center span {
    font-size: 8px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .bar-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 4px;
  }

  .bar-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .bar-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 11px;
  }

  .bar-item-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    min-width: 0;
  }

  .bar-item-label .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 0 2px rgba(255,255,255,0.08);
  }

  .dot.social { background: var(--social); }
  .dot.economic { background: var(--economic); }
  .dot.environmental { background: var(--environmental); }
  .dot.coral { background: var(--coral); }

  .bar-item-header b {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .bar-track {
    position: relative;
    width: 100%;
    height: 8px;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.06);
  }

  .bar-fill {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: inherit;
    background: linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.0));
  }

  .bar-fill.social { background: var(--social); }
  .bar-fill.economic { background: var(--economic); }
  .bar-fill.environmental { background: var(--environmental); }
  .bar-fill.coral { background: var(--coral); }

  .bridge-panel {
    min-height: 216px;
  }

  .bridge-rows {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
  }

  .bridge-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bridge-row-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 11px;
  }

  .bridge-row-head b {
    color: var(--text-primary);
    font-weight: 600;
  }

  .bridge-note {
    margin-top: 16px;
    font-size: 11px;
    color: var(--text-secondary);
    opacity: 0.9;
  }

  .metric-strip,
  .snapshot-strip {
    grid-column: 1 / -1;
    min-height: 88px;
    padding: 12px 16px;
  }

  .metric-strip-inner,
  .snapshot-inner {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    min-height: 0;
    height: 100%;
  }

  .metric-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .metric-pill .metric-icon {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.06);
  }

  .metric-pill .metric-icon.social { background: rgba(134,224,205,0.1); }
  .metric-pill .metric-icon.economic { background: rgba(240,208,122,0.1); }
  .metric-pill .metric-icon.environmental { background: rgba(175,207,225,0.1); }

  .metric-pill strong {
    display: block;
    font-size: 16px;
    letter-spacing: -0.04em;
    line-height: 1;
  }

  .metric-pill small {
    display: block;
    color: var(--text-secondary);
    margin-top: 2px;
    font-size: 9px;
    letter-spacing: 0.02em;
  }

  .snapshot-inner {
    grid-template-columns: repeat(3, minmax(0, 1fr)) 1.5fr;
  }

  .snapshot-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .snapshot-item .meta {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .snapshot-item strong {
    font-size: 18px;
    letter-spacing: -0.04em;
    line-height: 1;
    font-weight: 600;
  }

  .snapshot-item small {
    color: var(--text-secondary);
    font-size: 9px;
    margin-top: 2px;
  }

  .scenario-box {
    border-left: 1px solid rgba(255,255,255,0.12);
    padding-left: 18px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 10px;
    align-items: center;
  }

  .scenario-box .label {
    grid-column: 1 / -1;
    color: var(--text-muted);
    font-size: 8px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .scenario-box .scenario-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--text-primary);
    font-size: 10px;
    min-height: 28px;
  }

  .scenario-box .scenario-pill.primary {
    background: rgba(134,224,205,0.16);
    color: var(--social);
    border-color: rgba(134,224,205,0.18);
  }

  .er-result {
    display: flex;
    flex-direction: column;
    border-radius: 18px;
    padding: 14px 14px 12px;
    min-height: 0;
  }

  .result-head {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .result-head .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--social);
  }

  .er-result small {
    display: block;
    margin-top: 18px;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .ratio-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-top: 8px;
    min-height: 54px;
  }

  .ratio-row strong {
    font-size: 3rem;
    line-height: 0.9;
    letter-spacing: -0.06em;
    font-weight: 600;
  }

  .ratio-row span {
    font-size: 12px;
    color: var(--social);
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .er-result p {
    margin: 12px 0 0;
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.45;
  }

  .er-result p b {
    color: var(--text-primary);
    font-weight: 600;
  }

  .result-donut {
    --segment-social: var(--social);
    --segment-economic: var(--economic);
    --segment-environmental: var(--environmental);
    width: 200px;
    aspect-ratio: 1;
    border-radius: 50%;
    position: relative;
    display: grid;
    place-items: center;
    margin: 18px auto 14px;
    background: conic-gradient(
      var(--segment-social) 0deg 137deg,
      var(--segment-economic) 137deg 255deg,
      var(--segment-environmental) 255deg 360deg
    );
  }

  .result-donut::before {
    content: "";
    position: absolute;
    inset: 22px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.02);
  }

  .result-donut .center {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
  }

  .result-donut .center strong {
    font-size: 1.15rem;
    letter-spacing: -0.05em;
    font-weight: 600;
  }

  .result-donut .center span {
    font-size: 8px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .legend-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 4px;
  }

  .legend-item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .legend-item .label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .legend-item .amount {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 11px;
  }

  .legend-item .pct {
    color: var(--text-secondary);
    font-size: 10px;
  }

  .download-btn {
    margin-top: 16px;
    width: 100%;
    min-height: 36px;
    border-radius: 12px;
    border: 1px solid var(--glass-border);
    background: rgba(255,255,255,0.08);
    color: var(--text-primary);
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
  }

  .result-disclaimer {
    margin-top: 10px;
    color: var(--text-muted);
    font-size: 10px;
    text-align: center;
  }

  .er-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 6px 0 2px;
    color: var(--text-muted);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .er-foot .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.18);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.08);
  }

  .input-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  }

  .input-stage,
  .result-stage {
    min-width: 0;
  }

  .stage-guide {
    max-width: 760px;
    margin: 10px 4px 0;
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.5;
  }

  .input-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 12px 10px;
    border-radius: 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
  }

  .field label {
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .field .help {
    font-size: 10px;
    color: var(--text-secondary);
    line-height: 1.4;
    min-height: 26px;
  }

  .field .control {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(8, 19, 26, 0.28);
    padding: 0 8px;
  }

  .field .control span {
    color: var(--text-muted);
    font-size: 11px;
  }

  .field input {
    width: 100%;
    border: none;
    background: transparent;
    color: var(--text-primary);
    font-size: 12px;
    outline: none;
  }

  .field input[type="range"] {
    width: 100%;
    margin-top: 2px;
  }

  .results-panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 0;
  }

  .result-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .result-card {
    padding: 14px 12px;
    border-radius: 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
  }

  .result-card span {
    display: block;
    color: var(--text-muted);
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .result-card strong {
    font-size: 1.3rem;
    letter-spacing: -0.05em;
  }

  @media (max-width: 1100px) {
    .er-console {
      overflow: auto;
      padding: 8px 10px 12px;
    }

    .er-shell {
      height: auto;
      min-height: 100vh;
      grid-template-rows: auto auto auto;
    }

    .er-body {
      grid-template-columns: 1fr;
    }

    .er-rail {
      padding: 10px 8px;
    }

    .er-rail nav {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .rail-item {
      width: calc(50% - 4px);
    }

    .er-main {
      order: 2;
    }

    .er-result {
      order: 3;
    }

    .er-heading {
      flex-direction: column;
      min-height: auto;
    }

    .total-value {
      width: 100%;
      min-width: 0;
    }

    .overview-grid {
      grid-template-columns: 1fr;
    }

    .input-grid,
    .result-summary,
    .snapshot-inner,
    .metric-strip-inner {
      grid-template-columns: 1fr;
    }

    .scenario-box {
      border-left: none;
      border-top: 1px solid rgba(255,255,255,0.12);
      padding-left: 0;
      padding-top: 12px;
    }
  }
`;

function calculate(form: Form): Result {
  const investment = form.budget + form.volunteerHours * form.hourlyRate;
  const change = Math.max(0, Math.min(100, form.changeRate)) / 100;
  const adjustment =
    (1 - form.deadweight / 100) *
    (1 - form.attribution / 100) *
    (1 - form.displacement / 100) *
    (1 - form.dropoff / 100);

  const values = {
    social: form.beneficiaries * form.socialProxy * change * adjustment,
    environmental: form.waste * form.environmentalProxy * change * adjustment,
    economic: form.jobs * form.economicProxy * change * adjustment,
  };

  const total = values.social + values.environmental + values.economic;

  return {
    investment,
    total,
    values,
    adjustment,
    ratio: investment ? total / investment : 0,
  };
}

function formatNumber(value: number, locale: Locale, maximumFractionDigits = 0) {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", { maximumFractionDigits }).format(value);
}

function money(value: number, compact = false, locale: Locale = "en") {
  const amount = Math.max(0, value);
  if (locale === "fa") {
    const scales = [
      { limit: 1000000000, divisor: 1000000000, label: "میلیارد" },
      { limit: 1000000, divisor: 1000000, label: "میلیون" },
      { limit: 1000, divisor: 1000, label: "هزار" },
    ];
    const scale = compact ? scales.find(({ limit }) => amount >= limit) : undefined;
    const formatted = formatNumber(scale ? amount / scale.divisor : amount, "fa", scale ? 1 : 0);
    return `${formatted}${scale ? ` ${scale.label}` : ""} ریال`;
  }
  if (compact && amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (compact && amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${formatNumber(amount, "en")}`;
}

function number(value: string) {
  const normalized = value
    .replace(/[۰-۹٠-٩]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) % 10))
    .replace(/[٬,،]/g, "")
    .replace(/٫/g, ".");
  return Number(normalized) || 0;
}

function ring(result: Result) {
  const social = result.total ? (result.values.social / result.total) * 360 : 120;
  const economic = result.total ? (result.values.economic / result.total) * 360 : 120;
  return `conic-gradient(#86e0cd 0 ${social}deg, #f0d07a ${social}deg ${social + economic}deg, #afcfe1 ${social + economic}deg 360deg)`;
}

function scenario(form: Form, mode: "low" | "high") {
  return calculate({
    ...form,
    changeRate: mode === "low" ? Math.max(20, form.changeRate - 20) : Math.min(100, form.changeRate + 15),
    deadweight: mode === "low" ? Math.min(90, form.deadweight + 10) : Math.max(0, form.deadweight - 8),
  }).ratio;
}

function stageTitle(stage: Stage, locale: Locale = "en") {
  if (locale === "fa") return faCopy.stages[stage];
  if (stage === "financial") return "Financial inputs";
  if (stage === "outputs") return "Direct outputs";
  if (stage === "outcomes") return "Outcomes & values";
  if (stage === "adjustments") return "Adjustments";
  return "Results";
}

function stageGuide(stage: Stage, locale: Locale = "en") {
  if (locale === "fa") return faCopy.guides[stage];
  if (stage === "financial") return "Use cash actually committed to the programme. Include volunteer time only when you can explain the hourly rate and measurement period.";
  if (stage === "outputs") return "Count direct, verifiable reach: people supported, jobs created, and materials recovered. Avoid forecasts or numbers that cannot be evidenced.";
  if (stage === "outcomes") return "Estimate the value of meaningful change, not activity alone. Record the source of each proxy and use a conservative change rate when evidence is limited.";
  if (stage === "adjustments") return "Reduce overclaiming by accounting for change that would happen anyway, other contributors, unintended harm, and the expected drop-off over time.";
  if (stage === "results") return "Review the ratio alongside the assumptions behind it. Compare scenarios, record your evidence, and treat this result as a screening estimate rather than an audited valuation.";
  return "Start with the assumptions you can support, then refine each input with local evidence. The estimate updates as you move through the workspace.";
}

function Overview({ form, result, locale }: { form: Form; result: Result; locale: Locale }) {
  const fa = locale === "fa";
  const total = result.total;
  const socialShare = total ? (result.values.social / total) * 100 : 0;
  const economicShare = total ? (result.values.economic / total) * 100 : 0;
  const environmentalShare = total ? (result.values.environmental / total) * 100 : 0;
  const gross = result.total / Math.max(result.adjustment, 0.01);

  return (
    <div className="overview-grid">
      <section className="panel glass value-panel">
        <div className="panel-head">
          <span>{fa ? faCopy.valueMix : "Value mix"}</span>
          <small>{fa ? faCopy.currentEstimate : "Current estimate"}</small>
        </div>
        <div className="value-layout">
          <div className="donut" style={{ background: ring(result) }}>
            <div className="center">
              <strong>{money(result.total, true, locale)}</strong>
              <span>{fa ? faCopy.netValue : "Net value"}</span>
            </div>
          </div>
          <div className="bar-list">
            <div className="bar-item">
              <div className="bar-item-header">
                <span className="bar-item-label"><span className="dot social" />{fa ? faCopy.social : "Social"}</span>
                <b>{formatNumber(Math.round(socialShare), locale)}{fa ? "٪" : "%"}</b>
              </div>
              <div className="bar-track"><span className="bar-fill social" style={{ width: `${socialShare}%` }} /></div>
              <div className="bar-item-header">
                <span style={{ color: "var(--text-muted)" }}>{money(result.values.social, true, locale)}</span>
              </div>
            </div>
            <div className="bar-item">
              <div className="bar-item-header">
                <span className="bar-item-label"><span className="dot economic" />{fa ? faCopy.economic : "Economic"}</span>
                <b>{formatNumber(Math.round(economicShare), locale)}{fa ? "٪" : "%"}</b>
              </div>
              <div className="bar-track"><span className="bar-fill economic" style={{ width: `${economicShare}%` }} /></div>
              <div className="bar-item-header">
                <span style={{ color: "var(--text-muted)" }}>{money(result.values.economic, true, locale)}</span>
              </div>
            </div>
            <div className="bar-item">
              <div className="bar-item-header">
                <span className="bar-item-label"><span className="dot environmental" />{fa ? faCopy.environmental : "Environmental"}</span>
                <b>{formatNumber(Math.round(environmentalShare), locale)}{fa ? "٪" : "%"}</b>
              </div>
              <div className="bar-track"><span className="bar-fill environmental" style={{ width: `${environmentalShare}%` }} /></div>
              <div className="bar-item-header">
                <span style={{ color: "var(--text-muted)" }}>{money(result.values.environmental, true, locale)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel glass bridge-panel">
        <div className="panel-head">
          <span>{fa ? faCopy.valueBridge : "Value bridge"}</span>
          <small>{fa ? faCopy.netEffect : "Net effect"}</small>
        </div>
        <div className="bridge-rows">
          {[
            { label: fa ? faCopy.grossOutcomes : "Gross outcomes", value: gross, color: "social" },
            { label: fa ? faCopy.adjustments : "Adjustments", value: gross - result.total, color: "coral" },
            { label: fa ? faCopy.netValue : "Net value", value: result.total, color: "economic" },
          ].map((entry) => {
            const width = gross ? (entry.value / gross) * 100 : 0;
            return (
              <div className="bridge-row" key={entry.label}>
                <div className="bridge-row-head">
                  <span>{entry.label}</span>
                  <b>{formatNumber(Math.round(width), locale)}{fa ? "٪" : "%"}</b>
                </div>
                <div className="bar-track"><span className={`bar-fill ${entry.color}`} style={{ width: `${Math.max(width, 8)}%` }} /></div>
              </div>
            );
          })}
        </div>
        <div className="bridge-note">{fa ? faCopy.adjustmentNote : "Adjustments reduce overclaiming."}</div>
      </section>

      <section className="panel glass metric-strip">
        <div className="metric-strip-inner">
          <div className="metric-pill">
            <div className="metric-icon social"><Users size={14} /></div>
            <div>
              <strong>{formatNumber(form.beneficiaries, locale)}</strong>
              <small>{fa ? faCopy.peopleReached : "People reached"}</small>
            </div>
          </div>
          <div className="metric-pill">
            <div className="metric-icon economic"><BriefcaseBusiness size={14} /></div>
            <div>
              <strong>{formatNumber(form.jobs, locale)}</strong>
              <small>{fa ? faCopy.jobsCreated : "Jobs created"}</small>
            </div>
          </div>
          <div className="metric-pill">
            <div className="metric-icon environmental"><Recycle size={14} /></div>
            <div>
              <strong>{`${formatNumber(form.waste, locale)} ${fa ? "کیلوگرم" : "kg"}`}</strong>
              <small>{fa ? faCopy.wasteRecovered : "Waste recovered"}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="panel glass snapshot-strip">
        <div className="snapshot-inner">
          <div className="snapshot-item">
            <div className="metric-icon social"><Users size={14} /></div>
            <div className="meta">
              <strong>{formatNumber(form.beneficiaries, locale)}</strong>
              <small>{fa ? faCopy.peopleReached : "People reached"}</small>
            </div>
          </div>
          <div className="snapshot-item">
            <div className="metric-icon economic"><BriefcaseBusiness size={14} /></div>
            <div className="meta">
              <strong>{formatNumber(form.jobs, locale)}</strong>
              <small>{fa ? faCopy.jobsCreated : "Jobs created"}</small>
            </div>
          </div>
          <div className="snapshot-item">
            <div className="metric-icon environmental"><Recycle size={14} /></div>
            <div className="meta">
              <strong>{`${formatNumber(form.waste, locale)} ${fa ? "کیلوگرم" : "kg"}`}</strong>
              <small>{fa ? faCopy.wasteRecovered : "Waste recovered"}</small>
            </div>
          </div>
          <div className="scenario-box">
            <span className="label">{fa ? faCopy.scenario : "Scenario"}</span>
            <span className="scenario-pill">{fa ? faCopy.conservative : "Conservative"} {formatNumber(scenario(form, "low"), locale, 2)}</span>
            <span className="scenario-pill primary">{fa ? faCopy.expected : "Expected"} {formatNumber(result.ratio, locale, 2)}</span>
            <span className="scenario-pill">{fa ? faCopy.optimistic : "Optimistic"} {formatNumber(scenario(form, "high"), locale, 2)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function Inputs({ stage, form, update, locale }: { stage: Stage; form: Form; update: (key: keyof Form, value: string) => void; locale: Locale }) {
  const fields: { key: keyof Form; label: string; help: string; prefix?: string; suffix?: string; range?: boolean }[] =
    stage === "financial"
      ? [
          { key: "budget", label: "Annual budget / initial investment", help: "Direct cash committed to this programme.", prefix: "$", suffix: "USD" },
          { key: "volunteerHours", label: "Volunteer hours", help: "Unpaid time contributed during the assessment period.", suffix: "hours" },
          { key: "hourlyRate", label: "Base hourly rate", help: "A conservative value for one volunteer hour.", prefix: "$", suffix: "/ hour" },
        ]
      : stage === "outputs"
        ? [
            { key: "beneficiaries", label: "Direct beneficiaries", help: "People directly reached, trained or supported.", suffix: "people" },
            { key: "jobs", label: "Sustainable jobs created", help: "New jobs expected to remain in place.", suffix: "jobs" },
            { key: "waste", label: "Waste diverted", help: "Material recovered through the intervention.", suffix: "kg" },
          ]
        : stage === "outcomes"
          ? [
              { key: "changeRate", label: "Positive change rate", help: "Measured or evidenced estimate of change.", suffix: "%", range: true },
              { key: "socialProxy", label: "Social value per beneficiary", help: "Avoided health or welfare costs.", prefix: "$", suffix: "per person" },
              { key: "environmentalProxy", label: "Environmental value per kg", help: "Collection cost avoided plus carbon value.", prefix: "$", suffix: "per kg" },
              { key: "economicProxy", label: "Economic value per job", help: "Estimated value of stable work.", prefix: "$", suffix: "per job" },
            ]
          : [
              { key: "deadweight", label: "Deadweight", help: "Change likely without your intervention.", suffix: "%", range: true },
              { key: "attribution", label: "Attribution", help: "Success attributable to other organizations.", suffix: "%", range: true },
              { key: "displacement", label: "Displacement", help: "Positive value that creates harm elsewhere.", suffix: "%", range: true },
              { key: "dropoff", label: "Drop-off", help: "Annual reduction in outcome value over time.", suffix: "%", range: true },
            ];
  const displayedFields = locale === "fa"
    ? fields.map((field) => ({ ...field, ...faFields[field.key], prefix: undefined }))
    : fields;

  return (
    <div className="input-stage">
      <div className="panel glass input-panel">
      <div className="panel-head">
        <span>{stageTitle(stage, locale)}</span>
        <small>{locale === "fa" ? faCopy.assumptions : "Assumptions"}</small>
      </div>
      <div className="input-grid">
        {displayedFields.map((field) => (
          <div key={field.key} className="field">
            <label htmlFor={`impact-${field.key}`}>{field.label}</label>
            <div className="help">{field.help}</div>
            <div className="control">
              {field.prefix && <span>{field.prefix}</span>}
              <input
                id={`impact-${field.key}`}
                type={locale === "fa" ? "text" : "number"}
                inputMode="numeric"
                dir={locale === "fa" ? "ltr" : undefined}
                value={locale === "fa" ? formatNumber(form[field.key], locale) : form[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
              />
              {field.suffix && <span>{field.suffix}</span>}
            </div>
            {field.range && (
              <input type="range" min={0} max={100} value={form[field.key]} onChange={(event) => update(field.key, event.target.value)} />
            )}
          </div>
        ))}
      </div>
      </div>
      <p className="stage-guide">{stageGuide(stage, locale)}</p>
    </div>
  );
}

function Results({ result, exportPdf, locale }: { result: Result; exportPdf: () => void; locale: Locale }) {
  const fa = locale === "fa";
  return (
    <div className="result-stage">
      <div className="panel glass results-panel">
      <div className="panel-head">
        <span>{fa ? faCopy.stages.results : "Final review"}</span>
        <small>{fa ? faCopy.readyToExport : "Ready to export"}</small>
      </div>
      <div className="result-summary">
        <div className="result-card"><span>{fa ? faCopy.netSocialValue : "Net social value"}</span><strong>{money(result.total, false, locale)}</strong></div>
        <div className="result-card"><span>{fa ? faCopy.totalInvestment : "Total investment"}</span><strong>{money(result.investment, false, locale)}</strong></div>
        <div className="result-card"><span>{fa ? "نسبت SROI" : "SROI ratio"}</span><strong>{formatNumber(result.ratio, locale, 2)} : 1</strong></div>
      </div>
      <button className="download-btn" type="button" onClick={exportPdf}><Download size={14} /> {fa ? faCopy.downloadPdf : "Download PDF report"}</button>
      </div>
      <p className="stage-guide">{stageGuide("results", locale)}</p>
    </div>
  );
}

function printPersianReport(form: Form, result: Result) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
  const rows = [
    ["نسبت بازده اجتماعی سرمایه‌گذاری (SROI)", `${formatNumber(result.ratio, "fa", 2)} : 1`],
    ["ارزش خالص اجتماعی", money(result.total, false, "fa")],
    ["کل سرمایه‌گذاری", money(result.investment, false, "fa")],
    ["ارزش اجتماعی", money(result.values.social, false, "fa")],
    ["ارزش اقتصادی", money(result.values.economic, false, "fa")],
    ["ارزش زیست‌محیطی", money(result.values.environmental, false, "fa")],
  ];
  const assumptions = [
    ["بودجهٔ سالانه / سرمایه‌گذاری اولیه", money(form.budget, false, "fa")],
    ["ساعت داوطلبی", `${formatNumber(form.volunteerHours, "fa")} ساعت`],
    ["ارزش هر ساعت داوطلبی", money(form.hourlyRate, false, "fa")],
    ["ذی‌نفعان مستقیم", formatNumber(form.beneficiaries, "fa")],
    ["مشاغل پایدار ایجادشده", formatNumber(form.jobs, "fa")],
    ["پسماند بازیابی‌شده", `${formatNumber(form.waste, "fa")} کیلوگرم`],
    ["نرخ تغییر مثبت", `${formatNumber(form.changeRate, "fa")}٪`],
    ["ارزش اجتماعی هر ذی‌نفع", money(form.socialProxy, false, "fa")],
    ["ارزش زیست‌محیطی هر کیلوگرم", money(form.environmentalProxy, false, "fa")],
    ["ارزش اقتصادی هر شغل", money(form.economicProxy, false, "fa")],
    ["تغییر بدون مداخله", `${formatNumber(form.deadweight, "fa")}٪`],
    ["سهم سایر نهادها", `${formatNumber(form.attribution, "fa")}٪`],
    ["جابه‌جایی اثر", `${formatNumber(form.displacement, "fa")}٪`],
    ["کاهش اثر در گذر زمان", `${formatNumber(form.dropoff, "fa")}٪`],
  ];
  const tableRows = (items: string[][]) => items.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("");

  printWindow.document.write(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>گزارش ارزیابی اثر اجتماعی</title><style>
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box}body{margin:0;padding:36px;color:#162932;font-family:Vazirmatn,Tahoma,sans-serif;line-height:1.8}main{max-width:820px;margin:auto}h1{margin:0 0 6px;font-size:28px}p{margin:0 0 24px;color:#52666d}h2{margin:28px 0 8px;font-size:17px}table{width:100%;border-collapse:collapse}th,td{padding:9px 12px;border-bottom:1px solid #dbe4e5;text-align:right}th{font-weight:500}td{font-weight:700;direction:rtl}.notice{margin-top:24px;padding:12px 14px;border-right:3px solid #238575;background:#f2f8f6;color:#52666d;font-size:13px}@media print{body{padding:0}main{max-width:none}h2{break-after:avoid}tr{break-inside:avoid}}
    </style></head><body><main><h1>گزارش ارزیابی اثر اجتماعی</h1><p>برآورد بر پایهٔ فرض‌های ثبت‌شده در ابزار ارزیابی اثر اجتماعی</p><h2>خلاصهٔ ارزیابی</h2><table><tbody>${tableRows(rows)}</tbody></table><h2>فرض‌های محاسبه</h2><table><tbody>${tableRows(assumptions)}</tbody></table><div class="notice">این گزارش یک برآورد اولیه است و ارزش‌گذاری حسابرسی‌شده محسوب نمی‌شود. منابع و فرض‌ها را پیش از تصمیم‌گیری با شواهد محلی بررسی کنید.</div></main></body></html>`);
  printWindow.document.close();
  void printWindow.document.fonts.ready.then(() => {
    printWindow.focus();
    printWindow.print();
  });
}

export default function ImpactConsoleDashboard({ locale = "en" }: { locale?: Locale }) {
  const fa = locale === "fa";
  const [stage, setStage] = useState<Stage>("overview");
  const [form, setForm] = useState<Form>(fa ? persianInitial : initial);
  const [railOpen, setRailOpen] = useState(false);
  const result = useMemo(() => calculate(form), [form]);
  const localizedStages = stages.map((item) => ({ ...item, label: fa ? faCopy.stages[item.id] : item.label }));

  const update = (key: keyof Form, value: string) => {
    setForm((current) => ({ ...current, [key]: number(value) }));
  };

  const exportPdf = () => {
    if (fa) {
      printPersianReport(form, result);
      return;
    }
    const document = new jsPDF();
    document.setFontSize(20);
    document.text("Social Impact Assessment Report", 20, 24);
    document.setFontSize(11);
    document.text(`SROI ratio: ${result.ratio.toFixed(2)} : 1`, 20, 40);
    document.text(`Net social value: ${money(result.total)}`, 20, 50);
    document.text(`Total investment: ${money(result.investment)}`, 20, 60);
    document.save("social-impact-assessment.pdf");
  };

  const currentStage = localizedStages.find((item) => item.id === stage)!;

  return (
    <main className={`er-console${fa ? " is-persian" : ""}`} dir={fa ? "rtl" : "ltr"}>
      <style>{styles + fidelityStyles + (fa ? persianStyles : "")}</style>
      <div className="er-overlay" />
      <div className="er-shell">
        <header className="er-topbar">
          <button className="er-icon-btn" type="button" aria-label={fa ? "باز کردن منو" : "Open menu"} onClick={() => setRailOpen((open) => !open)} style={{ display: "none" }}>
            <Menu size={16} />
          </button>
          <Link href={fa ? "/fa" : "/en"} className="er-brand" aria-label="SSE Impact Lab">
            <Image src={fa ? "/homepage/persian-logo-2.png" : "/homepage/logo-2-w.png"} alt={fa ? "دانشنامه اقتصاد اجتماعی و همبستگی" : "SSE Impact Lab"} width={160} height={28} priority />
          </Link>

          <div className="er-status">
            <span className="dot" />
            <span>{fa ? faCopy.status : "Assessment in progress"}</span>
            <span className="divider">•</span>
            <span>{fa ? faCopy.updated : "Updated just now"}</span>
          </div>

          <div className="er-topbar-actions">
            <button className="er-icon-btn" type="button" aria-label={fa ? "ذخیره" : "Save"}>
              <Save size={15} />
            </button>
            <Link href={fa ? "/fa" : "/en"} aria-label={fa ? "بازگشت به دانشنامه" : "Back to encyclopedia"}>
              {fa ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
              <span>{fa ? faCopy.encyclopedia : "Encyclopedia"}</span>
            </Link>
          </div>
        </header>

        <div className="er-body">
          <aside className={`er-rail ${railOpen ? "open" : ""}`}>
            <div className="er-rail-head">
              <span>{fa ? faCopy.workspace : "Workspace"}</span>
              <button type="button" aria-label={fa ? "بستن منو" : "Close menu"} onClick={() => setRailOpen(false)}>
                <X size={14} />
              </button>
            </div>
            <nav>
              {localizedStages.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={`rail-item ${stage === id ? "active" : ""}`}
                  onClick={() => {
                    setStage(id);
                    setRailOpen(false);
                  }}
                >
                  <span className="icon-shell"><Icon size={15} /></span>
                  <span className="copy">
                    <strong>{label}</strong>
                    <small>{stage === id ? (fa ? faCopy.activeView : "Active view") : (fa ? faCopy.ready : "Ready")}</small>
                  </span>
                  <span className="state-mark"><Check size={13} /></span>
                </button>
              ))}
            </nav>
            <div className="rail-tip">
              <CircleHelp size={14} />
              <div>
                <strong>{fa ? faCopy.dataTip : "Data tip"}</strong>
                {fa ? faCopy.dataTipText : "Use measured evidence before proxies."}
              </div>
            </div>
          </aside>

          <section className="er-main">
            <div className="er-heading">
              <div className="er-heading-copy">
                <span className="eyebrow">{fa ? faCopy.decisionSupport : "Decision support"} / {currentStage.label.toUpperCase()}</span>
                <h1>
                  {stage === "overview" && fa ? (
                    <>ارزیابی اثر<em>اجتماعی</em></>
                  ) : stage === "overview" ? (
                    <>
                      Social impact
                      <em>assessment</em>
                    </>
                  ) : (
                    stageTitle(stage, locale)
                  )}
                </h1>
              </div>

              <div className="total-value glass">
                <span className="total-value-label">{fa ? faCopy.totalValue : "Total social value"}</span>
                <span className="value-pill">◈ {fa ? faCopy.valueCreated : "Value created"}</span>
                <strong dir={fa ? "rtl" : "ltr"}>{money(result.total, true, locale)}</strong>
                <small>{fa ? faCopy.netValue : "Net value"} <b>{fa ? "برآورد زنده" : "↗ +12%"}</b></small>
              </div>
            </div>

            {stage === "overview" ? <Overview form={form} result={result} locale={locale} /> : stage === "results" ? <Results result={result} exportPdf={exportPdf} locale={locale} /> : <Inputs stage={stage} form={form} update={update} locale={locale} />}
          </section>

          <div className="er-right-column">
          <aside className="er-result glass">
            <div className="result-head"><span className="dot" /> {fa ? faCopy.liveResult : "Live result"}</div>
            <small>{fa ? "نسبت بازده اجتماعی سرمایه‌گذاری" : "SROI ratio"}</small>
            <div className="ratio-row">
              <strong dir="ltr">{formatNumber(result.ratio, locale, 2)}</strong>
              <span>{fa ? "نسبت فعلی" : "↗ +0.12"}</span>
            </div>
            <p>
              {fa ? <>{faCopy.ratioSentenceBefore} <b dir="rtl">{formatNumber(result.ratio, locale, 2)} ریال</b> {faCopy.ratioSentenceAfter}</> : <>Every $1 invested creates an estimated <b>${result.ratio.toFixed(2)}</b> in social value.</>}
            </p>

            <div className="result-donut" style={{ background: ring(result) }}>
              <div className="center">
                <strong>{money(result.total, true, locale)}</strong>
                <span>{fa ? faCopy.netValue : "Net value"}</span>
              </div>
            </div>

            <div className="legend-list">
              <div className="legend-item">
                <span className="label"><span className="dot social" />{fa ? faCopy.social : "Social"}</span>
                <span className="amount">{money(result.values.social, true, locale)}</span>
                <span className="pct">{formatNumber(Math.round((result.values.social / result.total) * 100) || 0, locale)}{fa ? "٪" : "%"}</span>
              </div>
              <div className="legend-item">
                <span className="label"><span className="dot economic" />{fa ? faCopy.economic : "Economic"}</span>
                <span className="amount">{money(result.values.economic, true, locale)}</span>
                <span className="pct">{formatNumber(Math.round((result.values.economic / result.total) * 100) || 0, locale)}{fa ? "٪" : "%"}</span>
              </div>
              <div className="legend-item">
                <span className="label"><span className="dot environmental" />{fa ? faCopy.environmental : "Environmental"}</span>
                <span className="amount">{money(result.values.environmental, true, locale)}</span>
                <span className="pct">{formatNumber(Math.round((result.values.environmental / result.total) * 100) || 0, locale)}{fa ? "٪" : "%"}</span>
              </div>
            </div>

            <button className="download-btn" type="button" onClick={exportPdf}><Download size={14} /> {fa ? "چاپ / ذخیرهٔ گزارش PDF" : "Download report"}</button>
            <div className="result-disclaimer">{fa ? faCopy.screeningEstimate : "Screening estimate, not an audited valuation."}</div>
          </aside>
          </div>
        </div>

        <div className="er-foot">
          <span>{fa ? "آزمایشگاه اثر / فضای ارزیابی" : "Impact Lab / assessment workspace"}</span>
          <span className="dot" />
        </div>
      </div>
    </main>
  );
}

const fidelityStyles = `
  .er-console {
    --navy: #071426;
    --navy-deep: #050f20;
    --panel: rgba(18, 43, 72, 0.72);
    --panel-soft: rgba(24, 53, 86, 0.62);
    --line: rgba(160, 202, 239, 0.18);
    --social: #55e2bd;
    --economic: #79adff;
    --environmental: #b17cf3;
    --gold: #f3ce78;
    --coral: #f18f86;
    min-height: 100vh;
    height: auto;
    overflow: visible;
    padding: 16px 24px 22px;
    background: var(--navy) url('/bg.png') center / cover fixed;
    font-family: 'Inter', sans-serif;
  }
  .er-console::after { content: ''; position: fixed; inset: 0; pointer-events: none; background: radial-gradient(circle at 72% 12%, rgba(80, 149, 218, .2), transparent 31%), linear-gradient(115deg, rgba(3, 12, 27, .91), rgba(5, 24, 48, .69) 58%, rgba(4, 13, 29, .86)); }
  .er-overlay { background: transparent; backdrop-filter: none; }
  .er-shell { max-width: 1580px; height: auto; min-height: calc(100vh - 38px); grid-template-rows: 42px auto 20px; gap: 14px; }
  .er-topbar { padding: 0 2px; }
  .er-brand { width: 188px; height: 35px; justify-content: flex-start; }
  .er-brand img { object-position: left center; }
  .er-status { font-size: 10px; }
  .er-topbar-actions a, .er-icon-btn { background: rgba(18, 44, 76, .7); border-color: var(--line); }
  .er-body { grid-template-columns: 218px minmax(0, 1fr) 314px; gap: 16px; align-items: stretch; }
  .er-rail, .er-result, .panel, .total-value { border-color: var(--line); background: linear-gradient(145deg, rgba(27, 57, 93, .78), rgba(8, 25, 48, .78)); box-shadow: inset 0 1px rgba(255,255,255,.1), 0 20px 48px rgba(0,0,0,.27); backdrop-filter: blur(24px) saturate(130%); }
  .er-rail { min-height: 706px; padding: 18px 14px; border-radius: 18px; }
  .er-rail-head { padding: 3px 10px 17px; color: #91a8c6; }
  .er-rail nav { gap: 10px; }
  .rail-item { padding: 11px 10px; border-radius: 12px; }
  .rail-item.active { background: linear-gradient(105deg, rgba(58, 121, 192, .48), rgba(58, 102, 164, .2)); border-color: rgba(143, 194, 255, .28); box-shadow: inset 0 1px rgba(255,255,255,.1); }
  .rail-item .icon-shell { width: 32px; height: 32px; border-radius: 9px; background: rgba(4, 19, 39, .46); border-color: rgba(172, 212, 251, .15); }
  .rail-item.active .icon-shell { color: var(--social); background: rgba(77, 208, 204, .16); }
  .rail-item .copy strong { font-size: 12px; font-weight: 600; }
  .rail-item .copy small { color: #8fa8c8; font-size: 9px; }
  .rail-item.active .copy small { color: var(--social); }
  .rail-tip { margin: 28px 0 0; padding: 18px 9px 0; color: #9bb0c9; border-color: var(--line); }
  .rail-tip strong { color: #eef6ff; }
  .er-main { gap: 16px; min-height: 0; }
  .er-heading { display: grid; grid-template-columns: minmax(0, .78fr) minmax(0, 1.22fr); min-height: 138px; gap: 18px; }
  .eyebrow, .panel-head span { color: #9db4d0; font-size: 8px; letter-spacing: .18em; }
  .er-heading h1 { font-size: clamp(2.8rem, 3.6vw, 4.25rem); line-height: .9; letter-spacing: -.065em; font-weight: 700; }
  .er-heading h1 em { color: var(--social); }
  .total-value { width: auto; min-width: 0; height: 138px; padding: 18px 24px; border-radius: 18px; background: linear-gradient(115deg, rgba(32, 72, 113, .74), rgba(33, 48, 74, .55)), url('/bg.png') center 46% / cover; }
  .total-value::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(11, 29, 55, .12), rgba(11, 29, 55, .6)); }
  .total-value > * { position: relative; z-index: 1; }
  .total-value-label { margin-bottom: 14px; color: #a8bfda; }
  .total-value strong { font-size: clamp(2.7rem, 3.4vw, 3.8rem); }
  .total-value small { color: #b4c8df; }
  .total-value .value-pill { top: 20px; right: 22px; background: rgba(255,255,255,.13); }
  .overview-grid { grid-template-columns: minmax(0, 1.12fr) minmax(0, .9fr); grid-template-rows: minmax(0, 1fr) auto auto; gap: 16px; flex: 1; min-height: 0; }
  .panel { border-radius: 17px; padding: 19px 20px 17px; }
  .panel-head { margin-bottom: 15px; }
  .panel-head small { color: #8da4c0; }
  .value-panel, .bridge-panel { min-height: 258px; }
  .value-layout { grid-template-columns: 230px minmax(0, 1fr); min-height: 196px; gap: 12px; }
  .donut { width: 190px; filter: drop-shadow(0 0 14px rgba(83, 173, 245, .18)); }
  .donut::after, .result-donut::after { content: ''; position: absolute; inset: 21px; border-radius: 50%; background: #091a31; box-shadow: inset 0 0 22px rgba(0,0,0,.35); }
  .donut::before, .result-donut::before { display: none; }
  .donut .center strong, .result-donut .center strong { font-size: 1.35rem; }
  .bar-list { gap: 13px; }
  .bar-item { gap: 7px; }
  .bar-track { height: 8px; background: rgba(140, 180, 224, .14); border: 0; }
  .bar-fill { background: currentColor; box-shadow: 0 0 9px currentColor; }
  .bar-fill.social { color: var(--social); background: var(--social); }
  .bar-fill.economic { color: var(--economic); background: var(--economic); }
  .bar-fill.environmental { color: var(--environmental); background: var(--environmental); }
  .bridge-rows { gap: 18px; margin-top: 15px; }
  .bridge-row { gap: 8px; }
  .bridge-row-head { color: #c5d4e6; font-size: 13px; }
  .bridge-row-head b { color: #eaf3ff; }
  .bridge-note { margin-top: 20px; color: #9db2cc; }
  .bridge-row:nth-child(1) .bar-fill { background: var(--social); }
  .bridge-row:nth-child(2) .bar-fill { background: var(--coral); }
  .bridge-row:nth-child(3) .bar-fill { background: var(--gold); }
  .metric-strip, .snapshot-strip { min-height: 82px; padding: 13px 18px; }
  .metric-strip-inner { gap: 18px; }
  .metric-pill + .metric-pill { border-left: 1px solid var(--line); padding-left: 24px; }
  .metric-pill .metric-icon { width: 42px; height: 42px; border-radius: 10px; }
  .metric-pill strong { font-size: 19px; }
  .metric-pill small, .snapshot-item small { color: #91a8c4; font-size: 10px; }
  .snapshot-strip { min-height: 76px; }
  .snapshot-inner { grid-template-columns: repeat(3, minmax(0, 1fr)) 1.5fr; }
  .snapshot-item + .snapshot-item { border-left: 1px solid var(--line); padding-left: 18px; }
  .snapshot-item strong { font-size: 18px; }
  .scenario-box { border-color: var(--line); padding-left: 22px; }
  .scenario-box .label { color: var(--social); }
  .scenario-box .scenario-pill { padding: 7px 10px; background: rgba(7, 24, 47, .48); border-color: var(--line); }
  .scenario-box .scenario-pill.primary { background: rgba(73, 218, 186, .22); color: var(--social); }
  .er-right-column { display: grid; gap: 14px; align-self: stretch; }
  .er-result { min-height: 530px; padding: 21px 19px 18px; border-radius: 18px; }
  .result-head { color: #b3c8e0; }
  .er-result small { margin-top: 27px; color: #96acc7; }
  .ratio-row strong { font-size: 3.5rem; }
  .ratio-row span { color: var(--social); }
  .er-result p { color: #b0c2d8; }
  .result-donut { width: 216px; margin: 20px auto 20px; filter: drop-shadow(0 0 16px rgba(83, 173, 245, .18)); }
  .legend-list { gap: 12px; }
  .legend-item { color: #b5c7dc; }
  .legend-item .amount { color: #f3f7ff; }
  .download-btn { margin-top: 20px; min-height: 38px; background: rgba(48, 86, 132, .5); border-color: rgba(166, 204, 242, .27); }
  .er-foot { color: #7e97b4; }
  @media (max-width: 1200px) { .er-body { grid-template-columns: 190px minmax(0, 1fr); } .er-right-column { grid-column: 1 / -1; grid-template-columns: minmax(0, 1fr) minmax(280px, .72fr); } .er-result { min-height: 430px; } }
  @media (max-width: 820px) { .er-console { padding: 12px; } .er-shell { min-height: auto; } .er-body { display: block; } .er-rail { min-height: 0; margin-bottom: 14px; } .er-rail nav { flex-direction: row; flex-wrap: wrap; } .rail-item { width: calc(50% - 5px); } .er-main { margin-bottom: 14px; } .er-heading { display: flex; flex-direction: column; min-height: auto; } .er-heading h1 { font-size: clamp(2.5rem, 11vw, 4rem); } .stage-guide { max-height: 50px; overflow: hidden; font-size: 11px; line-height: 1.4; } .total-value { width: 100%; min-width: 0; } .er-right-column { grid-template-columns: 1fr; } .overview-grid { grid-template-columns: 1fr; grid-template-rows: auto; flex: initial; } .metric-strip-inner, .snapshot-inner { grid-template-columns: 1fr; } .metric-pill + .metric-pill, .snapshot-item + .snapshot-item { border-left: 0; padding-left: 0; } .scenario-box { border-left: 0; border-top: 1px solid var(--line); padding: 14px 0 0; } }
  @media (min-width: 821px) and (max-height: 820px) { .er-heading { min-height: 116px; } .er-heading h1 { font-size: clamp(2.5rem, 3.2vw, 3.6rem); } .stage-guide { max-height: 36px; overflow: hidden; font-size: 10px; line-height: 1.3; } .total-value { height: 116px; padding: 14px 20px; } .total-value-label { margin-bottom: 9px; } .total-value strong { font-size: clamp(2.35rem, 3vw, 3.25rem); } }
`;

const persianStyles = `
  .er-console.is-persian {
    position: relative;
    isolation: isolate;
    direction: rtl;
    text-align: right;
    background: #071426;
    font-family: Vazirmatn, Tahoma, Arial, sans-serif;
  }
  .er-console.is-persian::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    background: url('/bg.png') center / cover no-repeat;
    transform: scaleX(-1);
    pointer-events: none;
  }
  .er-console.is-persian::after { transform: scaleX(-1); }
  .er-console.is-persian,
  .er-console.is-persian * {
    font-family: Vazirmatn, Tahoma, Arial, sans-serif;
    letter-spacing: 0;
  }
  .er-console.is-persian .er-shell { direction: rtl; }
  .er-console.is-persian .er-topbar,
  .er-console.is-persian .er-body,
  .er-console.is-persian .er-main,
  .er-console.is-persian .er-right-column { direction: rtl; }
  .er-console.is-persian .er-brand { width: 240px; height: 42px; justify-content: flex-end; }
  .er-console.is-persian .er-brand img { object-position: right center; filter: brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0,0,0,0.15)); }
  .er-console.is-persian .er-topbar-actions a { padding: 0 10px 0 12px; }
  .er-console.is-persian .rail-item,
  .er-console.is-persian .field,
  .er-console.is-persian .result-card { text-align: right; }
  .er-console.is-persian .total-value { background: linear-gradient(115deg, rgba(32, 72, 113, .74), rgba(33, 48, 74, .55)); }
  .er-console.is-persian .total-value::after {
    background: linear-gradient(115deg, rgba(11, 29, 55, .12), rgba(11, 29, 55, .6)), url('/bg.png') center 46% / cover;
    transform: scaleX(-1);
  }
  .er-console.is-persian .total-value .value-pill { right: auto; left: 22px; }
  .er-console.is-persian .donut,
  .er-console.is-persian .result-donut { transform: scaleX(-1); }
  .er-console.is-persian .donut .center,
  .er-console.is-persian .result-donut .center { transform: scaleX(-1); }
  .er-console.is-persian .bar-fill { inset: 0 0 0 auto; }
  .er-console.is-persian .metric-pill + .metric-pill,
  .er-console.is-persian .snapshot-item + .snapshot-item {
    border-right: 1px solid var(--line);
    border-left: 0;
    padding-right: 24px;
    padding-left: 0;
  }
  .er-console.is-persian .scenario-box {
    border-right: 1px solid var(--line);
    border-left: 0;
    padding-right: 22px;
    padding-left: 0;
  }
  .er-console.is-persian .field .control { flex-direction: row; }
  .er-console.is-persian .field input:not([type="range"]) { direction: ltr; text-align: right; }
  .er-console.is-persian .field input[type="range"] { direction: rtl; }
  .er-console.is-persian .er-foot { padding: 0 2px 0 6px; }
  .er-console.is-persian .ratio-row { direction: rtl; }
  .er-console.is-persian .ratio-row strong,
  .er-console.is-persian .result-card strong { direction: ltr; unicode-bidi: isolate; }
  .er-console.is-persian .legend-item .amount { direction: rtl; unicode-bidi: isolate; }
  .er-console.is-persian .legend-item .pct { direction: ltr; unicode-bidi: isolate; }
  .er-console.is-persian button { letter-spacing: 0; }
  @media (min-width: 1201px) and (min-height: 700px) {
    .er-console.is-persian { height: 100dvh; min-height: 0; overflow: hidden; padding: 10px 22px 8px; }
    .er-console.is-persian .er-shell {
      height: calc(100dvh - 18px);
      min-height: 0;
      grid-template-rows: 42px minmax(0, 1fr) 18px;
      gap: 8px;
    }
    .er-console.is-persian .er-body { min-height: 0; align-items: stretch; grid-template-columns: 218px minmax(0, 1fr) 314px; }
    .er-console.is-persian .er-rail,
    .er-console.is-persian .er-result { height: 100%; min-height: 0; overflow: hidden; }
    .er-console.is-persian .er-main { min-height: 0; gap: 10px; }
    .er-console.is-persian .er-heading { min-height: 116px; }
    .er-console.is-persian .total-value { height: 116px; }
    .er-console.is-persian .value-panel,
    .er-console.is-persian .bridge-panel { min-height: 0; }
    .er-console.is-persian .panel { padding: 14px 16px 12px; }
    .er-console.is-persian .metric-strip,
    .er-console.is-persian .snapshot-strip { min-height: 66px; padding: 9px 14px; }
    .er-console.is-persian .value-layout { grid-template-columns: 190px minmax(0, 1fr); min-height: 150px; }
    .er-console.is-persian .donut { width: min(170px, 22vh); }
    .er-console.is-persian .result-donut { width: min(170px, 22vh); margin: 10px auto; }
    .er-console.is-persian .er-result { padding: 14px; }
    .er-console.is-persian .er-result small { margin-top: 14px; }
    .er-console.is-persian .legend-list { gap: 7px; }
    .er-console.is-persian .download-btn { min-height: 32px; margin-top: 10px; }
  }
  @media (max-width: 820px) {
    .er-console.is-persian .metric-pill + .metric-pill,
    .er-console.is-persian .snapshot-item + .snapshot-item { border-right: 0; padding-right: 0; }
    .er-console.is-persian .scenario-box { border-right: 0; border-top: 1px solid var(--line); padding: 14px 0 0; }
    .er-console.is-persian .er-status { display: none; }
    .er-console.is-persian .er-brand { width: 188px; height: 39px; margin-right: 0; }
  }
`;
