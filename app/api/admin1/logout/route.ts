import { clearAdmin1SessionCookie } from "@/lib/admin1-auth";
import { isSameOriginRequest } from "@/lib/request-validation";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "درخواست معتبر نیست." }, { status: 403 });
  }

  return Response.json(
    { success: true },
    { headers: { "Set-Cookie": clearAdmin1SessionCookie(), "Cache-Control": "no-store" } },
  );
}
