"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fallbackProfiles, persianFallbackProfiles } from "@/components/country/countryFallbackProfiles";

type CountryArticle = {
  id: string;
  name: string;
  title?: string;
  article?: string;
};

export default function CountryArticlePage({ locale, countryId }: { locale: "en" | "fa"; countryId: string }) {
  const isPersian = locale === "fa";
  const [profile, setProfile] = useState<CountryArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBase = (process.env.NEXT_PUBLIC_WORDPRESS_URL || "").replace(/\/$/, "");
    fetch(`${apiBase}/wp-json/sse/v1/countries?locale=${locale}`)
      .then((response) => {
        if (!response.ok) throw new Error("Country article is not available.");
        return response.json();
      })
      .then((data: CountryArticle[]) => {
        setProfile(data.find((item) => item.id.toLowerCase() === countryId.toLowerCase()) || null);
      })
      .catch(() => {
        const fallbackProfilesForLocale = isPersian ? persianFallbackProfiles : fallbackProfiles;
        setProfile(fallbackProfilesForLocale.find((item) => item.id.toLowerCase() === countryId.toLowerCase()) || null);
      })
      .finally(() => setLoading(false));
  }, [countryId, isPersian, locale]);

  const title = profile?.title || profile?.name || (isPersian ? "مقاله کشور" : "Country article");

  return (
    <main className="country-article-page" dir={isPersian ? "rtl" : "ltr"}>
      <style jsx>{`
        .country-article-page { min-height: 100vh; padding: 42px 20px 80px; color: #2d2523; background: #f7f4ef; font-family: "Vazirmatn", Tahoma, Arial, sans-serif; }
        .article-shell { width: min(900px, 100%); margin: 0 auto; padding: clamp(24px, 5vw, 64px); border: 1px solid #eaded6; background: #fffdfa; box-shadow: 0 18px 50px rgba(70, 30, 20, .09); }
        .back-link { display: inline-block; margin-bottom: 42px; color: #71131a; font-size: 13px; font-weight: 700; text-decoration: none; }
        .eyebrow { margin: 0 0 12px; color: #a6202a; font-size: 11px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
        h1 { margin: 0; color: #241d1c; font-size: clamp(30px, 5vw, 52px); line-height: 1.12; }
        .article-body { margin-top: 42px; color: #514744; font-size: 17px; line-height: 2; }
        .article-body :global(p) { margin: 0 0 1.25em; }
        .article-body :global(h2), .article-body :global(h3) { color: #71131a; line-height: 1.4; }
        .article-body :global(a) { color: #a6202a; }
        .state { padding: 50px 0; color: #766965; }
      `}</style>
      <article className="article-shell">
        <Link className="back-link" href={`/${locale}/country-explorer`}>
          {isPersian ? "بازگشت به وضعیت اقتصاد اجتماعی کشورها" : "Back to Country Explorer"}
        </Link>
        <p className="eyebrow">{isPersian ? "پژوهش کشور" : "Country research"}</p>
        <h1 dir={isPersian ? "rtl" : "ltr"}>{title}</h1>
        {loading ? (
          <p className="state">{isPersian ? "در حال بارگذاری مقاله..." : "Loading article..."}</p>
        ) : profile?.article ? (
          <div className="article-body" dangerouslySetInnerHTML={{ __html: profile.article }} />
        ) : (
          <p className="state">{isPersian ? "مقاله این کشور هنوز منتشر نشده است." : "This country article has not been published yet."}</p>
        )}
      </article>
    </main>
  );
}
