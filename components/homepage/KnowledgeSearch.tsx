"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";

type KnowledgeSearchProps = {
  locale: "fa" | "en";
  smartSearchActive?: boolean;
  onSmartSearchToggle?: () => void;
};

export default function KnowledgeSearch({
  locale,
  smartSearchActive = false,
  onSmartSearchToggle,
}: KnowledgeSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const isFa = locale === "fa";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchTerm = query.trim();
    if (isFa) {
      if (smartSearchActive) {
        router.push(`/fa/knowledge-graph?q=${encodeURIComponent(searchTerm || "solidarity")}`);
      }
      return;
    }

    if (smartSearchActive && searchTerm) {
      router.push(`/en/knowledge-graph?q=${encodeURIComponent(searchTerm)}`);
      return;
    }

    router.push(searchTerm ? `/en/archive?q=${encodeURIComponent(searchTerm)}` : "/en/archive");
  }

  return (
    <div className="knowledge-search-wrap">
      <form className={`knowledge-search${smartSearchActive ? " smart-active" : ""}`} onSubmit={handleSubmit}>
        <button className="search-glass-button" type="submit" aria-label={isFa ? "جست‌وجو" : "Search"}>
          <Search className="search-glass" aria-hidden="true" />
        </button>
        <input
          className="search-placeholder"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={isFa ? "جست‌وجوی مقاله، کشور، موضوع، نویسنده یا کلیدواژه..." : "Search articles, countries, topics, authors or keywords..."}
          aria-label={isFa ? "جست‌وجو" : "Search"}
          dir={isFa ? "rtl" : "ltr"}
        />
        <button
          className={`search-smart-button${smartSearchActive ? " active" : ""}`}
          type="button"
          aria-label={isFa ? "جست‌وجوی هوشمند" : "Smart search"}
          aria-pressed={smartSearchActive}
          title={isFa ? "جست‌وجوی هوشمند" : "Smart search"}
          onClick={onSmartSearchToggle}
        >
          <Sparkles aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
