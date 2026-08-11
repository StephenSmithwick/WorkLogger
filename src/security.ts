import { Hono, MiddlewareHandler, Context } from "hono";
import { setCookie } from "hono/cookie";
import { googleAuth } from "@hono/oauth-providers/google";
import { sign, jwt, type JwtVariables } from "hono/jwt";

const AUTH_TOKEN = "auth_token";

export interface User {
  name: string;
  email: string;
  exp: number;
}
export const authUser = (c: Context) => c.get("jwtPayload") as User;

export const googleAuthentication = new Hono<{
  Bindings: CloudflareBindings;
}>()
  .use("/", (c, next) =>
    googleAuth({
      client_id: c.env.GOOGLE_ID,
      client_secret: c.env.GOOGLE_SECRET,
      scope: ["openid", "email", "profile"],
    })(c, next),
  )
  .get("/", async (c) => {
    const user = c.get("user-google");

    if (!user) {
      return c.text("Google authentication failed", 401);
    }

    const payload = {
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    setCookie(c, AUTH_TOKEN, token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return c.redirect("/");
  });

export const jwtAuthCookie: MiddlewareHandler = (c, next) =>
  jwt({ secret: c.env.JWT_SECRET, alg: "HS256", cookie: AUTH_TOKEN })(c, next);
