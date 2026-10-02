import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown; fullName?: unknown; phone?: unknown } | null;
  if (typeof body?.email !== "string") {
    return Response.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const hasMemberDetails = body.fullName !== undefined || body.phone !== undefined;
  let memberDetails: { fullName: string; phone: string } | undefined;

  if (hasMemberDetails) {
    if (typeof body.fullName !== "string" || typeof body.phone !== "string") {
      return Response.json({ error: "Name and phone number are required." }, { status: 400 });
    }

    const fullName = body.fullName.trim();
    const phone = body.phone
      .trim()
      .replace(/[۰-۹]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0x06f0 + 0x30))
      .replace(/[٠-٩]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0x0660 + 0x30))
      .replace(/[\s()-]/g, "");

    if (fullName.length < 2 || fullName.length > 120) {
      return Response.json({ error: "Enter a valid full name." }, { status: 400 });
    }
    if (!/^\+?[0-9]{7,15}$/.test(phone)) {
      return Response.json({ error: "Enter a valid phone number." }, { status: 400 });
    }

    memberDetails = { fullName, phone };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email, ...(memberDetails ?? {}) },
    update: memberDetails ?? {},
  });

  return Response.json({ success: true }, { status: 201 });
}