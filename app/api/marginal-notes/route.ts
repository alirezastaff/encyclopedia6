import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { articles } from "@/lib/articles";
import { getServerSession } from "next-auth";
import { isRecord, parseJsonBody } from "@/lib/request-validation";

const postKinds = new Set(["comment", "question", "critique", "proposal", "experience", "reference"]);
const maxContentLength = 12000;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function validEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validArticleSlug(slug: string) { return articles.some((article) => article.slug === slug); }

function publicPost(post: {
  id: string; articleSlug: string; content: string; kind: string; guestName: string; createdAt: Date;
  replies: Array<{ id: string; content: string; guestName: string; createdAt: Date }>;
}) {
  return {
    id: post.id,
    articleSlug: post.articleSlug,
    content: post.content,
    kind: post.kind,
    name: post.guestName,
    createdAt: post.createdAt,
    replies: post.replies.map((reply) => ({ id: reply.id, content: reply.content, name: reply.guestName, createdAt: reply.createdAt })),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const articleSlug = url.searchParams.get("article")?.trim() || undefined;
  const kind = url.searchParams.get("kind")?.trim() || undefined;
  const search = url.searchParams.get("q")?.trim() || undefined;
  if (search && search.length > 120) return json({ error: "Search query is too long." }, 400);
  const posts = await prisma.marginalPost.findMany({
    where: {
      status: "published",
      ...(articleSlug && validArticleSlug(articleSlug) ? { articleSlug } : {}),
      ...(kind && postKinds.has(kind) ? { kind } : {}),
      ...(search ? { content: { contains: search } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 100,
    include: { replies: { where: { status: "published" }, orderBy: { publishedAt: "asc" } } },
  });
  return json({ posts: posts.map(publicPost) });
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, 64 * 1024);
  if (!parsed.ok || !isRecord(parsed.value)) return json({ error: "بدنه درخواست معتبر نیست." }, parsed.ok ? 400 : parsed.status);

  const session = await getServerSession(authOptions);
  const input = parsed.value;
  const content = typeof input.content === "string" ? input.content.trim() : "";
  const articleSlug = typeof input.articleSlug === "string" ? input.articleSlug.trim() : "";
  const kind = typeof input.kind === "string" && postKinds.has(input.kind) ? input.kind : "comment";
  const replyToId = typeof input.replyToId === "string" ? input.replyToId.trim() : "";
  const sessionEmail = session?.user?.email?.trim().toLowerCase() || "";
  const sessionName = session?.user?.name?.trim() || "";
  const name = sessionName || (typeof input.name === "string" ? input.name.trim() : "");
  const email = sessionEmail || (typeof input.email === "string" ? input.email.trim().toLowerCase() : "");

  if (!name || name.length > 120) return json({ error: "نام معتبر الزامی است." }, 400);
  if (!validEmail(email)) return json({ error: "ایمیل معتبر الزامی است." }, 400);
  if (!content || content.length > maxContentLength) return json({ error: "متن دیدگاه باید بین ۱ تا ۱۲۰۰۰ نویسه باشد." }, 400);
  if (!articleSlug || !validArticleSlug(articleSlug)) return json({ error: "انتخاب یک مدخل معتبر الزامی است." }, 400);

  const user = sessionEmail ? await prisma.user.findUnique({ where: { email: sessionEmail } }) : null;
  if (replyToId) {
    const parent = await prisma.marginalPost.findUnique({ where: { id: replyToId } });
    if (!parent || parent.status !== "published" || parent.articleSlug !== articleSlug) return json({ error: "گفت‌وگوی موردنظر یافت نشد." }, 404);
    const reply = await prisma.marginalReply.create({ data: { postId: parent.id, userId: user?.id, content, guestName: name, guestEmail: email, status: "pending" } });
    return json({ reply: { id: reply.id, status: reply.status } }, 201);
  }

  const post = await prisma.marginalPost.create({ data: { userId: user?.id, articleSlug, content, kind, guestName: name, guestEmail: email, status: "pending" } });
  return json({ post: { id: post.id, status: post.status } }, 201);
}
