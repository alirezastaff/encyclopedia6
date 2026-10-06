import { prisma } from "@/lib/prisma";
import { hasAdmin1Session } from "@/lib/admin1-auth";
import { isRecord, isSameOriginRequest, parseJsonBody } from "@/lib/request-validation";

function unauthorized() {
  return Response.json({ error: "برای ادامه وارد مدیریت شوید." }, { status: 401, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  if (!hasAdmin1Session(request)) return unauthorized();

  const [posts, replies] = await Promise.all([
    prisma.marginalPost.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, articleSlug: true, content: true, guestName: true, guestEmail: true, createdAt: true },
    }),
    prisma.marginalReply.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { post: { select: { id: true, articleSlug: true, content: true, guestName: true } } },
    }),
  ]);

  const items = [
    ...posts.map((post) => ({
      id: post.id,
      type: "post" as const,
      articleSlug: post.articleSlug,
      content: post.content,
      name: post.guestName,
      email: post.guestEmail,
      createdAt: post.createdAt,
    })),
    ...replies.map((reply) => ({
      id: reply.id,
      type: "reply" as const,
      articleSlug: reply.post.articleSlug,
      content: reply.content,
      name: reply.guestName,
      email: reply.guestEmail,
      createdAt: reply.createdAt,
      parentContent: reply.post.content,
      parentName: reply.post.guestName,
    })),
  ].sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime());

  return Response.json({ items }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "درخواست معتبر نیست." }, { status: 403 });
  }
  if (!hasAdmin1Session(request)) return unauthorized();

  const parsed = await parseJsonBody(request, 4 * 1024);
  if (!parsed.ok || !isRecord(parsed.value)) {
    return Response.json({ error: "درخواست معتبر نیست." }, { status: parsed.ok ? 400 : parsed.status });
  }

  const { id, type, action } = parsed.value;
  if (typeof id !== "string" || !id.trim() || (type !== "post" && type !== "reply") ||
      (action !== "approve" && action !== "reject")) {
    return Response.json({ error: "درخواست معتبر نیست." }, { status: 400 });
  }

  const now = new Date();
  const data = action === "approve"
    ? { status: "published", publishedAt: now }
    : { status: "rejected", publishedAt: null };
  const result = type === "post"
    ? await prisma.marginalPost.updateMany({ where: { id, status: "pending" }, data })
    : await prisma.marginalReply.updateMany({ where: { id, status: "pending" }, data });

  if (result.count === 0) {
    return Response.json({ error: "این مورد دیگر در انتظار بررسی نیست." }, { status: 404 });
  }

  return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
