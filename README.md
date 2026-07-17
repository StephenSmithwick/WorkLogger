# Worklogger
Allows the logging of daily work

This is a hono, solidjs, drizzle, neon Single page application with serverside rendering with cloudflare as the deployment target.

## Running Locally
After installing the dependencies (`pnpm install`) you can start the dev server with:
```zsh
pnpm dev
```

## Deploying to Cloudflare

Before deploying to cloudflare you may want to preview it locally using

```zsh
pnpm run preview
```

```zsh
pnpm run deploy
```

## Updating cloudflare properties (`c`)
To re-generate typescript types for cloudflare parameters:

```txt
pnpm run cf-typegen
```

- [latest](https://worklogger.worklogger.workers.dev)
- [all deployments](https://dash.cloudflare.com/0c855cdf521de8fed5ad5d3ac1c22763/workers/services/view/worklogger/production/deployments)
- [Change subdomain](https://dash.cloudflare.com/0c855cdf521de8fed5ad5d3ac1c22763/workers/subdomain)

## DB
generate migration files: `npx drizzle-kit generate`
migrate database: `npx drizzle-kit migrate`
view database: `npx drizzle-kit studio`
