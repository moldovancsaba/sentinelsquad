# Contributing

## Scope

This repository is the product repo for SentinelSquad only. Do not treat it as `mvp-factory-control` or mix product changes across repositories.

## Repository layout

- `apps/sentinelsquad`: application code, Prisma schema, worker, launch scripts
- `docs`: product and operating documentation
- `scripts`: repository-level utilities

## Local development

1. Use Node `20` (`.nvmrc`).
2. Start Postgres from the repo root:

```bash
npm run db:up
```

3. Install app dependencies and prepare Prisma:

```bash
npm run install:app
npm run prisma:generate
cd apps/sentinelsquad && npx prisma migrate dev
```

4. Start development server:

```bash
npm run dev
```

## Verification

Before pushing changes, run:

```bash
npm run verify
```

## Conventions

- Keep SentinelSquad naming consistent across code, docs, and UI.
- Prefer repo-root commands for docs and onboarding.
- Do not commit local env files, runtime artifacts, or generated logs.
- Preserve the split between board assignment, unified-chat availability, and worker/runtime execution semantics.
