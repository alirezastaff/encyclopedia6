"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { articles } from "@/lib/articles";

type Reply = { id: string; content: string; name: string; createdAt: string };
type Post = { id: string; articleSlug: string; content: string; kind: string; name: string; createdAt: string; replies: Reply[] };

const kinds = [
  ["comment", "دیدگاه"], ["question", "پرسش"], ["critique", "نقد"],
  ["proposal", "پیشنهاد"], ["experience", "تجربه"], ["reference", "ارجاع پژوهشی"],
] as const;

const articleTitles = Object.fromEntries(articles.map((article) => [article.slug, article.title.fa]));
const formatDate = (value: string) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function MarginalNotesFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [articleSlug, setArticleSlug] = useState(articles[0]?.slug ?? "");
  const [kind, setKind] = useState("comment");
  const [filterKind, setFilterKind] = useState("all");
  const [query, setQuery] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/marginal-notes?q=${encodeURIComponent(query)}`, { cache: "no-store" });
        const data = await response.json();
        setPosts(data.posts ?? []);
      } catch {
        setMessage({ type: "error", text: "بارگذاری گفتگوها ممکن نشد." });
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const visiblePosts = useMemo(() => posts.filter((post) => filterKind === "all" || post.kind === filterKind), [posts, filterKind]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setPosting(true);
    try {
      const response = await fetch("/api/marginal-notes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, articleSlug, kind, content }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "ارسال دیدگاه ممکن نشد.");
      setContent("");
      setMessage({ type: "success", text: "دیدگاه شما ثبت شد و پس از بررسی منتشر می‌شود." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "ارسال دیدگاه ممکن نشد." });
    } finally {
      setPosting(false);
    }
  };

  const submitReply = async (post: Post) => {
    if (!replyContent.trim()) return;
    setPosting(true);
    try {
      const response = await fetch("/api/marginal-notes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, articleSlug: post.articleSlug, content: replyContent, replyToId: post.id }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "ارسال پاسخ ممکن نشد.");
      setReplyContent(""); setReplyFor(null);
      setMessage({ type: "success", text: "پاسخ شما ثبت شد و پس از بررسی در گفتگو قرار می‌گیرد." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "ارسال پاسخ ممکن نشد." });
    } finally {
      setPosting(false);
    }
  };

  return (
    <main className="marginal-page" dir="rtl">
      <div className="marginal-app-shell">
        <aside className="marginal-sidebar">
          <Link className="marginal-brand" href="/fa"><span className="marginal-brand-mark">ح</span><span><strong>حاشیه نگار</strong><small>دانشنامه اقتصاد اجتماعی</small></span></Link>
          <nav className="marginal-nav" aria-label="ناوبری حاشیه نگار">
            <Link className="active" href="/profile"><span>⌂</span> خانه</Link>
            <a href="#marginal-feed-title"><span>◉</span> گفتگوهای تازه</a>
            <a href="#marginal-compose"><span>✎</span> نوشتن دیدگاه</a>
            <Link href="/fa/archive"><span>▤</span> آرشیو مدخل‌ها</Link>
          </nav>
          <div className="marginal-sidebar-note"><span>●</span><div><strong>حاشیه نگار چیست؟</strong><p>فضایی برای پژوهشگران و علاقمندان است تا ایده های خود را به مدخلهای پژوهشی پیوند بزنند و فضای گفت و گو پیرامون مسائل کلیدی در حوزه اقتصاد اجتماعی و همبستگی را توسعه دهند.</p></div></div>
          <Link className="marginal-home-link" href="/fa">← بازگشت به دانشنامه</Link>
        </aside>

        <section className="marginal-main-column">
          <header className="marginal-topbar"><div><p className="marginal-kicker">فضای گفت‌وگوی دانشنامه</p><h1>حاشیه نگار</h1></div><button type="button" className="marginal-top-avatar" aria-label="حساب کاربری">م</button></header>
          <div className="marginal-tabs"><button type="button" className="active">برای شما</button><button type="button">پربحث ترین ها</button><button type="button">پرسش‌ها</button></div>

          <section className="marginal-compose" id="marginal-compose">
            <div className="marginal-composer-avatar">م</div>
            <div className="marginal-composer-body">
              <h2>چه چیزی در ذهن شماست؟</h2>
              <p className="marginal-composer-hint">یک مدخل مرتبط را انتخاب کنید و دیدگاه پژوهشی خود را با جامعه در میان بگذارید.</p>
            <form onSubmit={submit} className="marginal-form">
              <textarea className="marginal-composer-text" value={content} onChange={(event) => setContent(event.target.value)} required maxLength={12000} rows={3} placeholder="پیشنهاد، پرسش، نقد یا تجربه خود را بنویسید..." />
              <div className="marginal-composer-fields"><label>انتخاب مدخل مرتبط<select value={articleSlug} onChange={(event) => setArticleSlug(event.target.value)} required>{articles.map((article) => <option key={article.slug} value={article.slug}>{article.title.fa}</option>)}</select></label><label>نوع دیدگاه<select value={kind} onChange={(event) => setKind(event.target.value)}>{kinds.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
              <div className="marginal-identity"><strong>مشخصات شما برای ثبت دیدگاه</strong><div><label>نام<input value={firstName} onChange={(event) => setFirstName(event.target.value)} required maxLength={60} autoComplete="given-name" /></label><label>نام خانوادگی<input value={lastName} onChange={(event) => setLastName(event.target.value)} required maxLength={60} autoComplete="family-name" /></label><label>ایمیل<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} dir="ltr" autoComplete="email" /></label></div><small>ایمیل شما در سایت نمایش داده نمی‌شود.</small></div>
              <div className="marginal-form-foot"><small>{content.length.toLocaleString("fa-IR")} / ۱۲۰۰۰ نویسه · بدون فایل و تصویر</small><button type="submit" disabled={posting}>{posting ? "در حال ارسال..." : "انتشار دیدگاه"}</button></div>
            </form>
            {message ? <div className={`marginal-message ${message.type}`} role="status">{message.text}</div> : null}
            </div>
          </section>

          <section className="marginal-feed" aria-labelledby="marginal-feed-title">
            <div className="marginal-feed-heading"><div><h2 id="marginal-feed-title">آخرین حاشیه‌ها</h2></div><span className="marginal-count">{visiblePosts.length.toLocaleString("fa-IR")} گفتگو</span></div>
            <div className="marginal-toolbar"><label className="marginal-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو در دیدگاه‌ها" /></label><select value={filterKind} onChange={(event) => setFilterKind(event.target.value)} aria-label="فیلتر نوع دیدگاه"><option value="all">همه انواع</option>{kinds.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            {loading ? <div className="marginal-empty">در حال بارگذاری گفتگوها...</div> : visiblePosts.length === 0 ? <div className="marginal-empty"><strong>هنوز گفتگویی منتشر نشده است.</strong><span>اولین دیدگاه را درباره یکی از مدخل‌های دانشنامه بنویسید.</span></div> : <div className="marginal-posts">{visiblePosts.map((post) => <article className="marginal-post" key={post.id}>
              <div className="marginal-post-meta"><span className="marginal-post-avatar">{post.name.slice(0, 1)}</span><div><strong>{post.name}</strong><span className="marginal-handle"> · پژوهشگر حاشیه نگار</span><time dateTime={post.createdAt}> · {formatDate(post.createdAt)}</time></div><span className="marginal-type">{kinds.find(([value]) => value === post.kind)?.[1] ?? "دیدگاه"}</span></div>
              <p className="marginal-post-content">{post.content}</p>
              <Link className="marginal-pinned" href={`/fa/articles/${post.articleSlug}`}><span>پین‌شده به مدخل</span><strong>{articleTitles[post.articleSlug] ?? post.articleSlug}</strong><i>←</i></Link>
              <div className="marginal-post-actions"><span>{post.replies.length.toLocaleString("fa-IR")} پاسخ</span><button type="button" onClick={() => setReplyFor(replyFor === post.id ? null : post.id)}>پاسخ دادن</button></div>
              {post.replies.length > 0 ? <div className="marginal-replies">{post.replies.map((reply) => <div className="marginal-reply" key={reply.id}><strong>{reply.name}</strong><time>{formatDate(reply.createdAt)}</time><p>{reply.content}</p></div>)}</div> : null}
              {replyFor === post.id ? <div className="marginal-reply-form"><textarea value={replyContent} onChange={(event) => setReplyContent(event.target.value)} rows={3} placeholder="پاسخ خود را بنویسید..." /><button type="button" onClick={() => void submitReply(post)} disabled={posting}>ارسال پاسخ</button></div> : null}
            </article>)}</div>}
          </section>
        </section>
      </div>
    </main>
  );
}
