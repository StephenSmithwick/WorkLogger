import { Hono, MiddlewareHandler, Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { googleAuth } from "@hono/oauth-providers/google";
import { sign, jwt, type JwtVariables, verify } from "hono/jwt";
import { noAuth } from "@/noAuthHandler";
import { env } from "cloudflare:workers";

const AUTH_TOKEN = "auth_token";
const AUTH_PATH = "/auth/google";
const JWT_PAYLOAD = "jwtPayload";
const GOOGLE_AUTH_VARIABLE = "user-google";

const alg = "HS256";

export interface User {
  sub: string;
  name: string;
  email?: string;
  exp: number;
}

interface AuthenticatorUser {
  id: string;
  name: string;
  email: string;
}

export const authUser = (c: Context) => c.get(JWT_PAYLOAD) as User;

const useAuth =
  import.meta.env.PROD ||
  (env.GOOGLE_ID !== undefined && env.GOOGLE_ID !== undefined);
console.log("useAuth", useAuth);
const authenticator = useAuth
  ? googleAuth({
      client_id: env.GOOGLE_ID,
      client_secret: env.GOOGLE_SECRET,
      scope: ["openid", "email", "profile"],
    })
  : noAuth<AuthenticatorUser>(GOOGLE_AUTH_VARIABLE, {
      id: "dev",
      name: "Developer",
      email: "dev@example.com",
    });

export const googleAuthentication = new Hono<{
  Bindings: CloudflareBindings;
}>()
  .use(AUTH_PATH, authenticator)
  .get(AUTH_PATH, async (c) => {
    const user = c.get(GOOGLE_AUTH_VARIABLE);

    if (!user) {
      return c.text("Google authentication failed", 401);
    }

    const payload = {
      sub: user.id!,
      email: user.email!,
      name: user.name!,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    setCookie(c, AUTH_TOKEN, token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return c.redirect("/");
  });

/**
 * Checks for jwt auth_token and fails if not found
 */
export const requireAuthCookie: MiddlewareHandler = (c, next) =>
  jwt({ secret: c.env.JWT_SECRET, alg, cookie: AUTH_TOKEN })(c, next);

/**
 * Checks for jwt auth_token and redirects to auth page if not found
 */
export const requireAuthPage: MiddlewareHandler = async (c, next) => {
  try {
    const token = getCookie(c, AUTH_TOKEN);
    const payload = await verify(token!, c.env.JWT_SECRET, alg);
    c.set(JWT_PAYLOAD, payload);
    return await next();
  } catch (error) {
    return c.redirect(AUTH_PATH);
  }
};
