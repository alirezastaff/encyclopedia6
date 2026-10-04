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

  const highlights = await prisma.textHighlight.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ highlights }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Cross-origin request denied." }, { status: 403, headers: { "Cache-Control": "no-store" } });

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const parsed = await parseJsonBody(request, 128 * 1024);
  if (!parsed.ok || !isRecord(parsed.value)) {
    return Response.json({ error: "Invalid payload" }, { status: parsed.ok ? 400 : parsed.status, headers: { "Cache-Control": "no-store" } });
  }
  const { articleSlug, sectionId, text, note } = parsed.value;
  if (typeof articleSlug !== "string" || !articles.some((article) => article.slug === articleSlug)
    || typeof text !== "string" || !text.trim() || text.length > 50000
    || (sectionId !== undefined && (typeof sectionId !== "string" || sectionId.length > 180))
    || (note !== undefined && (typeof note !== "string" || note.length > 10000))) {
    return Response.json({ error: "Invalid payload" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const highlight = await prisma.textHighlight.create({
    data: {
      userId: user.id,
      articleSlug,
      sectionId,
      text,
      note,
    },
  });

  return Response.json({ highlight }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
