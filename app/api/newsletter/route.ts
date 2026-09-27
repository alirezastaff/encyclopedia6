import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown } | null;
  if (typeof body?.email !== "string") {
    return Response.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "A valid email address is required." }, { status: 400 });
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  return Response.json({ success: true }, { status: 201 });
}