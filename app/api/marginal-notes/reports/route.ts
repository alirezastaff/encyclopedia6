import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { isRecord, parseJsonBody } from "@/lib/request-validation";

const reasons = new Set(["spam", "abuse", "off-topic", "privacy", "other"]);

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, 8 * 1024);
  if (!parsed.ok || !isRecord(parsed.value)) {
    return Response.json({ error: "Invalid request." }, { status: parsed.ok ? 400 : parsed.status, headers: { "Cache-Control": "no-store" } });
  }
  const input = parsed.value;
  const postId = typeof input.postId === "string" ? input.postId.trim() : "";
  const reason = typeof input.reason === "string" && reasons.has(input.reason) ? input.reason : "other";
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase() || (typeof input.email === "string" ? input.email.trim().toLowerCase() : "");
  if (!postId || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return new Response(JSON.stringify({ error: "Post and valid email are required." }), { status: 400 });
  const post = await prisma.marginalPost.findUnique({ where: { id: postId } });
  if (!post || post.status !== "published") return new Response(JSON.stringify({ error: "Post not found." }), { status: 404 });
  const reporter = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email } }) : null;
  await prisma.marginalReport.create({ data: { postId, reporterId: reporter?.id, reporterEmail: email, reason } });
  return new Response(JSON.stringify({ success: true }), { status: 201 });
}
