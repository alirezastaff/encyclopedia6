import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date().toISOString();

  const payload = {
    ok: true,
    timestamp: now,
    uptime: process.uptime(),
    app: "sse-encyclopedia",
    database: "not-configured",
  };

  if (!process.env.DATABASE_URL) {
    return Response.json({ ...payload, ok: false, reason: "DATABASE_URL is not configured." }, { status: 503 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    payload.database = "connected";
    return Response.json(payload, { status: 200 });
  } catch (error) {
    payload.ok = false;
    payload.database = "unavailable";
    return Response.json(
      {
        ...payload,
        reason: error instanceof Error ? error.message : "Database is not reachable.",
      },
      { status: 503 }
    );
  }
}
