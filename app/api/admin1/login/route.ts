import { isRecord, isSameOriginRequest, parseJsonBody } from "@/lib/request-validation";
import {
  admin1IsConfigured,
  createAdmin1SessionCookie,
  verifyAdmin1Credentials,
} from "@/lib/admin1-auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "درخواست معتبر نیست." }, { status: 403 });
  }

  if (!admin1IsConfigured()) {
    return Response.json({ error: "ورود مدیریت هنوز در تنظیمات سرور فعال نشده است." }, { status: 503 });
  }

  const parsed = await parseJsonBody(request, 4 * 1024);
  if (!parsed.ok || !isRecord(parsed.value)) {
    return Response.json({ error: "نام کاربری و گذرواژه را وارد کنید." }, { status: parsed.ok ? 400 : parsed.status });
  }

  const username = typeof parsed.value.username === "string" ? parsed.value.username : "";
  const password = typeof parsed.value.password === "string" ? parsed.value.password : "";
  if (!verifyAdmin1Credentials(username, password)) {
    return Response.json({ error: "نام کاربری یا گذرواژه نادرست است." }, { status: 401 });
  }

  return Response.json(
    { success: true },
    { headers: { "Set-Cookie": createAdmin1SessionCookie(), "Cache-Control": "no-store" } },
  );
}
