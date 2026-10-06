"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  FileText,
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
  budget: 0,
  volunteerHours: 0,
  hourlyRate: 0,
  beneficiaries: 0,
  jobs: 0,
  waste: 0,
  changeRate: 0,
  socialProxy: 0,
  environmentalProxy: 0,
  economicProxy: 0,
  deadweight: 0,
  attribution: 0,
  displacement: 0,
  dropoff: 0,
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
  updated: "برآورد بر پایهٔ ورودی‌های شما",
  encyclopedia: "دانشنامه",
  workspace: "فضای کار",
  activeView: "نمای فعلی",
  dashboardGuide: "راهنمای کار با داشبورد",
  ready: "آماده",
  dataTip: "منبع علمی",
  referenceGuide: "فایل راهنمای مرجع",
  decisionSupport: "نرخ بازگشت اجتماعی سرمایه‌گذاری، به‌عنوان یک ابزار تصمیم‌یار",
  heading: "ارزیابی اثر اجتماعی",
  methodologySubtitle: "براساس نرخ بازگشت سرمایه اجتماعی (SROI)",
  totalValue: "ارزش اجتماعی برآوردشده",
  valueCreated: "بر پایهٔ فرض‌های واردشده",
  netValue: "ارزش خالص",
  liveResult: "نتیجهٔ زنده",
  ratio: "نسبت بازگشت اجتماعی سرمایه‌گذاری (SROI)",
  ratioSentenceBefore: "به‌ازای هر ۱ تومان سرمایه‌گذاری، حدود",
  ratioSentenceAfter: "ارزش اجتماعی ایجاد می‌شود.",
  valueMix: "ترکیب ارزش",
  currentEstimate: "برآورد فعلی",
  valueBridge: "مسیر تبدیل ارزش",
  netEffect: "مسیر برآورد",
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
  assumptions: "فرض‌ها",
  finalReview: "بازبینی نهایی",
  readyToExport: "آمادهٔ دریافت گزارش",
  netSocialValue: "ارزش خالص اجتماعی",
  totalInvestment: "کل سرمایه‌گذاری",
  downloadPdf: "چاپ / ذخیرهٔ گزارش PDF",
  screeningEstimate: "این برآورد اولیه است و ارزش‌گذاری حسابرسی‌شده محسوب نمی‌شود.",
  stages: {
    overview: "اثر اجتماعی چیست؟",
    financial: "منابع مالی پروژه",
    outputs: "خروجی پروژه",
    outcomes: "پیامدها و ارزش‌ها",
    adjustments: "تعدیل و پالایش اثر",
    results: "نتیجهٔ ارزیابی",
  } satisfies Record<Stage, string>,
  guides: {
    overview: "با فرض‌هایی شروع کنید که برایشان شواهد دارید و هر ورودی را با اطلاعات محلی دقیق‌تر کنید. برآورد با تغییر داده‌ها به‌روز می‌شود.",
    financial: "",
    outputs: "",
    outcomes: "",
    adjustments: "",
    results: "",
  } satisfies Record<Stage, string>,
} as const;

const enCopy = {
  status: "Assessment in progress",
  updated: "Estimate based on your inputs",
  encyclopedia: "Encyclopedia",
  workspace: "Workspace",
  activeView: "Current view",
  dashboardGuide: "Dashboard guide",
  ready: "Ready",
  dataTip: "Methodology note",
  referenceGuide: "Download the SROI guide",
  decisionSupport: "Social Return on Investment (SROI) · Decision support",
  totalValue: "Estimated social value",
  valueCreated: "Based on your assumptions",
  netValue: "Net value",
  liveResult: "Live estimate",
  ratio: "Social Return on Investment (SROI)",
  valueMix: "Value breakdown",
  currentEstimate: "Current estimate",
  valueBridge: "From gross to net value",
  netEffect: "Estimate pathway",
  grossOutcomes: "Gross outcome value",
  adjustments: "Adjustments",
  adjustmentNote: "Adjustments help avoid overclaiming impact.",
  social: "Social",
  economic: "Economic",
  environmental: "Environmental",
  peopleReached: "People directly supported",
  jobsCreated: "Sustained jobs created",
  wasteRecovered: "Material recovered",
  scenario: "Scenario",
  conservative: "Conservative",
  expected: "Expected",
  optimistic: "Optimistic",
  assumptions: "Assumptions",
  finalReview: "Final review",
  readyToExport: "Ready to export",
  netSocialValue: "Net social value",
  totalInvestment: "Total investment",
  downloadPdf: "Print / save PDF report",
  screeningEstimate: "This is an initial screening estimate, not an audited valuation.",
  stages: {
    overview: "What is social impact?",
    financial: "Project resources",
    outputs: "Activities and outputs",
    outcomes: "Outcomes and value",
    adjustments: "Impact adjustments",
    results: "Assessment results",
  } satisfies Record<Stage, string>,
  guides: {
    overview: "Start with assumptions you can support with evidence. Refine each input using local data; the estimate updates as you work.",
    financial: "Enter cash spent during the assessment period. Include volunteer time only when you can document the hours and justify the rate used to value them.",
    outputs: "Count direct, verifiable results such as people supported, sustained jobs created, and material recovered. Avoid forecasts or figures you cannot substantiate.",
    outcomes: "Estimate meaningful changes in people's lives, not activity alone. Record the source for each financial proxy and use a cautious change rate when evidence is limited.",
    adjustments: "Account for change that would have happened anyway, contributions from others, displacement, and how outcomes may diminish over time.",
    results: "Read the ratio alongside its assumptions. Compare scenarios, record your evidence, and treat this as a screening estimate, not a full SROI valuation.",
  } satisfies Record<Stage, string>,
} as const;

const faFields = {
  budget: { label: "منابع مالی پروژه", help: "مجموع منابع نقدی مصرف‌شده برای همین پروژه و دورهٔ ارزیابی را وارد کنید. هزینهٔ سالانه را با کل هزینهٔ چندساله جمع نکنید. پیش‌نیاز: بودجهٔ مصوب یا اسناد مالی پروژه.", suffix: "تومان" },
  volunteerHours: { label: "ساعت کار داوطلبانه", help: "ساعت‌هایی را وارد کنید که داوطلبان واقعاً برای پروژه صرف کرده‌اند؛ این مقدار یکی از منابع پروژه است، نه تعداد افراد. پیش‌نیاز: برگهٔ ثبت ساعت، حضور و غیاب یا گزارش معتبر دورهٔ ارزیابی.", suffix: "ساعت" },
  hourlyRate: { label: "ارزش هر ساعت داوطلبی", help: "نرخ مستند برای ارزش‌گذاری زمان داوطلبان است و باید با نوع کار و محل پروژه تناسب داشته باشد. پیش‌نیاز: نرخ دستمزد مرجع محلی یا روش ارزش‌گذاری مکتوب؛ عدد دلخواه وارد نکنید.", suffix: "تومان / ساعت" },
  beneficiaries: { label: "افرادِ مستقیمِ تحت‌تأثیر", help: "تعداد افراد یکتایی که خدمت یا حمایت مستقیم گرفته‌اند؛ مراجعه‌های تکراری را دوباره نشمارید. پیش‌نیاز: فهرست ثبت‌نام یا دادهٔ اجراییِ تجمیع‌شده؛ برای فهم تجربه و تغییر آنان، با خود افراد هم مشورت کنید.", suffix: "نفر" },
  jobs: { label: "مشاغل پایدار ایجادشده", help: "تعداد شغل‌هایی که واقعاً به ایجاد یا حفظ آن‌ها کمک شده، نه فرصت‌های اعلام‌شده یا موقت. «پایدار» را برای پروژه تعریف کنید. پیش‌نیاز: سوابق اشتغال/کارفرما و در صورت امکان پیگیری وضعیت افراد.", suffix: "شغل" },
  waste: { label: "پسماند بازیابی‌شده", help: "وزن موادی را وارد کنید که واقعاً بازیابی شده یا از دفع آن‌ها جلوگیری شده است؛ نوع ماده و دورهٔ شمارش باید یکسان باشد. پیش‌نیاز: قبض باسکول، رسید بازیافت یا ثبت عملیاتی؛ از برآورد بدون مبنا بپرهیزید.", suffix: "کیلوگرم" },
  changeRate: { label: "درصد افرادِ دارای تغییر", help: "درصد افرادی را وارد کنید که تغییرِ تعریف‌شده و مهم را تجربه کرده‌اند؛ این عدد صرفاً نرخ حضور یا رضایت نیست. پیش‌نیاز: پیامد و شاخص آن را تعریف کنید و دادهٔ معتبرِ قبل و بعد یا پیگیری فراهم کنید. معمولاً لازم است از ذی‌نفعان نظرسنجی کنید؛ پرسش‌ها و زمان سنجش را ثبت کنید.", suffix: "٪" },
  socialProxy: { label: "ارزش مالی پیامد اجتماعی", help: "برآورد مالیِ مستندِ یک پیامد اجتماعی به‌ازای هر فرد است؛ این مبلغ به معنای قیمت‌گذاری انسان یا خودِ پیامد نیست. پیش‌نیاز: پیامد و واحد آن را مشخص کنید و منبع معتبر، سال و واحد پول را ثبت کنید. اگر منبعی ندارید، عدد نسازید و پیامد را به‌صورت غیرپولی گزارش کنید.", suffix: "تومان / نفر" },
  environmentalProxy: { label: "ارزش مالی هر کیلوگرم پسماند", help: "برآورد مالیِ مستند برای اثر زیست‌محیطی همان نوع ماده است. ارزش چند پیامد را بدون تفکیک با هم جمع نکنید. پیش‌نیاز: نوع ماده، روش محاسبه و منبع معتبری مانند تعرفهٔ رسمی یا پژوهش را مشخص کنید. اگر منبعی ندارید، عدد نسازید.", suffix: "تومان / کیلوگرم" },
  economicProxy: { label: "ارزش مالی هر شغل", help: "برآورد مالیِ مستند برای پیامد اشتغال است؛ آن را با حقوق سالانهٔ فرد یکی نگیرید، مگر اینکه روش محاسبه چنین چیزی را توجیه کند. پیش‌نیاز: تعریف شغل پایدار، مدت اثر، واحد محاسبه و منبع معتبر را مشخص کنید. از دوباره‌شماری درآمد و منافعی که همان درآمد را بازتاب می‌دهند بپرهیزید.", suffix: "تومان / شغل" },
  deadweight: { label: "تغییری که بدون پروژه رخ می‌داد", help: "درصدِ تغییری را وارد کنید که احتمالاً بدون مداخلهٔ شما نیز رخ می‌داد؛ هرچه این سهم بیشتر باشد، سهم قابل‌انتساب به پروژه کمتر است. پیش‌نیاز: خط پایه، گروه مقایسه یا پرسش از ذی‌نفعان دربارهٔ وضعیتِ بدون پروژه؛ معمولاً نظرسنجی یا مصاحبهٔ پیگیری لازم است.", suffix: "٪" },
  attribution: { label: "سهم سایر عوامل و سازمان‌ها", help: "درصد تغییری است که به همکاری نهادهای دیگر یا عوامل بیرونی مربوط می‌شود. پیش‌نیاز: گفت‌وگو با ذی‌نفعان و شرکا، بررسی خدمات هم‌زمان و ثبت منطق تقسیم سهم؛ نظرسنجی داخلی به‌تنهایی کافی نیست مگر روش آن روشن باشد.", suffix: "٪" },
  displacement: { label: "جابه‌جایی یا انتقال اثر", help: "درصد منفعتی است که با زیان یا کاهش منفعت در جای دیگری همراه شده است؛ نبودِ داده به معنی صفر بودن آن نیست. پیش‌نیاز: شواهد بازار/خدمت یا پرسش از افراد و گروه‌های متأثر. اگر جابه‌جایی رخ نداده یا داده‌ای ندارید، دلیل و سطح اطمینان را بیرون از این فرم ثبت کنید.", suffix: "٪" },
  dropoff: { label: "کاهش سالانهٔ اثر", help: "درصد کاهش شدت پیامد در هر سال پس از سال اول است و با مدت ماندگاری اثر تفاوت دارد. پیش‌نیاز: دادهٔ پیگیری در چند مقطع، نظرسنجی تکرارشونده یا مطالعهٔ معتبر. نسخهٔ فعلی مدت اثر و تنزیل را نمی‌سنجد و این نرخ را فقط به‌صورت تعدیلی ساده اعمال می‌کند.", suffix: "٪" },
} satisfies Record<keyof Form, { label: string; help: string; suffix: string }>;

const enFields = {
  budget: { label: "Project budget or investment", help: "Enter the cash spent on this project during the assessment period. Do not add an annual budget to a multi-year total. Use approved budgets or project financial records.", suffix: "USD" },
  volunteerHours: { label: "Volunteer hours", help: "Enter the hours volunteers actually contributed during the assessment period. This is a project resource, not a headcount. Use timesheets, attendance logs, or another reliable record.", suffix: "hours" },
  hourlyRate: { label: "Value per volunteer hour", help: "Use a documented rate that reflects the work and local context. Record the local wage benchmark or written valuation method; do not choose an arbitrary figure.", suffix: "USD / hour" },
  beneficiaries: { label: "People directly supported", help: "Count unique people who received direct support; do not count repeat visits as additional people. Use deduplicated service records and consult participants about the changes they experienced.", suffix: "people" },
  jobs: { label: "Sustained jobs created", help: "Count jobs the project helped create or retain, not temporary roles or announced opportunities. Define what sustained means and support the count with employer records or follow-up data.", suffix: "jobs" },
  waste: { label: "Material recovered", help: "Enter the weight actually recovered or diverted from disposal. Keep material type and measurement period consistent, and use weighbridge tickets, recycling receipts, or operational records.", suffix: "kg" },
  changeRate: { label: "Rate of meaningful change", help: "Estimate the share of people who experienced a defined, meaningful outcome; this is not an attendance or satisfaction rate. Define the outcome and indicator, then use credible baseline, follow-up, or participant survey data.", suffix: "%" },
  socialProxy: { label: "Financial proxy per person", help: "Use an evidenced estimate of the financial value of a social outcome for each person. This does not put a price on a person. Record the outcome, source, year, and currency; if no credible source exists, report it without a monetary value.", suffix: "USD / person" },
  environmentalProxy: { label: "Environmental value per kg", help: "Use a documented estimate for the environmental effect of the same material type. Do not combine different outcomes without separating them. Record the material, method, and credible source; do not invent a value.", suffix: "USD / kg" },
  economicProxy: { label: "Economic value per job", help: "Use a documented estimate of the employment outcome; do not treat it as the person's annual salary unless your method supports that. Define job duration, unit, and source, and avoid counting the same income benefit twice.", suffix: "USD / job" },
  deadweight: { label: "Deadweight: change that would happen anyway", help: "Estimate the share of change likely to occur without the project. A higher deadweight means less change can be attributed to the intervention. Use baseline or comparison data, or ask participants about the counterfactual.", suffix: "%" },
  attribution: { label: "Attribution to other factors", help: "Estimate the share of change caused by other organisations or external factors. Discuss contributions with participants and partners, review concurrent services, and document how you divided the contribution.", suffix: "%" },
  displacement: { label: "Displacement", help: "Estimate the share of benefit accompanied by a loss or reduced benefit elsewhere. Missing data does not mean displacement is zero. Review relevant markets or services and consult affected people or groups.", suffix: "%" },
  dropoff: { label: "Annual drop-off in outcomes", help: "Estimate how much the outcome's intensity declines in each year after the first. This is different from how long an outcome lasts. Use repeated follow-up data or credible research; this version applies only a simple adjustment.", suffix: "%" },
} satisfies Record<keyof Form, { label: string; help: string; suffix: string }>;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

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

  a.rail-item {
    font: inherit;
    text-decoration: none;
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

  .rail-tip p {
    margin: 0;
    font-size: 11px;
    line-height: 1.65;
  }

  .rail-tip a {
    color: inherit;
    text-underline-offset: 2px;
  }

  .rail-tip-disclosure {
    display: block;
  }

  .er-console.is-persian .rail-tip-section {
    margin-top: 8px;
    padding: 0 10px;
    color: var(--text-secondary);
  }

  .er-console.is-persian .rail-tip-disclosure {
    position: relative;
    margin: 8px 0 0;
    padding: 0;
    border: 0;
  }

  .rail-tip-disclosure > .rail-tip-summary .rail-tip-summary-copy > strong {
    color: #e65100;
    font-size: 15px;
    letter-spacing: 0;
    text-transform: none;
  }

  .rail-tip-summary {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;
    list-style: none;
  }

  .rail-tip-summary::-webkit-details-marker {
    display: none;
  }

  .rail-tip-summary-copy {
    flex: 1;
    min-width: 0;
  }

  .rail-tip-preview {
    display: -webkit-box;
    overflow: hidden;
    color: inherit;
    font-size: 11px;
    line-height: 1.5;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .rail-tip-chevron {
    flex: 0 0 auto;
    margin-top: 2px;
    transition: transform 160ms ease;
  }

  .rail-tip-disclosure[open] .rail-tip-chevron {
    transform: rotate(180deg);
  }

  .er-console.is-persian .rail-tip-content {
    position: absolute;
    z-index: 5;
    top: auto;
    bottom: 0;
    right: calc(100% + 12px);
    width: min(560px, calc(100vw - 340px));
    max-height: min(70vh, 520px);
    margin: 0;
    padding: 16px 18px;
    overflow: auto;
    border: 1px solid #dfe7e0;
    border-radius: 14px;
    color: #53635d;
    background: #fff;
    box-shadow: 0 12px 32px rgba(35, 56, 44, .16);
  }

  .rail-tip-download {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 0;
    padding: 8px 10px;
    border: 1px solid rgba(67, 131, 106, .24);
    border-radius: 9px;
    color: inherit;
    background: rgba(67, 131, 106, .06);
    font-size: 11px;
    font-weight: 600;
    text-decoration: none;
  }

  .rail-tip-download:hover {
    background: rgba(67, 131, 106, .12);
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
    return `${formatted}${scale ? ` ${scale.label}` : ""} تومان`;
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
  return enCopy.stages[stage];
}

function stageGuide(stage: Stage, locale: Locale = "en") {
  if (locale === "fa") return faCopy.guides[stage];
  return enCopy.guides[stage];
}

function PersianMethodology() {
  return (
    <section className="methodology-overview" aria-labelledby="methodology-title">
      <header className="methodology-intro">
        <span className="methodology-kicker">بر پایهٔ روش نرخ بازگشت اجتماعی سرمایه‌گذاری (SROI)</span>
        <h2 id="methodology-title">اثر اجتماعی چیست؟</h2>
        <p>
          ارزیابی اثر اجتماعی، روشی برای شناخت و سنجش تغییراتی است که یک پروژه در زندگی افراد و محیط ایجاد می‌کند. شاخص‌ها و استانداردهای سنجش، بسته به نوع پروژه و منابع به‌کاررفته متفاوت‌اند. یکی از روش‌های رایج، نرخ بازگشت اجتماعی سرمایه‌گذاری (SROI) است. این روش، شواهد و برآوردهای مالیِ قابل‌دفاع را در کنار منابع مصرف‌شده بررسی می‌کند تا ارزش اجتماعی ایجادشده را برآورد کند.
        </p>
      </header>

      <div className="methodology-concepts">
        <article><span>۱ · منابع پروژه</span><h3>پروژه از چه منابعی استفاده کرده است؟</h3><p>منابع پروژه شامل بودجه و زمانِ صرف‌شده از سوی کارکنان و داوطلبان است.</p></article>
        <article><span>۲ · فعالیت و خروجی پروژه</span><h3>پروژه چه فعالیت‌هایی انجام داده و چه خروجی‌هایی داشته است؟</h3><p>فعالیت‌ها می‌توانند آموزشی، تولیدی، فرهنگی یا دیجیتال باشند. خروجی‌ها نیز نتایج مستقیم و قابل‌شمارشی مانند مشارکت ۲۰۰ نفر یا تولید محصول‌اند.</p></article>
        <article><span>۳ · پیامدهای پروژه</span><h3>پروژه چه تغییرات مثبت یا منفی‌ای در زندگی افراد ایجاد کرده است؟</h3><p>برای نمونه، افزایش مهارت یا رضایت شغلی می‌تواند پیامد مثبت باشد؛ کاهش نیرو پس از پایان پروژه نیز ممکن است پیامدی منفی باشد.</p></article>
        <article><span>۴ · اثر واقعی پروژه</span><h3>چه میزان از تغییرات را می‌توان به پروژه نسبت داد؟</h3><p>همهٔ تغییرات مشاهده‌شده لزوماً حاصل پروژه نیستند. با بررسی سهم عوامل دیگر و پالایش برآورد، اثر واقعی پروژه را مشخص کنید.</p></article>
      </div>

      <div className="methodology-preparation">
        <div>
          <span className="methodology-kicker">پیش‌نیازها</span>
          <h3>برای استفاده از داشبورد، چه داده‌هایی باید آماده کنید؟</h3>
          <ul>
            <li><b>منابع و خروجی‌های پروژه:</b> بودجه، فهرست کارکنان، سوابق اشتغال و در صورت ارتباط، اسناد وزن‌کشی پسماند را آماده کنید.</li>
            <li><b>تعریف تغییر واقعی:</b> پیامدهای موردنظر را مشخص کنید و با نظرسنجی یا مصاحبه از ذی‌نفعان، نوع و میزان تغییر را بسنجید.</li>
            <li><b>اسناد مالی:</b> اسناد منابع مالی مصرف‌شده در کل دورهٔ اجرای پروژه را در اختیار داشته باشید.</li>
          </ul>
        </div>
        <aside>
          <strong>این داشبورد چقدر قابل اعتماد است؟</strong>
          <p>
            این داشبورد بر اساس فایل راهنمای محاسبهٔ نرخ بازگشت سرمایه‌گذاری منتشر شده است. این سند مورد تأیید{" "}
            <a href="https://andeglobal.org/writer/the-sroi-network/" target="_blank" rel="noopener noreferrer">
              شبکهٔ جهانی بازگشت اجتماعی سرمایه‌گذاری
            </a>
            ، دفتر کابینهٔ بریتانیا، بنیاد اقتصاد نو در بریتانیا و کنسرسیوم‌های پژوهشی است و در وب‌سایت شبکهٔ جهانی SROI، تحت حمایت برنامهٔ توسعهٔ سازمان ملل متحد (UNDP)، منتشر شده است. این چارچوب امروزه از سوی سازمان‌های بین‌المللی، بخش‌های دولتی، سرمایه‌گذاران اجتماعی، مؤسسات خیریه و شرکت‌های خصوصی در سراسر جهان، به‌عنوان استانداردی جامع برای سنجش ارزش اجتماعی، محیط‌زیستی و اقتصادی پذیرفته شده است.
          </p>
        </aside>
      </div>

      <div className="methodology-formula">
        <h3>نرخ بازگشت اجتماعی سرمایه‌گذاری (SROI) چیست؟</h3>
        <p>SROI یا <b>Social Return on Investment</b> روشی برای مقایسهٔ ارزش اجتماعی ایجادشده با منابع مصرف‌شده در یک پروژه است. ابتدا مشخص می‌شود پروژه چه کسانی را تحت‌تأثیر قرار داده و چه تغییراتی ایجاد کرده است؛ سپس این تغییرات با داده‌ها و شواهد سنجیده و در صورت امکان، با استفاده از <b>معادل مالی</b> به ارزش پولی تقریبی تبدیل می‌شوند. در ادامه، سهم عواملی که مستقل از پروژه‌اند، مانند تغییراتی که بدون اجرای پروژه نیز رخ می‌داد و سهم سایر عوامل، از برآورد کسر می‌شود. در محاسبهٔ کامل SROI، ارزش فعلی منافع اجتماعی با ارزش فعلی سرمایه‌گذاری مقایسه می‌شود.</p>
        <p>برای نمونه، نسبت <bdi dir="ltr"><b>3:1</b></bdi> یعنی در برابر هر ۱ واحد سرمایه‌گذاری، حدود ۳ واحد ارزش اجتماعی برآورد شده است. SROI فقط یک نسبت مالی نیست، بلکه <b>فرایندی نظام‌مند برای شناخت، سنجش، ارزش‌گذاری و گزارش اثر اجتماعی</b> است.</p>
        <p>برای مطالعهٔ بیشتر دربارهٔ SROI، این پژوهش ۲۸۴ مقالهٔ تخصصی در این حوزه را بررسی می‌کند: <a href="https://www.sciencedirect.com/org/science/article/pii/S2049372X22000107?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer">خواندن پژوهش</a></p>
        <p className="sroi-formula-label">فرمول استاندارد نسبت بازگشت اجتماعی سرمایه‌گذاری</p>
        <div className="sroi-equation" dir="ltr" aria-label="SROI equals present value of social outcomes divided by present value of investment">
          <span>SROI</span><span>=</span>
          <span className="sroi-fraction"><span>PV (Social Outcomes)</span><span>PV (Investment)</span></span>
        </div>
        <p className="sroi-formula-label">بیان فارسی فرمول</p>
        <div className="sroi-equation sroi-equation-fa" dir="rtl" aria-label="نرخ بازگشت اجتماعی سرمایه‌گذاری برابر است با ارزش فعلی پیامدهای اجتماعی تقسیم بر ارزش فعلی سرمایه‌گذاری">
          <span>نرخ بازگشت اجتماعی سرمایه‌گذاری</span><span>=</span>
          <span className="sroi-fraction"><span>ارزش فعلی پیامدهای اجتماعی</span><span>ارزش فعلی سرمایه‌گذاری</span></span>
        </div>
        <p className="sroi-formula-label">محاسبهٔ ارزش فعلی پیامدها</p>
        <div className="sroi-equation sroi-equation-detail" dir="ltr">
          <span>Gross Outcome Value<sub>i,t</sub> = Quantity<sub>i,t</sub> × Financial Proxy<sub>i</sub></span>
          <span>Adjusted Outcome Value<sub>i,t</sub> = Gross Outcome Value<sub>i,t</sub> × (1 − Deadweight<sub>i</sub>) × (1 − Attribution<sub>i</sub>) × (1 − Displacement<sub>i</sub>) × Drop-off Factor<sub>i,t</sub></span>
          <span>Drop-off Factor<sub>i,t</sub> = ∏<sub>k=1</sub><sup>t</sup> (1 − Drop-off Rate<sub>i,k</sub>)</span>
          <span>PV (Social Outcomes) = ∑<sub>i=1</sub><sup>n</sup> ∑<sub>t=0</sub><sup>T</sup> Adjusted Outcome Value<sub>i,t</sub> / (1 + r)<sup>t</sup></span>
          <span>PV (Investment) = ∑<sub>t=0</sub><sup>T</sup> Investment<sub>t</sub> / (1 + r)<sup>t</sup></span>
        </div>
        <p className="sroi-implementation-note">این فرمول، چارچوب روش‌شناختی SROI را نشان می‌دهد. محاسبهٔ فعلی داشبورد تنزیل و ارزش فعلی چندساله را اعمال نمی‌کند؛ بنابراین نسبت نمایش‌داده‌شده را نباید محاسبهٔ کامل ارزش فعلی SROI تلقی کرد.</p>
      </div>

    </section>
  );
}

function EnglishMethodology() {
  return (
    <section className="methodology-overview" aria-labelledby="methodology-title">
      <header className="methodology-intro">
        <span className="methodology-kicker">A practical introduction to Social Return on Investment (SROI)</span>
        <h2 id="methodology-title">What is social impact assessment?</h2>
        <p>
          Social impact assessment helps identify and understand the changes a project creates in people&apos;s lives and in the environment. The indicators and methods used depend on the project and the resources involved. Social Return on Investment (SROI) is one approach: it brings evidence about outcomes together with defensible financial estimates to compare the value created with the resources invested.
        </p>
      </header>

      <div className="methodology-concepts">
        <article><span>01 · Project resources</span><h3>What resources did the project use?</h3><p>Resources include the project budget and the time contributed by paid staff and volunteers.</p></article>
        <article><span>02 · Activities and outputs</span><h3>What did the project do, and what did it deliver?</h3><p>Activities may be educational, productive, cultural, or digital. Outputs are direct, countable results, such as people taking part or products made.</p></article>
        <article><span>03 · Outcomes</span><h3>What changed for the people involved?</h3><p>Outcomes are positive or negative changes in people&apos;s lives. For example, skills or job satisfaction may improve, while a project ending may lead to jobs being lost.</p></article>
        <article><span>04 · Impact</span><h3>How much of that change can be linked to the project?</h3><p>Not every observed change results from the project. Consider what would have happened anyway and the contribution of other organisations before estimating impact.</p></article>
      </div>

      <div className="methodology-preparation">
        <div>
          <span className="methodology-kicker">Before you begin</span>
          <h3>What information should you prepare?</h3>
          <ul>
            <li><b>Resources and outputs:</b> Gather budgets, staff records, employment data, and waste-weighing records where relevant.</li>
            <li><b>Evidence of change:</b> Define the outcomes you want to assess, then use surveys or interviews to understand the type and extent of change experienced by participants.</li>
            <li><b>Financial records:</b> Keep records of the resources used across the full project period.</li>
          </ul>
        </div>
        <aside>
          <strong>How should I interpret this dashboard?</strong>
          <p>
            This dashboard is informed by published SROI guidance, including work associated with the{" "}
            <a href="https://andeglobal.org/writer/the-sroi-network/" target="_blank" rel="noopener noreferrer">
              SROI Network
            </a>
            , the UK Cabinet Office, the New Economics Foundation, and research consortia. The guidance is published through the global SROI community, with support from the United Nations Development Programme (UNDP). Use local evidence and professional judgement when applying the method.
          </p>
        </aside>
      </div>

      <div className="methodology-formula">
        <h3>What does the SROI ratio mean?</h3>
        <p>
          SROI compares the social value created with the resources used by a project. It starts by identifying who experienced change and what changed for them. Evidence is then used to assess those outcomes and, where appropriate, a <b>financial proxy</b> is used to estimate their monetary value. The estimate is adjusted for factors such as change that would have happened anyway and the contribution of others. A full SROI analysis compares the present value of social outcomes with the present value of investment.
        </p>
        <p>
          For example, a ratio of <bdi dir="ltr"><b>3:1</b></bdi> means that each unit invested is associated with an estimated three units of social value. SROI is not just a financial ratio; it is a structured process for understanding, measuring, valuing, and reporting social impact.
        </p>
        <p>
          For further reading, see this review of 284 academic papers on SROI: {" "}
          <a href="https://www.sciencedirect.com/org/science/article/pii/S2049372X22000107?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer">
            Read the research
          </a>
        </p>
        <p className="sroi-formula-label">Standard SROI ratio</p>
        <div className="sroi-equation" dir="ltr" aria-label="SROI equals present value of social outcomes divided by present value of investment">
          <span>SROI</span><span>=</span>
          <span className="sroi-fraction"><span>PV (Social Outcomes)</span><span>PV (Investment)</span></span>
        </div>
        <p className="sroi-formula-label">Outcome valuation and adjustments</p>
        <div className="sroi-equation sroi-equation-detail" dir="ltr">
          <span>Gross Outcome Value<sub>i,t</sub> = Quantity<sub>i,t</sub> × Financial Proxy<sub>i</sub></span>
          <span>Adjusted Outcome Value<sub>i,t</sub> = Gross Outcome Value<sub>i,t</sub> × (1 − Deadweight<sub>i</sub>) × (1 − Attribution<sub>i</sub>) × (1 − Displacement<sub>i</sub>) × Drop-off Factor<sub>i,t</sub></span>
          <span>Drop-off Factor<sub>i,t</sub> = ∏<sub>k=1</sub><sup>t</sup> (1 − Drop-off Rate<sub>i,k</sub>)</span>
          <span>PV (Social Outcomes) = ∑<sub>i=1</sub><sup>n</sup> ∑<sub>t=0</sub><sup>T</sup> Adjusted Outcome Value<sub>i,t</sub> / (1 + r)<sup>t</sup></span>
          <span>PV (Investment) = ∑<sub>t=0</sub><sup>T</sup> Investment<sub>t</sub> / (1 + r)<sup>t</sup></span>
        </div>
        <p className="sroi-implementation-note">These equations describe the broader SROI framework. This calculator does not discount future outcomes or calculate multi-year present values, so its ratio is a screening estimate rather than a complete SROI valuation.</p>
      </div>
    </section>
  );
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
          <span>{fa ? faCopy.valueMix : enCopy.valueMix}</span>
          <small>{fa ? faCopy.currentEstimate : enCopy.currentEstimate}</small>
        </div>
        <div className="value-layout">
          <div className="donut" style={{ background: ring(result) }}>
            <div className="center">
              <strong>{money(result.total, true, locale)}</strong>
              <span>{fa ? faCopy.netValue : enCopy.netValue}</span>
            </div>
          </div>
          <div className="bar-list">
            <div className="bar-item">
              <div className="bar-item-header">
                <span className="bar-item-label"><span className="dot social" />{fa ? faCopy.social : enCopy.social}</span>
                <b>{formatNumber(Math.round(socialShare), locale)}{fa ? "٪" : "%"}</b>
              </div>
              <div className="bar-track"><span className="bar-fill social" style={{ width: `${socialShare}%` }} /></div>
              <div className="bar-item-header">
                <span style={{ color: "var(--text-muted)" }}>{money(result.values.social, true, locale)}</span>
              </div>
            </div>
            <div className="bar-item">
              <div className="bar-item-header">
                <span className="bar-item-label"><span className="dot economic" />{fa ? faCopy.economic : enCopy.economic}</span>
                <b>{formatNumber(Math.round(economicShare), locale)}{fa ? "٪" : "%"}</b>
              </div>
              <div className="bar-track"><span className="bar-fill economic" style={{ width: `${economicShare}%` }} /></div>
              <div className="bar-item-header">
                <span style={{ color: "var(--text-muted)" }}>{money(result.values.economic, true, locale)}</span>
              </div>
            </div>
            <div className="bar-item">
              <div className="bar-item-header">
                <span className="bar-item-label"><span className="dot environmental" />{fa ? faCopy.environmental : enCopy.environmental}</span>
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
          <span>{fa ? faCopy.valueBridge : enCopy.valueBridge}</span>
          <small>{fa ? faCopy.netEffect : enCopy.netEffect}</small>
        </div>
        <div className="bridge-rows">
          {[
            { label: fa ? faCopy.grossOutcomes : enCopy.grossOutcomes, value: gross, color: "social" },
            { label: fa ? faCopy.adjustments : enCopy.adjustments, value: gross - result.total, color: "coral" },
            { label: fa ? faCopy.netValue : enCopy.netValue, value: result.total, color: "economic" },
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
        <div className="bridge-note">{fa ? faCopy.adjustmentNote : enCopy.adjustmentNote}</div>
      </section>

      <section className="panel glass metric-strip">
        <div className="metric-strip-inner">
          <div className="metric-pill">
            <div className="metric-icon social"><Users size={14} /></div>
            <div>
              <strong>{formatNumber(form.beneficiaries, locale)}</strong>
              <small>{fa ? faCopy.peopleReached : enCopy.peopleReached}</small>
            </div>
          </div>
          <div className="metric-pill">
            <div className="metric-icon economic"><BriefcaseBusiness size={14} /></div>
            <div>
              <strong>{formatNumber(form.jobs, locale)}</strong>
              <small>{fa ? faCopy.jobsCreated : enCopy.jobsCreated}</small>
            </div>
          </div>
          <div className="metric-pill">
            <div className="metric-icon environmental"><Recycle size={14} /></div>
            <div>
              <strong>{`${formatNumber(form.waste, locale)} ${fa ? "کیلوگرم" : "kg"}`}</strong>
              <small>{fa ? faCopy.wasteRecovered : enCopy.wasteRecovered}</small>
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
              <small>{fa ? faCopy.peopleReached : enCopy.peopleReached}</small>
            </div>
          </div>
          <div className="snapshot-item">
            <div className="metric-icon economic"><BriefcaseBusiness size={14} /></div>
            <div className="meta">
              <strong>{formatNumber(form.jobs, locale)}</strong>
              <small>{fa ? faCopy.jobsCreated : enCopy.jobsCreated}</small>
            </div>
          </div>
          <div className="snapshot-item">
            <div className="metric-icon environmental"><Recycle size={14} /></div>
            <div className="meta">
              <strong>{`${formatNumber(form.waste, locale)} ${fa ? "کیلوگرم" : "kg"}`}</strong>
              <small>{fa ? faCopy.wasteRecovered : enCopy.wasteRecovered}</small>
            </div>
          </div>
          {fa ? (
            <p className="estimate-integrity-note">این برآورد فقط به اندازهٔ کیفیت ورودی‌ها و منابعِ پشت آن قابل اتکاست؛ سناریوی خوش‌بینانه یا دادهٔ ساختگی به‌عنوان نتیجه نمایش داده نمی‌شود.</p>
          ) : (
            <div className="scenario-box">
              <span className="label">{enCopy.scenario}</span>
              <span className="scenario-pill">{enCopy.conservative} {formatNumber(scenario(form, "low"), locale, 2)}</span>
              <span className="scenario-pill primary">{enCopy.expected} {formatNumber(result.ratio, locale, 2)}</span>
              <span className="scenario-pill">{enCopy.optimistic} {formatNumber(scenario(form, "high"), locale, 2)}</span>
            </div>
          )}
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
    : fields.map((field) => ({ ...field, ...enFields[field.key], prefix: undefined }));
  const guide = stageGuide(stage, locale);

  return (
    <div className="input-stage">
      <div className="panel glass input-panel">
      <div className="panel-head">
        <span>{stageTitle(stage, locale)}</span>
        <small>{locale === "fa" ? faCopy.assumptions : enCopy.assumptions}</small>
      </div>
      <div className="input-grid">
        {displayedFields.map((field) => (
          <div key={field.key} className="field">
            <label htmlFor={`impact-${field.key}`}>{field.label}</label>
            <div className="help" id={`impact-help-${field.key}`}>{field.help}</div>
            <div className="control">
              {field.prefix && <span>{field.prefix}</span>}
              <input
                id={`impact-${field.key}`}
                type={locale === "fa" ? "text" : "number"}
                inputMode="numeric"
                dir={locale === "fa" ? "ltr" : undefined}
                value={locale === "fa" ? formatNumber(form[field.key], locale) : form[field.key]}
                aria-describedby={`impact-help-${field.key}`}
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
      {guide && <p className="stage-guide">{guide}</p>}
    </div>
  );
}

function Results({ result, exportPdf, locale }: { result: Result; exportPdf: () => void; locale: Locale }) {
  const fa = locale === "fa";
  return (
    <div className="result-stage">
      <div className="panel glass results-panel">
      <div className="panel-head">
        <span>{fa ? faCopy.stages.results : enCopy.finalReview}</span>
        <small>{fa ? faCopy.readyToExport : enCopy.readyToExport}</small>
      </div>
      <div className="result-summary">
        <div className="result-card"><span>{fa ? faCopy.netSocialValue : "Net social value"}</span><strong>{money(result.total, false, locale)}</strong></div>
        <div className="result-card"><span>{fa ? faCopy.totalInvestment : "Total investment"}</span><strong>{money(result.investment, false, locale)}</strong></div>
        <div className="result-card"><span>{fa ? "نسبت SROI" : "SROI ratio"}</span><strong>{formatNumber(result.ratio, locale, 2)} : 1</strong></div>
      </div>
      <button className="download-btn" type="button" onClick={exportPdf}><Download size={14} /> {fa ? faCopy.downloadPdf : enCopy.downloadPdf}</button>
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
    ["نسبت بازگشت اجتماعی سرمایه‌گذاری (SROI)", `${formatNumber(result.ratio, "fa", 2)} : 1`],
    ["ارزش خالص اجتماعی", money(result.total, false, "fa")],
    ["کل سرمایه‌گذاری", money(result.investment, false, "fa")],
    ["ارزش اجتماعی", money(result.values.social, false, "fa")],
    ["ارزش اقتصادی", money(result.values.economic, false, "fa")],
    ["ارزش زیست‌محیطی", money(result.values.environmental, false, "fa")],
  ];
  const assumptions = [
    ["منابع مالی پروژه", money(form.budget, false, "fa")],
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

function printEnglishReport(form: Form, result: Result) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
  const results: [string, string][] = [
    ["SROI ratio", `${formatNumber(result.ratio, "en", 2)} : 1`],
    ["Net social value", money(result.total, false, "en")],
    ["Total investment", money(result.investment, false, "en")],
    ["Social value", money(result.values.social, false, "en")],
    ["Economic value", money(result.values.economic, false, "en")],
    ["Environmental value", money(result.values.environmental, false, "en")],
  ];
  const assumptions: [string, string][] = [
    [enFields.budget.label, money(form.budget, false, "en")],
    [enFields.volunteerHours.label, `${formatNumber(form.volunteerHours, "en")} hours`],
    [enFields.hourlyRate.label, money(form.hourlyRate, false, "en")],
    [enFields.beneficiaries.label, formatNumber(form.beneficiaries, "en")],
    [enFields.jobs.label, formatNumber(form.jobs, "en")],
    [enFields.waste.label, `${formatNumber(form.waste, "en")} kg`],
    [enFields.changeRate.label, `${formatNumber(form.changeRate, "en")}%`],
    [enFields.socialProxy.label, money(form.socialProxy, false, "en")],
    [enFields.environmentalProxy.label, money(form.environmentalProxy, false, "en")],
    [enFields.economicProxy.label, money(form.economicProxy, false, "en")],
    [enFields.deadweight.label, `${formatNumber(form.deadweight, "en")}%`],
    [enFields.attribution.label, `${formatNumber(form.attribution, "en")}%`],
    [enFields.displacement.label, `${formatNumber(form.displacement, "en")}%`],
    [enFields.dropoff.label, `${formatNumber(form.dropoff, "en")}%`],
  ];
  const tableRows = (items: [string, string][]) => items
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
    .join("");

  printWindow.document.write(`<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><title>Social Impact Assessment Report</title><style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box}body{margin:0;padding:36px;color:#26332f;font-family:'DM Sans',Arial,sans-serif;line-height:1.65}main{max-width:820px;margin:auto}h1{margin:0 0 6px;font-size:28px}p{margin:0 0 20px;color:#53635d}h2{margin:28px 0 8px;font-size:17px}table{width:100%;border-collapse:collapse}th,td{padding:9px 12px;border-bottom:1px solid #dce5de;text-align:left}th{font-weight:500}td{font-weight:700}.equation{padding:12px 14px;border:1px solid #dce5de;border-radius:8px;background:#f5f8f5}.notice{margin-top:24px;padding:12px 14px;border-left:3px solid #43836a;background:#f1f7f1;color:#52666d;font-size:13px}@media print{body{padding:0}main{max-width:none}h2{break-after:avoid}tr{break-inside:avoid}}
    </style></head><body><main><h1>Social Impact Assessment Report</h1><p>Estimate based on the assumptions entered in the Social Impact Assessment workspace.</p><h2>Assessment summary</h2><table><tbody>${tableRows(results)}</tbody></table><h2>Calculation assumptions</h2><table><tbody>${tableRows(assumptions)}</tbody></table><h2>Method and limitations</h2><p class="equation">SROI = Present value of social outcomes ÷ Present value of investment</p><div class="notice">This is a screening estimate, not an audited valuation. This calculator does not discount future outcomes or calculate multi-year present values. Review every input and its evidence before using the result to make decisions.</div></main></body></html>`);
  printWindow.document.close();
  void printWindow.document.fonts.ready.then(() => {
    printWindow.focus();
    printWindow.print();
  });
}

export default function ImpactConsoleDashboard({ locale = "en" }: { locale?: Locale }) {
  const fa = locale === "fa";
  const [stage, setStage] = useState<Stage>("overview");
  const [form, setForm] = useState<Form>(initial);
  const [railOpen, setRailOpen] = useState(false);
  const result = useMemo(() => calculate(form), [form]);
  const localizedStages = stages.map((item) => ({ ...item, label: fa ? faCopy.stages[item.id] : enCopy.stages[item.id] }));

  const update = (key: keyof Form, value: string) => {
    const parsed = Math.max(0, number(value));
    const bounded = ["changeRate", "deadweight", "attribution", "displacement", "dropoff"].includes(key)
      ? Math.min(100, parsed)
      : parsed;
    setForm((current) => ({ ...current, [key]: bounded }));
  };

  const exportPdf = () => {
    if (fa) {
      printPersianReport(form, result);
      return;
    }
    printEnglishReport(form, result);
  };

  const currentStage = localizedStages.find((item) => item.id === stage)!;

  return (
    <main className={`er-console${fa ? " is-persian" : " is-english"}`} lang={locale} dir={fa ? "rtl" : "ltr"}>
      <style>{styles + fidelityStyles + (fa ? persianStyles + lightPersianStyles : englishStyles)}</style>
      <div className="er-overlay" />
      <div className="er-shell">
        <header className="er-topbar">
          <button className="er-icon-btn" type="button" aria-label={fa ? "باز کردن منو" : "Open menu"} onClick={() => setRailOpen((open) => !open)} style={{ display: "none" }}>
            <Menu size={16} />
          </button>
          <Link href={fa ? "/fa" : "/en"} className="er-brand" aria-label="SSE Impact Lab">
            <Image src={fa ? "/homepage/persian-logo-2.png" : "/homepage/logo-2.png"} alt={fa ? "دانشنامه اقتصاد اجتماعی و همبستگی" : "SSE Knowledge Platform"} width={160} height={28} priority />
          </Link>

          <div className="er-status">
            <span className="dot" />
            <span>{fa ? faCopy.status : enCopy.status}</span>
            <span className="divider">•</span>
            <span>{fa ? faCopy.updated : enCopy.updated}</span>
          </div>

          <div className="er-topbar-actions">
            <button className="er-icon-btn" type="button" aria-label={fa ? "ذخیره" : "Save"}>
              <Save size={15} />
            </button>
            <Link href={fa ? "/fa" : "/en"} aria-label={fa ? "بازگشت به دانشنامه" : "Back to encyclopedia"}>
              {fa ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
              <span>{fa ? faCopy.encyclopedia : enCopy.encyclopedia}</span>
            </Link>
          </div>
        </header>

        <div className="er-body">
          <aside className={`er-rail ${railOpen ? "open" : ""}`}>
            <div className="er-rail-head">
              <span>{fa ? faCopy.workspace : enCopy.workspace}</span>
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
                    <small>{stage === id ? (fa ? id === "overview" ? faCopy.dashboardGuide : faCopy.activeView : id === "overview" ? enCopy.dashboardGuide : enCopy.activeView) : (fa ? faCopy.ready : enCopy.ready)}</small>
                  </span>
                  <span className="state-mark"><Check size={13} /></span>
                </button>
              ))}
            </nav>
            {fa ? (
              <div className="rail-tip-section">
                <a
                  className="rail-tip-download"
                  href="https://www.socialvalueint.org/s/The-SROI-Guide-2012.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText size={15} aria-hidden="true" />
                  <span>{faCopy.referenceGuide}</span>
                </a>
                <details className="rail-tip rail-tip-disclosure">
                  <summary className="rail-tip-summary">
                    <CircleHelp size={14} />
                    <span className="rail-tip-summary-copy">
                      <strong>{faCopy.dataTip}</strong>
                      <span className="rail-tip-preview">این داشبورد بر پایهٔ راهنمای محاسبهٔ نرخ بازگشت سرمایه‌گذاری تهیه شده است.</span>
                    </span>
                    <ChevronDown className="rail-tip-chevron" size={14} aria-hidden="true" />
                  </summary>
                  <div className="rail-tip-content">
                    <p>
                      این داشبورد بر اساس فایل راهنمای محاسبهٔ نرخ بازگشت سرمایه‌گذاری منتشر شده است. این سند مورد تأیید شبکهٔ جهانی بازگشت اجتماعی سرمایه‌گذاری، دفتر کابینهٔ بریتانیا، بنیاد اقتصاد نو در بریتانیا و کنسرسیوم‌های پژوهشی است و در وب‌سایت شبکهٔ جهانی SROI، تحت حمایت برنامهٔ توسعهٔ سازمان ملل متحد (UNDP)، منتشر شده است. این چارچوب امروزه از سوی سازمان‌های بین‌المللی، بخش‌های دولتی، سرمایه‌گذاران اجتماعی، مؤسسات خیریه و شرکت‌های خصوصی در سراسر جهان، به‌عنوان استانداردی جامع برای سنجش ارزش اجتماعی، محیط‌زیستی و اقتصادی پذیرفته شده است.
                    </p>
                  </div>
                </details>
              </div>
            ) : (
              <div className="rail-tip">
                <CircleHelp size={14} />
                <div>
                  <strong>{enCopy.dataTip}</strong>
                  <p>Use measured evidence where possible. Financial proxies are estimates, not observed cash returns.</p>
                  <a href="https://www.socialvalueint.org/s/The-SROI-Guide-2012.pdf" target="_blank" rel="noopener noreferrer">{enCopy.referenceGuide}</a>
                </div>
              </div>
            )}
          </aside>

          <section className="er-main">
            <div className="er-heading">
              <div className="er-heading-copy">
                {(!fa || stage !== "overview") && (
                  <span className="eyebrow">{fa ? faCopy.decisionSupport : `Decision support / ${currentStage.label.toUpperCase()}`}</span>
                )}
                <h1 className={stage === "overview" ? fa ? "er-heading-title-persian" : "er-heading-title-english" : undefined}>
                  {stage === "overview" && fa ? (
                    faCopy.heading
                  ) : stage === "overview" ? (
                    <>
                      Social impact
                      <em>assessment</em>
                    </>
                  ) : (
                    stageTitle(stage, locale)
                  )}
                </h1>
                {fa && stage === "overview" && (
                  <p className="er-methodology-subtitle">{faCopy.methodologySubtitle}</p>
                )}
              </div>

              <div className="total-value glass">
                <span className="total-value-label">{fa ? faCopy.totalValue : enCopy.totalValue}</span>
                <span className="value-pill">◈ {fa ? faCopy.valueCreated : enCopy.valueCreated}</span>
                <strong dir={fa ? "rtl" : "ltr"}>{money(result.total, true, locale)}</strong>
                <small>{fa ? faCopy.netValue : enCopy.netValue} <b>{fa ? "برآورد زنده" : "Live estimate"}</b></small>
              </div>
            </div>

            {stage === "overview" ? (
              <>
                {fa ? <PersianMethodology /> : <EnglishMethodology />}
                <Overview form={form} result={result} locale={locale} />
              </>
            ) : stage === "results" ? <Results result={result} exportPdf={exportPdf} locale={locale} /> : <Inputs stage={stage} form={form} update={update} locale={locale} />}
          </section>

          <div className="er-right-column">
          <aside className="er-result glass">
            <div className="result-head"><span className="dot" /> {fa ? faCopy.liveResult : enCopy.liveResult}</div>
            <small>{fa ? "نسبت بازگشت اجتماعی سرمایه‌گذاری" : "SROI ratio"}</small>
            <div className="ratio-row">
              <strong dir="ltr">{formatNumber(result.ratio, locale, 2)}</strong>
              <span>{fa ? "برآورد فعلی" : "At current inputs"}</span>
            </div>
            <p>
              {fa ? <>{faCopy.ratioSentenceBefore} <b dir="rtl">{formatNumber(result.ratio, locale, 2)} تومان</b> {faCopy.ratioSentenceAfter}</> : <>Every $1 invested creates an estimated <b>${result.ratio.toFixed(2)}</b> in social value.</>}
            </p>

            <div className="result-donut" style={{ background: ring(result) }}>
              <div className="center">
                <strong>{money(result.total, true, locale)}</strong>
                <span>{fa ? faCopy.netValue : enCopy.netValue}</span>
              </div>
            </div>

            <div className="legend-list">
              <div className="legend-item">
                <span className="label"><span className="dot social" />{fa ? faCopy.social : enCopy.social}</span>
                <span className="amount">{money(result.values.social, true, locale)}</span>
                <span className="pct">{formatNumber(Math.round((result.values.social / result.total) * 100) || 0, locale)}{fa ? "٪" : "%"}</span>
              </div>
              <div className="legend-item">
                <span className="label"><span className="dot economic" />{fa ? faCopy.economic : enCopy.economic}</span>
                <span className="amount">{money(result.values.economic, true, locale)}</span>
                <span className="pct">{formatNumber(Math.round((result.values.economic / result.total) * 100) || 0, locale)}{fa ? "٪" : "%"}</span>
              </div>
              <div className="legend-item">
                <span className="label"><span className="dot environmental" />{fa ? faCopy.environmental : enCopy.environmental}</span>
                <span className="amount">{money(result.values.environmental, true, locale)}</span>
                <span className="pct">{formatNumber(Math.round((result.values.environmental / result.total) * 100) || 0, locale)}{fa ? "٪" : "%"}</span>
              </div>
            </div>

            <button className="download-btn" type="button" onClick={exportPdf}><Download size={14} /> {fa ? "چاپ / ذخیرهٔ گزارش PDF" : "Download report"}</button>
            <div className="result-disclaimer">{fa ? faCopy.screeningEstimate : enCopy.screeningEstimate}</div>
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
  @media (max-width: 820px) {
    .er-console.is-persian .metric-pill + .metric-pill,
    .er-console.is-persian .snapshot-item + .snapshot-item { border-right: 0; padding-right: 0; }
    .er-console.is-persian .scenario-box { border-right: 0; border-top: 1px solid var(--line); padding: 14px 0 0; }
    .er-console.is-persian .er-status { display: none; }
    .er-console.is-persian .er-brand { width: 188px; height: 39px; margin-right: 0; }
  }
`;

const lightPersianStyles = `
  .er-console.is-persian {
    --social: #28735f;
    --economic: #a56b21;
    --environmental: #4d7890;
    --gold: #936a20;
    --coral: #a64249;
    --text-primary: #26332f;
    --text-secondary: #53635d;
    --text-muted: #68766f;
    --panel: #fff;
    --panel-soft: #f5f8f5;
    --line: #dce5de;
    color: #26332f;
    min-height: 100vh;
    height: auto;
    overflow: visible;
    padding: 20px clamp(14px, 2.8vw, 42px) 36px;
    background: #f4f6f2;
    text-align: right;
  }
  .er-console.is-persian::before,
  .er-console.is-persian::after { display: none; content: none; }
  .er-console.is-persian .er-overlay { display: none; }
  .er-console.is-persian .er-shell {
    width: min(100%, 1580px);
    height: auto;
    min-height: calc(100vh - 56px);
    grid-template-rows: auto 1fr auto;
    gap: 20px;
  }
  .er-console.is-persian .er-topbar {
    min-height: 54px;
    padding: 8px 14px;
    border: 1px solid #e3e9e3;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 5px 18px rgba(35, 56, 44, .045);
  }
  .er-console.is-persian .er-brand { width: 240px; height: 38px; }
  .er-console.is-persian .er-brand img { filter: none; }
  .er-console.is-persian .er-status { color: #53635d; letter-spacing: 0; }
  .er-console.is-persian .er-status .dot,
  .er-console.is-persian .result-head .dot,
  .er-console.is-persian .er-foot .dot { background: #43836a; box-shadow: 0 0 0 3px rgba(67,131,106,.13); }
  .er-console.is-persian .er-icon-btn,
  .er-console.is-persian .er-topbar-actions a {
    color: #46574f;
    border-color: #dce5de;
    background: #fff;
  }
  .er-console.is-persian .er-topbar-actions a { gap: 7px; }
  .er-console.is-persian .er-body {
    min-height: 0;
    align-items: start;
    grid-template-columns: 218px minmax(0, 1fr) 314px;
    gap: 16px;
  }
  .er-console.is-persian .er-rail,
  .er-console.is-persian .er-result,
  .er-console.is-persian .panel,
  .er-console.is-persian .total-value {
    color: #26332f;
    border: 1px solid #dfe7e0;
    background: #fff;
    box-shadow: 0 8px 24px rgba(35, 56, 44, .055);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .er-console.is-persian .er-rail {
    position: sticky;
    top: 16px;
    height: auto;
    min-height: 0;
    overflow: visible;
    padding: 16px 12px;
    border-radius: 16px;
  }
  .er-console.is-persian .er-rail-head { color: #6e7b73; }
  .er-console.is-persian .er-rail nav {
    gap: 7px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5ebe5;
  }
  .er-console.is-persian .rail-item {
    color: #34443c;
    padding: 10px 8px;
    border-color: transparent;
  }
  .er-console.is-persian .rail-item .icon-shell {
    color: #66766c;
    border-color: #e6ece7;
    background: #f5f8f5;
  }
  .er-console.is-persian .rail-item.active {
    color: #245d4d;
    border-color: #d1e5d9;
    background: #edf6f0;
    box-shadow: none;
  }
  .er-console.is-persian .rail-item.active .icon-shell { color: #28735f; background: #e0f0e6; }
  .er-console.is-persian .rail-item .copy small { color: #77847b; }
  .er-console.is-persian .rail-item.active .copy small { color: #28735f; }
  .er-console.is-persian .rail-item .state-mark { color: #28735f; }
  .er-console.is-persian .rail-tip { color: #64736a; border-color: #e5ebe5; }
  .er-console.is-persian .rail-tip strong { color: #2d4438; }
  .er-console.is-persian .er-main { min-height: 0; gap: 16px; }
  .er-console.is-persian .er-heading {
    min-height: 0;
    grid-template-columns: minmax(0, 1fr) minmax(235px, .8fr);
    align-items: stretch;
    gap: 14px;
  }
  .er-console.is-persian .eyebrow,
  .er-console.is-persian .panel-head span { color: #68786e; letter-spacing: 0; }
  .er-console.is-persian .er-heading h1 { color: #27382f; font-size: clamp(1.8rem, 2.8vw, 2.6rem); line-height: 1.35; letter-spacing: 0; }
  .er-console.is-persian .er-heading h1.er-heading-title-persian { font-size: clamp(1.6rem, 2.5vw, 2.3rem); line-height: 1.5; white-space: nowrap; }
  .er-console.is-persian .er-heading h1 em { color: #28735f; }
  .er-console.is-persian .er-heading p { color: #5d6b63; }
  .er-console.is-persian .er-heading .er-methodology-subtitle { margin-top: 6px; }
  .er-console.is-persian .eyebrow,
  .er-console.is-persian .panel-head span { font-size: 11px; }
  .er-console.is-persian .field label { font-size: 12px; }
  .er-console.is-persian .rail-item .copy small { font-size: 10px; }
  .er-console.is-persian .result-card span { font-size: 11px; }
  .er-console.is-persian .total-value {
    position: relative;
    height: auto;
    min-height: 120px;
    padding: 16px 20px;
    overflow: hidden;
    border-radius: 16px;
    background: linear-gradient(135deg, #edf6ef, #e5f0e8);
  }
  .er-console.is-persian .total-value::after { display: none; }
  .er-console.is-persian .total-value-label { color: #52675b; }
  .er-console.is-persian .total-value strong { color: #245d4d; font-size: clamp(1.8rem, 2.8vw, 2.8rem); }
  .er-console.is-persian .total-value small { color: #607268; }
  .er-console.is-persian .total-value small b { color: #28735f; }
  .er-console.is-persian .total-value .value-pill { color: #52675b; background: rgba(255,255,255,.76); }
  .er-console.is-persian .panel { border-radius: 16px; padding: 18px; }
  .er-console.is-persian .panel h2,
  .er-console.is-persian .panel h3 { color: #2d4438; }
  .er-console.is-persian .panel-head small { color: #758178; }
  .er-console.is-persian .value-panel,
  .er-console.is-persian .bridge-panel { min-height: 0; }
  .er-console.is-persian .value-panel { container: value-panel / inline-size; }
  .er-console.is-persian .value-layout { min-height: 0; }
  .er-console.is-persian .bar-item-label { white-space: nowrap; }
  .er-console.is-persian .bar-item-header b { flex: 0 0 auto; white-space: nowrap; }
  .er-console.is-persian .donut,
  .er-console.is-persian .result-donut { filter: none; }
  .er-console.is-persian .donut::after,
  .er-console.is-persian .result-donut::after { background: #fff; box-shadow: inset 0 0 0 1px #e5ebe5; }
  .er-console.is-persian .donut .center strong,
  .er-console.is-persian .result-donut .center strong { color: #2d4438; }
  .er-console.is-persian .bar-track { background: #edf1ed; border-color: #e0e7e0; }
  .er-console.is-persian .bar-fill { box-shadow: none; }
  .er-console.is-persian .bar-item-header,
  .er-console.is-persian .bridge-row-head { color: #46574e; }
  .er-console.is-persian .bridge-row-head b { color: #2d4438; }
  .er-console.is-persian .bridge-note { color: #68776e; }
  .er-console.is-persian .metric-strip,
  .er-console.is-persian .snapshot-strip { min-height: 0; }
  .er-console.is-persian .metric-pill small,
  .er-console.is-persian .snapshot-item small { color: #68776e; }
  .er-console.is-persian .metric-pill strong,
  .er-console.is-persian .snapshot-item strong { color: #2d4438; }
  .er-console.is-persian .metric-pill + .metric-pill,
  .er-console.is-persian .snapshot-item + .snapshot-item { border-color: #e3e9e3; }
  .er-console.is-persian .er-right-column { gap: 14px; }
  .er-console.is-persian .er-result {
    position: sticky;
    top: 16px;
    align-self: start;
    height: auto;
    min-height: 0;
    max-height: calc(100dvh - 32px);
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 18px;
    border-radius: 16px;
  }
  .er-console.is-persian .result-head,
  .er-console.is-persian .er-result small { color: #64736a; }
  .er-console.is-persian .ratio-row strong { color: #245d4d; font-size: 3rem; }
  .er-console.is-persian .ratio-row span { color: #28735f; }
  .er-console.is-persian .er-result p { color: #53635a; }
  .er-console.is-persian .legend-item,
  .er-console.is-persian .legend-item .amount { color: #526259; }
  .er-console.is-persian .legend-item .amount { color: #2d4438; }
  .er-console.is-persian .legend-item { grid-template-columns: minmax(0, 1fr) auto auto; }
  .er-console.is-persian .legend-item .label,
  .er-console.is-persian .legend-item .pct { white-space: nowrap; }
  .er-console.is-persian .download-btn {
    min-height: 40px;
    color: #fff;
    border: 1px solid #28735f;
    background: #28735f;
  }
  .er-console.is-persian .download-btn:hover { background: #1f5f4e; }
  .er-console.is-persian .result-disclaimer { color: #718077; }
  .er-console.is-persian .er-foot { color: #738178; }
  .er-console.is-persian .stage-guide { max-height: none; overflow: visible; color: #586960; line-height: 1.8; }
  .er-console.is-persian .input-panel,
  .er-console.is-persian .results-panel { min-height: 0; }
  .er-console.is-persian .field label { color: #30443a; }
  .er-console.is-persian .field .help { color: #68776e; font-size: 12px; line-height: 1.8; }
  .er-console.is-persian .field .control {
    min-height: 44px;
    border: 1px solid #d7e1d9;
    border-radius: 10px;
    background: #fff;
  }
  .er-console.is-persian .field .control:focus-within { border-color: #63977a; box-shadow: 0 0 0 3px rgba(40,115,95,.12); }
  .er-console.is-persian .field input:not([type="range"]) { color: #26332f; }
  .er-console.is-persian .field .control span { color: #6c7b72; }
  .er-console.is-persian .field input[type="range"] { accent-color: #28735f; }
  .er-console.is-persian .result-card { border-color: #e1e8e1; background: #f7f9f6; }
  .er-console.is-persian .result-card span { color: #66756c; }
  .er-console.is-persian .result-card strong { color: #245d4d; }
  .er-console.is-persian .scenario-box { border-color: #e1e8e1; }
  .er-console.is-persian .estimate-integrity-note {
    margin: 14px 0 0;
    padding: 12px 14px;
    border: 1px solid #dbe9de;
    border-radius: 11px;
    color: #4d6858;
    background: #f1f7f1;
    font-size: 11px;
    line-height: 1.8;
  }
  .er-console.is-persian .methodology-overview {
    display: grid;
    gap: 14px;
    width: 100%;
    min-width: 0;
    color: #36463d;
  }
  .er-console.is-persian .methodology-overview > * { min-width: 0; }
  .er-console.is-persian .methodology-overview p,
  .er-console.is-persian .methodology-overview h3 { overflow-wrap: anywhere; }
  .er-console.is-persian .methodology-overview h2,
  .er-console.is-persian .methodology-overview h3,
  .er-console.is-persian .methodology-overview p { margin-top: 0; }
  .er-console.is-persian .methodology-intro,
  .er-console.is-persian .methodology-concepts article,
  .er-console.is-persian .methodology-preparation,
  .er-console.is-persian .methodology-formula {
    border: 1px solid #dfe7e0;
    border-radius: 15px;
    background: #fff;
    box-shadow: 0 7px 20px rgba(35, 56, 44, .04);
  }
  .er-console.is-persian .methodology-intro { padding: 22px; }
  .er-console.is-persian .methodology-kicker { color: #28735f; font-size: 12px; font-weight: 700; }
  .er-console.is-persian .methodology-intro h2 { margin: 8px 0; color: #263b30; font-size: 23px; }
  .er-console.is-persian .methodology-intro > p { max-width: 920px; margin-bottom: 16px; color: #58685f; font-size: 14px; line-height: 2; }
  .er-console.is-persian .methodology-concepts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .er-console.is-persian .methodology-concepts article { padding: 15px; }
  .er-console.is-persian .methodology-concepts article > span { color: #28735f; font-size: 12px; font-weight: 700; }
  .er-console.is-persian .methodology-concepts h3 { margin: 5px 0; color: #2e4237; font-size: 13px; }
  .er-console.is-persian .methodology-concepts p { margin-bottom: 0; color: #65736a; font-size: 12px; line-height: 1.8; }
  .er-console.is-persian .methodology-preparation { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); align-items: start; gap: 20px; padding: 20px; }
  .er-console.is-persian .methodology-preparation h3 { margin: 5px 0 10px; color: #2e4237; font-size: 16px; }
  .er-console.is-persian .methodology-preparation ul { display: grid; gap: 8px; margin: 0; padding: 0 18px 0 0; color: #596960; font-size: 12px; line-height: 1.9; }
  .er-console.is-persian .methodology-preparation li::marker { color: #43836a; }
  .er-console.is-persian .methodology-preparation li b { color: #394d41; }
  .er-console.is-persian .methodology-preparation aside { align-self: start; min-width: 0; padding: 16px 18px; border: 1px solid #e5ebe4; border-radius: 12px; background: linear-gradient(145deg, #f7f9f6, #f1f6f1); }
  .er-console.is-persian .methodology-preparation aside strong { color: #765b22; font-size: 12px; }
  .er-console.is-persian .methodology-preparation aside p { margin: 7px 0 0; color: #667268; font-size: 12px; line-height: 1.75; }
  .er-console.is-persian .methodology-formula { padding: 15px 18px; background: #f1f7f2; }
  .er-console.is-persian .methodology-formula h3 { margin: 0 0 12px; color: #2d5946; font-size: 18px; line-height: 1.6; }
  .er-console.is-persian .methodology-formula p { margin: 9px 0; color: #52645a; font-size: 12px; line-height: 2; }
  .er-console.is-persian .methodology-formula a { color: #236c56; font-weight: 700; text-underline-offset: 3px; }
  .er-console.is-persian .sroi-formula-label { margin: 18px 0 8px !important; color: #315c48 !important; font-size: 12px !important; font-weight: 700; }
  .er-console.is-persian .sroi-equation {
    display: flex !important;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin: 0 auto;
    padding: 16px;
    border: 1px solid #d7e5d9;
    border-radius: 12px;
    color: #263b30;
    background: #fff;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.6;
    text-align: center;
  }
  .er-console.is-persian .sroi-fraction { display: inline-grid; min-width: 215px; text-align: center; }
  .er-console.is-persian .sroi-fraction span { display: block; padding: 3px 12px; }
  .er-console.is-persian .sroi-fraction span:first-child { border-bottom: 1.5px solid #40594a; }
  .er-console.is-persian .sroi-equation-fa { font-family: Vazirmatn, Tahoma, sans-serif; font-size: 13px; }
  .er-console.is-persian .sroi-equation-detail { display: grid !important; justify-content: stretch; gap: 10px; text-align: left; overflow-x: auto; font-size: 13px; font-weight: 500; }
  .er-console.is-persian .sroi-equation-detail > span { display: block; min-width: max-content; }
  .er-console.is-persian .sroi-equation sub,
  .er-console.is-persian .sroi-equation sup { font-size: .72em; }
  .er-console.is-persian .sroi-implementation-note { margin-top: 16px !important; padding: 11px 13px; border-right: 3px solid #b18939; border-radius: 5px; color: #6a592f !important; background: #fbf7e9; }
  @media (max-width: 1200px) {
    .er-console.is-persian .er-body {
      grid-template-columns: minmax(180px, .8fr) minmax(0, 2.5fr) minmax(250px, 1fr);
      align-items: stretch;
    }
    .er-console.is-persian .er-main { min-width: 0; }
    .er-console.is-persian .input-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .er-console.is-persian .methodology-preparation { grid-template-columns: minmax(0, 1fr); }
    .er-console.is-persian .result-summary { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
    .er-console.is-persian .er-right-column {
      grid-column: auto;
      min-width: 0;
      grid-template-columns: minmax(0, 1fr);
    }
    .er-console.is-persian .er-result {
      position: sticky;
      top: 16px;
      align-self: start;
      width: 100%;
      min-width: 0;
    }
  }
  @container value-panel (max-width: 520px) {
    .er-console.is-persian .value-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
    }
    .er-console.is-persian .donut {
      width: clamp(140px, 45cqi, 190px);
    }
    .er-console.is-persian .bar-list {
      width: 100%;
      min-width: 0;
    }
    .er-console.is-persian .bar-item,
    .er-console.is-persian .bar-item-header {
      min-width: 0;
    }
    .er-console.is-persian .bar-item-label {
      flex: 0 1 auto;
    }
  }
  @media (max-width: 820px) {
    .er-console.is-persian { height: auto; min-height: 100vh; overflow: visible; padding: 12px; }
    .er-console.is-persian .er-shell { height: auto; min-height: calc(100vh - 24px); grid-template-rows: auto 1fr auto; gap: 12px; }
    .er-console.is-persian .er-topbar { flex-wrap: wrap; }
    .er-console.is-persian .er-body { display: block; }
    .er-console.is-persian .er-rail { position: static; margin-bottom: 14px; }
    .er-console.is-persian .er-main { margin-bottom: 14px; }
    .er-console.is-persian .input-grid,
    .er-console.is-persian .result-summary { grid-template-columns: minmax(0, 1fr); }
    .er-console.is-persian .er-heading { display: flex; flex-direction: column; }
    .er-console.is-persian .er-heading h1 { font-size: clamp(1.7rem, 7vw, 2.3rem); }
    .er-console.is-persian .er-heading h1.er-heading-title-persian { font-size: clamp(1.3rem, 6vw, 1.8rem); }
    .er-console.is-persian .total-value { width: 100%; }
    .er-console.is-persian .er-right-column { display: grid; grid-template-columns: 1fr; }
    .er-console.is-persian .er-result { position: static; max-height: none; overflow: visible; }
    .er-console.is-persian .overview-grid { grid-template-columns: 1fr; grid-template-rows: auto; flex: initial; }
    .er-console.is-persian .panel { padding: 15px; }
    .er-console.is-persian .methodology-preparation { grid-template-columns: 1fr; }
    .er-console.is-persian .er-status { display: none; }
    .er-console.is-persian .rail-tip-content {
      position: static;
      width: auto;
      max-height: min(55vh, 420px);
      margin: 10px 22px 0 0;
      padding: 12px;
    }
  }
  @media (max-width: 520px) {
    .er-console.is-persian .methodology-concepts { grid-template-columns: 1fr; }
    .er-console.is-persian .methodology-intro { padding: 17px; }
    .er-console.is-persian .methodology-intro h2 { font-size: 18px; }
    .er-console.is-persian .sroi-equation { gap: 8px; padding: 12px; font-size: 14px; }
    .er-console.is-persian .sroi-equation-fa { font-size: 11px; }
    .er-console.is-persian .sroi-equation-detail { font-size: 11px; }
    .er-console.is-persian .value-layout { grid-template-columns: 1fr; }
    .er-console.is-persian .donut { width: 150px; }
  }
  .er-console.is-persian p {
    text-align: justify;
    text-justify: inter-word;
  }
`;

const englishStyles = `
  ${[persianStyles, lightPersianStyles]
    .map((style) =>
      style
        .replace(/\.is-persian/g, ".is-english")
        .replace(/\b(?:left|right|rtl|ltr)\b/g, (value) =>
          ({ left: "right", right: "left", rtl: "ltr", ltr: "rtl" })[value]!,
        ),
    )
    .join("\n")}
  .er-console.is-english,
  .er-console.is-english * {
    font-family: "DM Sans", Inter, "Segoe UI", Arial, sans-serif;
    letter-spacing: 0;
  }
  .er-console.is-english .er-heading h1.er-heading-title-english { font-size: clamp(3.2rem, 4.2vw, 5rem); }
  @media (max-width: 820px) {
    .er-console.is-english .er-heading h1.er-heading-title-english { font-size: clamp(2.8rem, 12vw, 4.4rem); }
  }
  .er-console.is-english { direction: ltr; text-align: left; }
  .er-console.is-english .er-brand { justify-content: flex-start; }
  .er-console.is-english .er-brand img { object-position: left center; filter: none; }
  .er-console.is-english .er-topbar-actions a { padding: 0 12px 0 10px; }
  .er-console.is-english .methodology-preparation ul { padding: 0 0 0 18px; }
  .er-console.is-english .er-foot { padding: 0 6px 0 2px; }
  .er-console.is-english .field input:not([type="range"]),
  .er-console.is-english .ratio-row strong,
  .er-console.is-english .result-card strong,
  .er-console.is-english .legend-item .amount,
  .er-console.is-english .legend-item .pct,
  .er-console.is-english .sroi-equation,
  .er-console.is-english .sroi-equation-detail {
    direction: ltr;
    text-align: left;
    unicode-bidi: isolate;
  }
  .er-console.is-english .bar-fill { inset: 0 auto 0 0; }
  .er-console.is-english .sroi-equation-detail { overflow-x: auto; }
`;
