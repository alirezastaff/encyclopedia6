import { createHmac, timingSafeEqual } from "node:crypto";

export const admin1CookieName = "sse_admin1_session";
const sessionLifetimeSeconds = 8 * 60 * 60;

function getAdminConfig() {
  const username = process.env.ADMIN1_USERNAME?.trim() ?? "";
  const password = process.env.ADMIN1_PASSWORD ?? "";
  const secret = process.env.NEXTAUTH_SECRET ?? "";

  if (!username || password.length < 12 || secret.length < 32) return null;
  return { username, password, secret };
}

function equalSecret(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function signature(expiresAt: string, secret: string) {
  return createHmac("sha256", secret).update(expiresAt).digest("base64url");
}

export function admin1IsConfigured() {
  return getAdminConfig() !== null;
}

export function verifyAdmin1Credentials(username: string, password: string) {
  const config = getAdminConfig();
  if (!config) return false;
  const validUsername = equalSecret(config.username, username.trim());
  const validPassword = equalSecret(config.password, password);
  return validUsername && validPassword;
}

export function createAdmin1SessionCookie() {
  const config = getAdminConfig();
  if (!config) throw new Error("Admin1 authentication is not configured.");

  const expiresAt = String(Math.floor(Date.now() / 1000) + sessionLifetimeSeconds);
  const value = `${expiresAt}.${signature(expiresAt, config.secret)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${admin1CookieName}=${value}; Path=/api/admin1; HttpOnly; SameSite=Strict; Max-Age=${sessionLifetimeSeconds}${secure}`;
}

export function clearAdmin1SessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${admin1CookieName}=; Path=/api/admin1; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function hasAdmin1Session(request: Request) {
  const config = getAdminConfig();
  if (!config) return false;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${admin1CookieName}=`));
  if (!cookie) return false;

  const value = cookie.slice(admin1CookieName.length + 1);
  const [expiresAt, providedSignature, extra] = value.split(".");
  if (!expiresAt || !providedSignature || extra || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  return equalSecret(signature(expiresAt, config.secret), providedSignature);
}
