# Worklogger
Allows the logging of daily work

This is a hono, solidjs, drizzle, neon Single page application with serverside rendering.

## Getting Started
Running locally:
```
pnpm install
pnpm dev
```

Deploying to Cloudflare
```
pnpm run deploy
```


## Cloudflare
[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
pnpm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

- [latest](https://worklogger.worklogger.workers.dev)
- [all deployments](https://dash.cloudflare.com/0c855cdf521de8fed5ad5d3ac1c22763/workers/services/view/worklogger/production/deployments)
- [Change subdomain](https://dash.cloudflare.com/0c855cdf521de8fed5ad5d3ac1c22763/workers/subdomain)

## DB
generate migration files: `npx drizzle-kit generate`
migrate database: `npx drizzle-kit migrate`
view database: `npx drizzle-kit studio`
