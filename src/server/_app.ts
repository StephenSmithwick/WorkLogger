import { Hono } from "hono"
import { csrf } from "hono/csrf"
import { authController } from "./modules/auth/auth.controller"
import { worklogController } from "./modules/worklog/worklog.controller"

const app = new Hono()

app.use(csrf())

export const appRouter = app
  // Extends routes here...
  .route("/auth", authController)
  .route("/worklog", worklogController)

export type AppRouter = typeof appRouter
