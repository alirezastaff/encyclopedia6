export type CountryFallbackProfile = {
  id: string;
  name: string;
  title?: string;
  summary?: string;
  article?: string;
};

export const fallbackProfiles: CountryFallbackProfile[] = [
  { id: "CAN", name: "Canada", summary: "Canada offers a useful starting point for thinking about social and solidarity economy in practice.", article: "Cooperatives, community organizations, mutual-aid initiatives, Indigenous economic traditions, and local social enterprises all contribute to a broader understanding of how communities organize resources and care beyond the boundaries of the conventional market." },
  { id: "USA", name: "United States of America", summary: "Community wealth building, worker ownership, and mutual aid shape a diverse SSE landscape across the United States.", article: "Worker cooperatives, community development finance, and neighborhood organizations show how local ownership can keep value circulating where people live and work." },
  { id: "BRA", name: "Brazil", summary: "Solidarity economy networks in Brazil connect cooperatives, local production, and social inclusion.", article: "Brazilian experiences make visible the role of collective organization in creating livelihoods, strengthening local markets, and expanding democratic participation." },
  { id: "COL", name: "Colombia", summary: "Community-led initiatives in Colombia link peacebuilding, livelihoods, and territorial development.", article: "Cooperatives and grassroots organizations demonstrate how solidarity practices can support recovery, inclusion, and resilient local economies." },
  { id: "FRA", name: "France", summary: "France has a long institutional history of associations, mutuals, cooperatives, and social enterprises.", article: "The French SSE ecosystem combines civic action with purpose-led enterprise and public policy support." },
  { id: "KOR", name: "South Korea", summary: "Social enterprises and cooperatives in South Korea connect innovation with community benefit.", article: "Local initiatives show how social innovation, care, and employment can be organized through democratic enterprise." },
  { id: "DEU", name: "Germany", summary: "Cooperatives and mission-led enterprises connect local ownership with resilient regional economies.", article: "Germany's cooperative traditions and social enterprises offer practical examples of democratic ownership and community finance." },
  { id: "ESP", name: "Spain", summary: "Worker cooperatives and solidarity networks strengthen local livelihoods and shared prosperity.", article: "Community enterprises and cooperative federations show how work, care, and local development can be organized collectively." },
  { id: "ITA", name: "Italy", summary: "Social cooperatives in Italy link public purpose, care services, and dignified employment.", article: "Italy's social cooperative movement demonstrates how collective enterprise can respond to social needs while creating quality work." },
  { id: "NLD", name: "Netherlands", summary: "Civic initiatives and purpose-led organizations help build inclusive and sustainable local economies.", article: "Dutch community enterprises illustrate how residents and institutions can share responsibility for places and resources." },
  { id: "IND", name: "India", summary: "Self-help groups, producer cooperatives, and community finance support livelihoods at scale.", article: "Collective action across India connects economic participation with gender equity, rural development, and local resilience." },
  { id: "JPN", name: "Japan", summary: "Cooperatives and community organizations respond to care, food, and demographic change.", article: "Japanese mutual-aid and cooperative models show how communities can organize care and essential services together." },
  { id: "MEX", name: "Mexico", summary: "Community economies and cooperative production keep local knowledge and value in place.", article: "Indigenous and community-led enterprises connect cultural stewardship, livelihoods, and democratic local development." },
  { id: "ZAF", name: "South Africa", summary: "Community enterprises and solidarity initiatives create pathways to inclusion and local ownership.", article: "Worker, community, and informal economy initiatives demonstrate the importance of collective power in unequal contexts." },
  { id: "AUS", name: "Australia", summary: "First Nations enterprises, cooperatives, and social ventures support community-led development.", article: "Place-based initiatives connect social purpose with stewardship, employment, and stronger local economies." },
];

export const persianFallbackProfiles: CountryFallbackProfile[] = [
  { id: "CAN", name: "کانادا", summary: "کانادا نقطه شروعی برای بررسی اقتصاد اجتماعی و همبستگی در عمل است.", article: "تعاونی‌ها، سازمان‌های اجتماعی، ابتکارهای یاری متقابل، سنت‌های اقتصادی بومی و بنگاه‌های اجتماعی، درک گسترده‌تری از سازمان‌دهی منابع و مراقبت فراتر از بازار متعارف ارائه می‌کنند." },
  { id: "USA", name: "ایالات متحده آمریکا", summary: "ساخت ثروت اجتماعی، مالکیت کارکنان و یاری متقابل، چشم‌انداز متنوع اقتصاد اجتماعی و همبستگی در ایالات متحده را شکل می‌دهند.", article: "تعاونی‌های کارگری، تأمین مالی توسعه اجتماعی و سازمان‌های محله‌محور نشان می‌دهند مالکیت محلی چگونه می‌تواند ارزش را در محل زندگی و کار مردم نگه دارد." },
  { id: "BRA", name: "برزیل", summary: "شبکه‌های اقتصاد همبستگی در برزیل تعاونی‌ها، تولید محلی و مشارکت اجتماعی را به هم پیوند می‌دهند.", article: "تجربه‌های برزیل نقش سازمان‌دهی جمعی را در ایجاد معیشت، تقویت بازارهای محلی و گسترش مشارکت دموکراتیک آشکار می‌کنند." },
  { id: "COL", name: "کلمبیا", summary: "ابتکارهای جامعه‌محور در کلمبیا صلح‌سازی، معیشت و توسعه سرزمینی را به هم پیوند می‌دهند.", article: "تعاونی‌ها و سازمان‌های مردمی نشان می‌دهند شیوه‌های همبستگی چگونه از بازسازی، مشارکت و اقتصادهای محلی تاب‌آور پشتیبانی می‌کنند." },
  { id: "FRA", name: "فرانسه", summary: "فرانسه سابقه‌ای نهادی و طولانی در انجمن‌ها، نهادهای تعاونی و بنگاه‌های اجتماعی دارد.", article: "زیست‌بوم اقتصاد اجتماعی و همبستگی فرانسه کنش مدنی را با بنگاه‌های هدف‌محور و حمایت سیاست عمومی ترکیب می‌کند." },
  { id: "KOR", name: "کره جنوبی", summary: "بنگاه‌های اجتماعی و تعاونی‌ها در کره جنوبی نوآوری را با منفعت اجتماعی پیوند می‌دهند.", article: "ابتکارهای محلی نشان می‌دهند نوآوری اجتماعی، مراقبت و اشتغال چگونه می‌توانند از طریق بنگاه دموکراتیک سازمان پیدا کنند." },
];