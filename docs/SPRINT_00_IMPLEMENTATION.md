# Sprint 0 Implementation

## What was built

- pnpm workspace foundation with separate public, member, admin and API applications.
- Editorial Heritage public homepage shell with structured mock news/events.
- Public route placeholders for about, news, events, chapters, membership and contact.
- Member portal shell and admin portal shell with no real authentication or business logic.
- NestJS health endpoint at `GET /api/v1/health`.
- Shared package placeholders and database migration/seed directories.

## How to run

```text
corepack enable
pnpm install
pnpm dev:public
pnpm dev:portal
pnpm dev:admin
pnpm dev:api
```

Ports: public `3000`, member portal `3001`, admin portal `3002`, API `4000`.

## Reused prototype work

The existing root `app.vue`, global styles, Tailwind configuration and public image assets remain preserved as historical reference. Sprint 0 public-web shell reuses the same Editorial Heritage palette and content intent without overwriting the prototype.

## Architecture actually implemented

Nuxt applications are separate workspace packages. The API is a minimal NestJS application. Shared packages are prepared but intentionally contain no premature domain abstractions. Database directories and `.env.example` are prepared without inventing the membership/event/payment schema.

## Known limitations

- Authentication, database persistence, CMS integration, payments and event registration are not implemented.
- Public page detail routes currently use structured placeholders.
- Lint/test scripts are smoke-level in Sprint 0.
- The existing root prototype remains outside the new app packages for safe preservation.

## Sprint 1 TODOs

- Confirm SYSTEM_BLUEPRINT route ownership and public/member separation.
- Extract approved Editorial Heritage primitives into `packages/ui` where genuinely shared.
- Define API contracts and validation schemas.
- Select migration tooling and implement the first approved domain slice.
