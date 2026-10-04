import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRecord, parseJsonBody } from "@/lib/request-validation";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, 16 * 1024);
  if (!parsed.ok || !isRecord(parsed.value)) {
    return Response.json({ message: "A valid registration request is required." }, { status: parsed.ok ? 400 : parsed.status, headers: { "Cache-Control": "no-store" } });
  }
  const body = parsed.value;
  if ((body.email !== undefined && typeof body.email !== "string")
    || (body.username !== undefined && typeof body.username !== "string")
    || (body.name !== undefined && typeof body.name !== "string")
    || typeof body.password !== "string") {
    return Response.json({ message: "A valid registration request is required." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const rawEmail = (body.email || "").trim();
  const username = (body.username || "").trim();
  const name = (body.name || "").trim();
  const password = body.password.trim();

  const email = rawEmail
    ? rawEmail.toLowerCase()
    : username
    ? `${username.toLowerCase().replace(/[^a-z0-9]/g, "") || "user"}@example.com`
    : "";

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
    return Response.json({ message: "A valid email and password are required." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  if (name.length > 120 || username.length > 120 || password.length < 6 || Buffer.byteLength(password, "utf8") > 72) {
    return Response.json({ message: "Enter a name up to 120 characters and a password between 6 and 72 bytes." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ message: "A user already exists with this email." }, { status: 409, headers: { "Cache-Control": "no-store" } });
  }

  const passwordHash = await hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name: name || username || undefined,
      passwordHash,
    },
  });

  return Response.json({ success: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
