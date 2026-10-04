import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { articles } from "@/lib/articles";
import { isRecord, isSameOriginRequest, parseJsonBody } from "@/lib/request-validation";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const [bookmarks, readingList, progress, groups, notes, highlights] = await Promise.all([
    prisma.bookmark.findMany({ where: { user: { email: session.user.email } } }),
    prisma.readingListItem.findMany({ where: { user: { email: session.user.email } } }),
    prisma.readingProgress.findMany({ where: { user: { email: session.user.email } } }),
    prisma.noteGroup.findMany({ where: { user: { email: session.user.email } } }),
    prisma.articleNote.findMany({ where: { user: { email: session.user.email } } }),
    prisma.textHighlight.findMany({ where: { user: { email: session.user.email } } }),
  ]);

  return Response.json({ bookmarks, readingList, progress, groups, notes, highlights }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Cross-origin request denied." }, { status: 403, headers: { "Cache-Control": "no-store" } });

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const parsed = await parseJsonBody(request, 32 * 1024);
  if (!parsed.ok || !isRecord(parsed.value)) {
    return Response.json({ error: "Invalid payload" }, { status: parsed.ok ? 400 : parsed.status, headers: { "Cache-Control": "no-store" } });
  }
  const { action, payload } = parsed.value;

  if (typeof action !== "string" || !isRecord(payload)) {
    return new Response(JSON.stringify({ error: "Action required" }), { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  switch (action) {
    case "toggleBookmark":
      if (typeof payload.articleSlug !== "string" || !articles.some((article) => article.slug === payload.articleSlug)) {
        return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
      }
      const existing = await prisma.bookmark.findUnique({ where: { userId_articleSlug: { userId: user.id, articleSlug: payload.articleSlug } } });
      if (existing) {
        await prisma.bookmark.delete({ where: { id: existing.id } });
      } else {
        await prisma.bookmark.create({ data: { userId: user.id, articleSlug: payload.articleSlug } });
      }
      return new Response(JSON.stringify({ success: true }));

    case "toggleReadingList":
      if (typeof payload.articleSlug !== "string" || !articles.some((article) => article.slug === payload.articleSlug)) {
        return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
      }
      const existingItem = await prisma.readingListItem.findUnique({ where: { userId_articleSlug: { userId: user.id, articleSlug: payload.articleSlug } } });
      if (existingItem) {
        await prisma.readingListItem.delete({ where: { id: existingItem.id } });
      } else {
        await prisma.readingListItem.create({ data: { userId: user.id, articleSlug: payload.articleSlug, status: "to-read" } });
      }
      return new Response(JSON.stringify({ success: true }));

    case "updateStatus":
      if (typeof payload.articleSlug !== "string" || !articles.some((article) => article.slug === payload.articleSlug)
        || !["to-read", "reading", "completed"].includes(String(payload.status))) {
        return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
      }
      await prisma.readingListItem.upsert({
        where: { userId_articleSlug: { userId: user.id, articleSlug: payload.articleSlug } },
        update: { status: payload.status as string },
        create: { userId: user.id, articleSlug: payload.articleSlug, status: payload.status as string },
      });
      return new Response(JSON.stringify({ success: true }));

    case "saveProgress":
      if (typeof payload.articleSlug !== "string" || !articles.some((article) => article.slug === payload.articleSlug)
        || typeof payload.scrollPosition !== "number" || !Number.isSafeInteger(payload.scrollPosition)
        || payload.scrollPosition < 0 || payload.scrollPosition > 5_000_000) {
        return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
      }
      await prisma.readingProgress.upsert({
        where: { userId_articleSlug: { userId: user.id, articleSlug: payload.articleSlug } },
        update: { scrollPosition: payload.scrollPosition },
        create: { userId: user.id, articleSlug: payload.articleSlug, scrollPosition: payload.scrollPosition },
      });
      return new Response(JSON.stringify({ success: true }));

    default:
      return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400 });
  }
}
