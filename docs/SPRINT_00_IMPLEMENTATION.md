# Sprint 0 Implementation Checklist

Status: **Complete for the demo foundation**

## Sprint 0 checklist

- [x] Create the public Nuxt website.
- [x] Create the member Nuxt portal.
- [x] Create the admin Nuxt portal.
- [x] Create the NestJS API foundation and health endpoint.
- [x] Add shared TypeScript contracts, validation helpers and design tokens.
- [x] Add public editorial, events, chapters, membership and contact demo routes.
- [x] Add member login, dashboard, profile, membership, events, transactions, directory and messages routes.
- [x] Add admin login, dashboard, members, applications, events, payments and content routes.
- [x] Retain en and zh-HK locale-ready dictionaries in Public Web.
- [x] Retain en and zh-HK locale-ready dictionaries in Member Portal.
- [x] Keep English (en) as the default and launch language per the delivery guide.
- [x] Keep language switching code available for a later locale-enabled release.
- [x] Localize public navigation, hero, footer, headings, forms and calls to action.
- [x] Localize member navigation, demo banner, login, dashboard and portal headings.
- [x] Validate both Nuxt apps with typechecks and production builds.
- [ ] Replace seeded demo records with approved bilingual editorial/member content.

## What was actually built

- Four independent workspace applications: public Nuxt site, member Nuxt portal, admin Nuxt portal and NestJS modular-monolith API.
- Public Editorial Heritage homepage with shared header, desktop/mobile navigation, footer, structured mock news/event content, article and event details, chapters, membership information and demo contact form.
- Member routes for login, dashboard, profile, membership, events, transactions, directory and messages. Content is mock data and login does not authenticate.
- Admin routes for login, dashboard, members, applications, events, payments and content. Navigation has permission metadata; admin actions do not persist.
- API health endpoint at `GET /api/v1/health`, placeholder modules for auth, accounts, members, applications, membership, directory, events, payments, communications, CMS and audit; validated environment settings; local CORS allowlist; URI versioning; logging and global exception handling.
- Shared TypeScript contracts, small validation helpers, config/design tokens and a shared token CSS entry. UI components remain owned by their apps.
- API base URL uses Nuxt runtime config. Database migration and seed folders remain; no migration framework or domain schema has been selected.

## How to run

```text
corepack pnpm install
pnpm dev:public
pnpm dev:portal
pnpm dev:admin
pnpm dev:api
```

Ports: public `3000`, member portal `3001`, admin portal `3002`, API `4000`.

## Reused prototype work

The navy, wine, gold and paper palette, serif editorial headings, DSOBA crest/centenary banner and appropriate school, dinner, chapter, dragon boat, happy hour and community-service images from `public/assets/` are reused. Content concepts include the President’s note, Annual Dinner, Dragon Boat, alumni chapters, membership pathways, CLF Trust/community activity and the Old Boys’ Association identity.

## Architecture actually implemented

Nuxt applications are separate workspace packages. The API is a NestJS modular-monolith foundation with the first application workflow and demo member-auth session endpoints. Runtime config supplies the API base URL. Shared packages contain application contracts, validation, config tokens and locale-ready content. SQL migration/seed baselines and provider adapter boundaries are present; durable MySQL/Redis/S3/QFPay wiring remains Sprint 1 work.

## Known limitations

- Demo login authenticates a seeded member in an in-memory session; production identity, member directory visibility, role checks, writes, payments, registration, messaging, CRM, WhatsApp and CMS persistence are not implemented.
- Public contact form does not send or store messages. The application workflow currently uses in-memory runtime state pending durable persistence.
- Representative content needs stakeholder confirmation. Migration framework and production configuration remain undecided.
- Authority documents are available in the supplied project folder under 0. Proposal Submitted and 1. Project Management. RFP/proposal text was reviewed; the detailed project plan remains a source for Sprint 1 reconciliation.
- The root `app.vue` is retained as reference. Its single-file route state machine and mobile-only 430px shell are not used as architecture in the separate Nuxt applications.

## Sprint 1 TODOs

- Start with the requirements reconciliation in docs/SPRINT_1_REQUIREMENTS_RECONCILIATION.md.
- Review terminology, membership definitions, events, approvals and privacy rules against the RFP, Submitted Proposal and Project Plan.
- Agree domain boundaries, authorization roles, privacy/retention rules and API contracts before business implementation.
- Select a MySQL-compatible migration framework and design schemas from approved requirements.
- Replace remaining mock data with CMS/API reads and caching/revalidation; implement one approved end-to-end workflow at a time. The first Trial application → approval → Member Portal status slice is now runnable locally.
- Add real authentication, member permissions, admin workflows, observability, production configuration and deployment automation.
