import { MiddlewareHandler } from "hono";

export function noAuthenticationFactory<User>(
  contextField: string,
  user: User,
): MiddlewareHandler<{ Variables: Record<string, User> }> {
  return async (c, next) => {
    c.set(contextField, user);
    await next();
  };
}

export const noAuth = noAuthenticationFactory;
