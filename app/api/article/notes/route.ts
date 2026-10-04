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

  const notes = await prisma.articleNote.findMany({
    where: { user: { email: session.user.email } },
    include: { group: true },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json({ notes }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Cross-origin request denied." }, { status: 403, headers: { "Cache-Control": "no-store" } });

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const parsed = await parseJsonBody(request, 64 * 1024);
  if (!parsed.ok || !isRecord(parsed.value)) {
    return Response.json({ error: "Invalid payload" }, { status: parsed.ok ? 400 : parsed.status, headers: { "Cache-Control": "no-store" } });
  }
  const { articleSlug, content } = parsed.value;
  const groupId = typeof parsed.value.groupId === "string" ? parsed.value.groupId.trim() : undefined;
  if (typeof articleSlug !== "string" || !articles.some((article) => article.slug === articleSlug)
    || typeof content !== "string" || !content.trim() || content.length > 50000
    || (parsed.value.groupId !== undefined && typeof parsed.value.groupId !== "string")) {
    return Response.json({ error: "Invalid payload" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (groupId) {
    const group = await prisma.noteGroup.findFirst({ where: { id: groupId, userId: user.id }, select: { id: true } });
    if (!group) return Response.json({ error: "Invalid note group." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const note = await prisma.articleNote.create({
    data: {
      userId: user.id,
      articleSlug,
      content,
      groupId,
    },
  });

  return Response.json({ note }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
