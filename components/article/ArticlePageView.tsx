"use client";

import Link from "next/link";
import { ArrowDown, MoonStar, Share2, SunMedium, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { type ArticleLocale, getLocalizedArticle } from "@/lib/articles";

type ArticlePageViewProps = {
  locale: ArticleLocale;
  slug: string;
};

function classifySection(text: string): "heading" | "paragraph" {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) return "paragraph";
  if (/^(BOX|REFERENCES?)\b/i.test(normalized) || isReferencesHeading(normalized)) return "heading";
  if (/^[۰-۹\d]+([.)]|[IVX]+[.)])/.test(normalized)) return "heading";
  const englishHeading = /^[A-Z][A-Za-z0-9\s&’'()\-:,.]+$/.test(normalized) && normalized.length < 90;
  const persianHeading = /^[\u0600-\u06FF\s۰-۹،؛:؟«»"'().\-]+$/.test(normalized) && normalized.length < 90;
  if (englishHeading || persianHeading) return "heading";
  return "paragraph";
}

function isReferencesHeading(text: string) {
  return /^(?:references?|bibliography|works cited|sources|منابع(?:\s+و\s+مآخذ)?|مآخذ)\s*:?[\s]*$/i.test(text.trim());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function crc32(input: Uint8Array) {
  let crc = 0xffffffff;
  input.forEach((byte) => {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  });
  return (crc ^ 0xffffffff) >>> 0;
}

function createSimpleZip(files: Array<{ name: string; content: string }>) {
  const encoder = new TextEncoder();
  const localFileHeaders: string[] = [];
  const centralDirectory: string[] = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = encoder.encode(file.content);
    const crc = crc32(contentBytes);

    const localHeader = [
      0x04034b50,
      20,
      0,
      0,
      0,
      0,
      crc,
      contentBytes.length,
      contentBytes.length,
      nameBytes.length,
      0,
    ]
      .map((value) => String.fromCharCode((value >>> 0) & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff))
      .join("");

    localFileHeaders.push(localHeader + String.fromCharCode(...nameBytes) + String.fromCharCode(...contentBytes));
    offset += 30 + nameBytes.length + contentBytes.length;

    const centralHeader = [
      0x02014b50,
      20,
      20,
      0,
      0,
      0,
      0,
      crc,
      contentBytes.length,
      contentBytes.length,
      nameBytes.length,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ]
      .map((value) => String.fromCharCode((value >>> 0) & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff))
      .join("");

    centralDirectory.push(centralHeader + String.fromCharCode(...nameBytes));
  });

  const endRecord = [
    0x06054b50,
    0,
    0,
    files.length,
    files.length,
    centralDirectory.join("").length,
    offset,
    0,
  ]
    .map((value) => String.fromCharCode((value >>> 0) & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff))
    .join("");

  return localFileHeaders.join("") + centralDirectory.join("") + endRecord;
}

function buildWordDocumentXml(text: string) {
  const paragraphs = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const body = paragraphs.length
    ? paragraphs
        .map((paragraph) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(paragraph)}</w:t></w:r></w:p>`)
        .join("")
    : '<w:p><w:r><w:t xml:space="preserve"></w:t></w:r></w:p>';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function localizeDigits(value: string | number, locale: string) {
  if (locale !== "fa") {
    return String(value);
  }

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

function buildNotesDocxBlob(text: string) {
  const documentXml = buildWordDocumentXml(text);
  const zipFiles = [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    },
    {
      name: "word/document.xml",
      content: documentXml,
    },
  ];

  const zipData = createSimpleZip(zipFiles);
  return new Blob([zipData], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

export default function ArticlePageView({ locale, slug }: ArticlePageViewProps) {
  const article = getLocalizedArticle(slug, locale);
  const isPersian = locale === "fa";
  const articleRef = useRef<HTMLDivElement | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [shareStatus, setShareStatus] = useState("");

  const sections = useMemo(() => {
    if (!article) return [];

    const body = article.body
      .filter((text) => text.trim().length > 0)
      .filter((text) => text.trim() !== article.title.trim());
    const referencesStart = body.findIndex(isReferencesHeading);

    return body.map((text, index) => ({
        id: `article-section-${index}`,
        kind: isReferencesHeading(text) ? "heading" : classifySection(text),
        isReference: referencesStart !== -1 && index >= referencesStart,
        text,
      }));
  }, [article]);

  if (!article) {
    return (
      <main style={{ padding: 40, fontFamily: "Vazirmatn, Tahoma, Arial, sans-serif" }}>
        <h1>{isPersian ? "مقاله یافت نشد" : "Article not found"}</h1>
        <Link href={`/${locale}/archive`} style={{ color: "#a61922" }}>
          {isPersian ? "بازگشت به آرشیو" : "Back to archive"}
        </Link>
      </main>
    );
  }

  const panelTheme = isDarkMode
    ? {
        shell: "rgba(19, 24, 29, 0.30)",
        inner: "rgba(13, 17, 22, 0.42)",
        section: "rgba(9, 13, 18, 0.10)",
        border: "rgba(255,255,255,0.12)",
        text: "#edf3ff",
        muted: "#a8b6c7",
        divider: "rgba(255,255,255,0.14)",
        strong: "#f3f7ff",
        action: "#4f8fff",
        button: "rgba(255,255,255,0.06)",
      }
    : {
        shell: "rgba(255, 255, 255, 0.38)",
        inner: "rgba(255, 255, 255, 0.60)",
        section: "rgba(255, 255, 255, 0.40)",
        border: "rgba(40, 55, 70, 0.14)",
        text: "#24313d",
        muted: "#607181",
        divider: "rgba(40, 55, 70, 0.16)",
        strong: "#17232e",
        action: "#357bd8",
        button: "rgba(255,255,255,0.46)",
      };

  const scrollToReading = () => {
    articleRef.current?.scrollBy({
      behavior: "smooth",
      top: articleRef.current.clientHeight * 0.78,
    });
  };

  const shareArticle = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus(isPersian ? "پیوند کپی شد" : "Link copied");
    } catch {
      setShareStatus(isPersian ? "کپی پیوند ممکن نشد" : "Unable to copy link");
    }
  };

  return (
    <main
      dir={isPersian ? "rtl" : "ltr"}
      style={{
        height: "100vh",
        minHeight: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundImage:
          "linear-gradient(90deg, rgba(15, 17, 19, 0.34), rgba(15, 17, 19, 0.16)), url('/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Vazirmatn, Tahoma, Arial, sans-serif",
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={scrollToReading}
        aria-label={isPersian ? "رفتن به متن مقاله" : "Scroll to the article"}
        style={{
          position: "fixed",
          left: 18,
          top: "50%",
          transform: "translateY(-50%)",
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, rgba(109, 121, 255, 0.95), rgba(57, 177, 255, 0.95))",
          boxShadow: "0 20px 40px rgba(40, 106, 255, 0.36)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 2,
        }}
      >
        <ArrowDown size={22} />
      </button>

      <div
        style={{
          width: "min(1240px, 100%)",
          height: "min(900px, calc(100vh - 48px))",
          minHeight: 0,
          borderRadius: 30,
          background: panelTheme.shell,
          border: `1px solid ${panelTheme.border}`,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "0 32px 78px rgba(7, 10, 13, 0.28)",
          padding: 18,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            background: panelTheme.inner,
            borderRadius: 24,
            border: `1px solid ${panelTheme.border}`,
            minHeight: 0,
            flex: 1,
            padding: 20,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 11,
              padding: "4px 4px 16px",
            }}
          >
            <button
              type="button"
              onClick={shareArticle}
              aria-label={isPersian ? "اشتراک‌گذاری مقاله" : "Share article"}
              style={{
                borderRadius: 999,
                border: `1px solid ${panelTheme.border}`,
                background: panelTheme.button,
                color: panelTheme.text,
                width: 40,
                height: 40,
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Share2 size={17} />
            </button>

            <span role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>
              {shareStatus}
            </span>

            <button
              type="button"
              aria-label={isPersian ? "تغییر پوسته" : "Toggle theme"}
              onClick={() => setIsDarkMode((current) => !current)}
              style={{
                borderRadius: 999,
                border: `1px solid ${panelTheme.border}`,
                background: panelTheme.button,
                width: 132,
                height: 40,
                padding: "4px 9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                color: panelTheme.text,
              }}
            >
              <SunMedium size={16} style={{ opacity: isDarkMode ? 0.35 : 1 }} />
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: isDarkMode ? "rgba(255,255,255,0.9)" : "#357bd8",
                  color: isDarkMode ? "#1a1d22" : "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                }}
              >
                {isDarkMode ? <MoonStar size={14} /> : <SunMedium size={14} />}
              </span>
              <MoonStar size={16} style={{ opacity: isDarkMode ? 1 : 0.35 }} />
            </button>

            <Link
              href={`/${locale}/archive`}
              aria-label={isPersian ? "بازگشت به آرشیو" : "Return to archive"}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: `1px solid ${panelTheme.border}`,
                background: panelTheme.button,
                color: panelTheme.text,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <X size={16} />
            </Link>
          </header>

          <section
            ref={articleRef}
            style={{
              background: panelTheme.section,
              borderRadius: 22,
              border: `1px solid ${panelTheme.border}`,
              padding: 28,
              minHeight: 0,
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(88, 170, 255, 0.9) rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(2.3rem, 3.5vw, 4.1rem)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.05em",
                  fontWeight: 700,
                  color: panelTheme.strong,
                }}
              >
                {article.title}
              </h1>

              <div style={{ height: 1, background: panelTheme.divider, margin: "20px 0 28px" }} />

              <article style={{ color: panelTheme.text, fontSize: 17, lineHeight: 1.9 }}>
                {sections.map((section) => {
                  if (section.kind === "heading") {
                    return (
                      <h2
                        key={section.id}
                        style={{
                          margin: "24px 0 12px",
                          color: panelTheme.strong,
                          fontSize: "1.25rem",
                          fontWeight: 700,
                          lineHeight: 1.4,
                          ...(section.isReference ? { direction: "ltr", textAlign: "left" as const } : {}),
                        }}
                      >
                        {section.text}
                      </h2>
                    );
                  }

                  return (
                    <p key={section.id} style={{ margin: "0 0 18px", color: panelTheme.text, ...(section.isReference ? { direction: "ltr", textAlign: "left" as const } : {}) }}>
                      {section.text}
                    </p>
                  );
                })}
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
