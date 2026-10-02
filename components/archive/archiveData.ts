export type Entry = {
  no: number;
  en: string;
  fa: string;
  page: number;
};

export type Part = {
  id: string;
  number: string;
  faTitle: string;
  enTitle: string;
  entries: Entry[];
};

export const encyclopediaParts: Part[] = [
  {
    id: "part-1",
    number: "I",
    faTitle: "بخش اول: تاریخ‌ها، مفاهیم و نظریه‌ها",
    enTitle: "PART I: HISTORIES, CONCEPTS AND THEORIES",
    entries: [
      { no: 1, en: "Activism and social movements", fa: "کنشگری و جنبش‌های اجتماعی", page: 2 },
      { no: 2, en: "Community economies", fa: "اقتصادهای جامعه‌محور", page: 12 },
      { no: 3, en: "Contemporary understandings", fa: "برداشت‌های معاصر", page: 19 },
      { no: 4, en: "Ecological economics", fa: "اقتصاد بوم‌شناختی", page: 27 },
      { no: 5, en: "Feminist economics", fa: "اقتصاد فمینیستی", page: 37 },
      { no: 6, en: "Globalization and alter-globalization", fa: "جهانی‌شدن و دگرجهانی‌شدن", page: 44 },
      { no: 7, en: "Heterodox economics", fa: "اقتصاد دگراندیش", page: 53 },
      { no: 8, en: "Indigenous economies", fa: "اقتصادهای بومی", page: 61 },
      { no: 9, en: "Moral economy and human economy", fa: "اقتصاد اخلاقی و اقتصاد انسانی", page: 68 },
      { no: 10, en: "Origins and histories", fa: "خاستگاه‌ها و تاریخ‌ها", page: 73 },
      { no: 11, en: "Postcolonial theories", fa: "نظریه‌های پسااستعماری", page: 83 },
      { no: 12, en: "The Black social economy", fa: "اقتصاد اجتماعی سیاه‌پوستان", page: 92 },
      { no: 13, en: "The commons", fa: "منابع مشترک", page: 97 },
    ],
  },
  {
    id: "part-2",
    number: "II",
    faTitle: "بخش دوم: کنشگران و سازمان‌ها",
    enTitle: "PART II: ACTORS AND ORGANIZATIONS",
    entries: [
      { no: 14, en: "African American solidarity economics and distributive justice", fa: "اقتصاد همبستگی آفریقایی-آمریکایی و عدالت توزیعی", page: 105 },
      { no: 15, en: "Associations and associationalism", fa: "انجمن‌ها و انجمن‌گرایی", page: 113 },
      { no: 16, en: "Community-based organizations", fa: "سازمان‌های مبتنی بر جامعه", page: 121 },
      { no: 17, en: "Cooperatives and mutuals", fa: "تعاونی‌ها و نهادهای تعاون متقابل", page: 131 },
      { no: 18, en: "LGBT* inclusion", fa: "فراگیری افراد LGBT*", page: 138 },
      { no: 19, en: "Migrants and refugees", fa: "مهاجران و پناهندگان", page: 147 },
      { no: 20, en: "Non-governmental organisations and foundations", fa: "سازمان‌های غیردولتی و بنیادها", page: 155 },
      { no: 21, en: "Social enterprises", fa: "بنگاه‌های اجتماعی", page: 163 },
      { no: 22, en: "Women’s self-help groups", fa: "گروه‌های خودیاری زنان", page: 172 },
      { no: 23, en: "Youth", fa: "جوانان", page: 180 },
    ],
  },
  {
    id: "part-3",
    number: "III",
    faTitle: "بخش سوم: پیوندها با توسعه",
    enTitle: "PART III: LINKAGES TO DEVELOPMENT",
    entries: [
      { no: 24, en: "Care and home support services", fa: "خدمات مراقبت و حمایت خانگی", page: 187 },
      { no: 25, en: "Culture, sports and leisure sectors", fa: "بخش‌های فرهنگ، ورزش و اوقات فراغت", page: 194 },
      { no: 26, en: "Education sector", fa: "بخش آموزش", page: 200 },
      { no: 27, en: "Energy, water and waste management sectors", fa: "بخش‌های انرژی، آب و مدیریت پسماند", page: 209 },
      { no: 28, en: "Finance sector", fa: "بخش مالی", page: 216 },
      { no: 29, en: "Food and agriculture sector", fa: "بخش غذا و کشاورزی", page: 224 },
      { no: 30, en: "Gender equality and empowerment", fa: "برابری جنسیتی و توانمندسازی", page: 231 },
      { no: 31, en: "Health and care sector", fa: "بخش سلامت و مراقبت", page: 240 },
      { no: 32, en: "Housing sector", fa: "بخش مسکن", page: 248 },
      { no: 33, en: "Information and communication technology (ICT)", fa: "فناوری اطلاعات و ارتباطات", page: 255 },
      { no: 34, en: "Local community development", fa: "توسعه جامعه محلی", page: 264 },
      { no: 35, en: "Peace and non-violence", fa: "صلح و عدم خشونت", page: 272 },
      { no: 36, en: "Reduction of hunger and poverty", fa: "کاهش گرسنگی و فقر", page: 281 },
      { no: 37, en: "Reduction of multidimensional inequalities", fa: "کاهش نابرابری‌های چندبعدی", page: 287 },
      { no: 38, en: "Social services", fa: "خدمات اجتماعی", page: 295 },
      { no: 39, en: "Sustainable investment, production and consumption", fa: "سرمایه‌گذاری، تولید و مصرف پایدار", page: 303 },
      { no: 40, en: "The Sustainable Development Goals", fa: "اهداف توسعه پایدار", page: 310 },
      { no: 41, en: "Tourism sector", fa: "بخش گردشگری", page: 321 },
      { no: 42, en: "Work integration", fa: "ادغام اجتماعی از مسیر کار", page: 329 },
    ],
  },
  {
    id: "part-4",
    number: "IV",
    faTitle: "بخش چهارم: محیط توانمندساز و حکمرانی",
    enTitle: "PART IV: ENABLING ENVIRONMENT AND GOVERNANCE",
    entries: [{ no: 43, en: "Access to markets", fa: "دسترسی به بازارها", page: 338 }],
  },
];