"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { articles } from "@/lib/articles";

type QueueItem = {
  id: string;
  type: "post" | "reply";
  articleSlug: string;
  content: string;
  name: string;
  email: string;
  createdAt: string;
  parentContent?: string;
  parentName?: string;
};

const articleTitles = Object.fromEntries(articles.map((article) => [article.slug, article.title.fa]));

export default function Admin1Dashboard() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadQueue = useCallback(async () => {
    try {
      const response = await fetch("/api/admin1/posts", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (response.status === 401) {
        setAuthenticated(false);
        setItems([]);
        return;
      }
      if (!response.ok) throw new Error(data?.error ?? "دریافت دیدگاه‌ها از سرور ممکن نشد.");
      setAuthenticated(true);
      setItems(data.items as QueueItem[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "دریافت دیدگاه‌ها از سرور ممکن نشد.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadQueue(), 0);
    return () => window.clearTimeout(timer);
  }, [loadQueue]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "ورود به مدیریت ممکن نشد.");
      setPassword("");
      setAuthenticated(true);
      await loadQueue();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ورود به مدیریت ممکن نشد.");
      setLoading(false);
    }
  };

  const moderate = async (item: QueueItem, action: "approve" | "reject") => {
    setWorkingId(item.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin1/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, type: item.type, action }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "به‌روزرسانی وضعیت دیدگاه ممکن نشد.");
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      setNotice(action === "approve" ? "دیدگاه تأیید و منتشر شد." : "دیدگاه رد شد.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "به‌روزرسانی وضعیت دیدگاه ممکن نشد.");
    } finally {
      setWorkingId(null);
    }
  };

  const logout = async () => {
    const response = await fetch("/api/admin1/logout", { method: "POST" });
    if (!response.ok) {
      setError("خروج از مدیریت ممکن نشد.");
      return;
    }
    setAuthenticated(false);
    setItems([]);
  };

  return (
    <main className="admin1-page" dir="rtl">
      <section className="admin1-panel">
        <header className="admin1-header">
          <div><p>دانشنامه اقتصاد اجتماعی</p><h1>مدیریت حاشیه‌نگار</h1></div>
          {authenticated ? <button type="button" onClick={() => void logout()}>خروج</button> : null}
        </header>

        {!authenticated ? (
          <form className="admin1-login" onSubmit={login}>
            <p>برای دیدن و بررسی دیدگاه‌های تازه وارد شوید.</p>
            <label>نام کاربری<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /></label>
            <label>گذرواژه<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
            <button type="submit" disabled={loading}>{loading ? "در حال بررسی..." : "ورود"}</button>
          </form>
        ) : (
          <section className="admin1-queue" aria-live="polite">
            <div className="admin1-queue-heading"><h2>در انتظار بررسی</h2><button type="button" onClick={() => { setError(""); setLoading(true); void loadQueue(); }} disabled={loading}>به‌روزرسانی</button></div>
            {loading ? <p className="admin1-empty">در حال دریافت دیدگاه‌ها...</p> : items.length === 0 ? <p className="admin1-empty">دیدگاه در انتظار بررسی وجود ندارد.</p> : items.map((item) => (
              <article className="admin1-item" key={`${item.type}-${item.id}`}>
                <div className="admin1-meta"><strong>{item.name}</strong><a href={`mailto:${encodeURIComponent(item.email)}`}>{item.email}</a><time>{new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</time></div>
                <p className="admin1-context">{item.type === "reply" ? `پاسخ به دیدگاه ${item.parentName} · ${item.parentContent}` : `مدخل: ${articleTitles[item.articleSlug] ?? item.articleSlug}`}</p>
                <p className="admin1-content">{item.content}</p>
                <div className="admin1-actions">
                  <button type="button" className="approve" onClick={() => void moderate(item, "approve")} disabled={workingId === item.id}>{workingId === item.id ? "در حال ثبت..." : "تأیید و انتشار"}</button>
                  <button type="button" className="reject" onClick={() => void moderate(item, "reject")} disabled={workingId === item.id}>رد دیدگاه</button>
                </div>
              </article>
            ))}
          </section>
        )}
        {error ? <p className="admin1-message error" role="alert">{error}</p> : null}
        {notice ? <p className="admin1-message success" role="status">{notice}</p> : null}
      </section>
    </main>
  );
}
