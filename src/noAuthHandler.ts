import { MiddlewareHandler } from "hono";

export function noAuth<User>(
  contextField: string,
  user: User,
): MiddlewareHandler {
  return async (c, next) => {
    c.set(contextField, user);
    await next();
  };
}
