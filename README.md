# DSOBA 2026

DSOBA public website, member portal, admin portal and modular NestJS API.

## Delivery status

Newly approved applications retain the allow-listed PDF contact, school and declaration details in the local member record. Membership pages display the API's Life (Youth) label, voting eligibility record, expiry, grace deadline and lifecycle history. Private application details are excluded from directory responses. Older approved records have not been backfilled.

Latest membership rule update: the 2026 PDF overrides earlier rules. New Trial memberships expire on December 31 of the 28th-birthday year, followed by 60 days' grace. School duration is reviewed manually, not subject to a two-year automatic rejection. Life applications are allowed at any age, with activation still gated by verified payment. Under-18 Life is labelled Life (Youth); voting eligibility is recorded separately. Existing stored expiry dates need an explicit migration review.

- **Sprint 0:** demo foundation implemented; workspace typechecks and production builds passed. Browser/mobile acceptance has not been re-run in the latest verification pass.
- **Sprint 1 local acceptance:** complete for the no-external-integration slice. Local application approval, account activation/login, profile editing, privacy-aware directory, lifecycle rules, local private-object simulation and local payment simulation are implemented and covered by 17 automated tests. External provider wiring and full portal event/transaction/message scope remain deferred.
- **Sprint 2:** not started; outstanding Sprint 1 acceptance comes first.

The [approved delivery guide](docs/VS_CODE_PARALLEL_DELIVERY_GUIDE.md) controls delivery scope. Later confirmed decisions allow SQLite for local development/acceptance and retain MySQL 8 for production. Launch UI is English; locale-ready English/zh-HK dictionaries are retained.

The revised future sprint order is documented in [SPRINT_ROADMAP.md](docs/SPRINT_ROADMAP.md). The content team can use [PUBLIC_WEB_SITEMAP.md](docs/PUBLIC_WEB_SITEMAP.md) to prepare the full Public Web copy and media package before API integration.

AD104 (2025) booklet content is now available in the Public Web as a condensed archive/review covering the Global Assembly dinner, city and professional chapters, functions, music and sports. AD105 (2026) dummy listings remain separate and are labelled as preview content until the 2026 booklet/programme is supplied.

Content-owner confirmation: AD104 booklet images are approved for reuse; the Matthias Der, Ronnie HM and Dr Daphne Ho articles are intentionally excluded. The AD104 event is published as the 104th Anniversary Dinner on 29 November 2025.

DigitalOcean staging deployment steps for Public Web and Member Portal are in [DIGITALOCEAN_STAGING_GUIDE.md](docs/DIGITALOCEAN_STAGING_GUIDE.md). The guide uses App Platform, separate Nuxt services, staging environment variables and health checks. A reachable staging API is still required for remote login and application submission.

## Requirements

- Node.js 24 (the local API uses built-in `node:sqlite`, which may emit an experimental warning)
- Corepack with pnpm 9 (the repository pins pnpm 9.15.4)

## Start locally

Run from the repository root in PowerShell:

```powershell
corepack pnpm install
corepack pnpm --filter api build
```

Start the API in its own terminal. Generate a local internal-service credential and use an absolute database path so every command uses the same database:

```powershell
$env:NODE_ENV = 'development'
$env:PERSISTENCE_DRIVER = 'sqlite'
$env:API_PORT = '4000'
$env:SQLITE_PATH = Join-Path (Get-Location) 'data/dsoba.sqlite'
$env:INTERNAL_API_TOKEN = node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
node apps/api/dist/main.js
```

Start each frontend in a separate terminal:

```powershell
corepack pnpm dev:public
corepack pnpm dev:portal
corepack pnpm dev:admin
```

Each dev command runs in its own terminal. Public web is at `http://localhost:3000`, member portal at `http://localhost:3001`, admin portal at `http://localhost:3002`, and API health at `http://localhost:4000/api/v1/health`.

Set `NUXT_PUBLIC_API_BASE` before starting a frontend to override `http://localhost:4000/api/v1`. API settings also include `CORS_ORIGINS`. Set environment variables in the process running each command; do not assume a `.env` file is automatically loaded.

Production MySQL is planned but its runtime adapter is not implemented: production API startup intentionally fails. A successful production build does not mean the API is ready to deploy.

## Try the local membership workflow

1. Open `/membership/apply` on the public website and submit an application. Photo selection is not yet connected to object storage.
2. Use the protected internal endpoints to list Pending applications and approve one. Supply `Authorization: Bearer <INTERNAL_API_TOKEN>` using the server's credential. The Admin Portal remains a demonstration shell.
3. In a terminal with the same `SQLITE_PATH`, run `node scripts/acceptance/local-outbox.mjs` to obtain the local activation link.
4. Open the link on the member portal, set a password of at least 12 characters, then sign in with the application email.
5. Try `/profile` and `/directory`. Directory visibility defaults to off; hidden phone numbers are omitted from API responses.

There is no longer a seeded demo login. Local outbox links simulate email delivery; live email is not configured. Existing SuiteCRM staging records are not login accounts. Life activation requires verified payment and remains incomplete.

## Quality checks

```sh
corepack pnpm build
corepack pnpm lint
corepack pnpm test
corepack pnpm --filter api build
node --test scripts/acceptance/security-persistence.test.mjs
node --test scripts/acceptance/membership-grace.test.mjs scripts/acceptance/membership-lifecycle.test.mjs
```

The root `test` command builds the API and runs isolated SQLite service and HTTP acceptance tests. The latest run passed 13 tests (including five HTTP sub-scenarios); package-level placeholder tests are not acceptance evidence. Coverage includes protected internal access, resume tokens, transactional/idempotent approval, account activation, password reset, session persistence/logout, directory privacy and more-information resubmission.

The public application accepts private resume links, restores server fields, shows review reasons and locks submitted/final applications. API failures retain the local draft. Returning to the page checks server status without overwriting newer locally autosaved edits. Draft/resubmission links are queued in the operator-only local outbox; live email delivery is still unconfigured. More-information requests rotate the resume token with a fresh seven-day link. Submission requires consent and rules acknowledgement.

For the running API, `powershell -ExecutionPolicy Bypass -File scripts/acceptance/membership-trial.ps1` tests draft/submission/approval/member lookup. Its process must have the same `INTERNAL_API_TOKEN` as the server; it creates synthetic records. This script alone does not prove all Sprint 1 scenarios.

## Remaining Sprint 1 work

Confirmed providers: DigitalOcean Spaces, QFPay and SMTP2GO. Private settings are in ignored `env/config.txt`. The SMTP2GO adapter is implemented with mocked transport tests, fixed HTTPS destination, response validation and no blind retries. It is not yet connected to automatic outbox delivery. `node scripts/acceptance/smtp2go-check.mjs` checks presence of settings without printing secrets or sending mail. Local acceptance also includes `LocalObjectStorage` and `LocalPaymentProvider`; they never contact external services. Provider acceptance is not proof of inbox delivery.

The Life-upgrade grace period defaults to 60 calendar days from Trial expiry (December 31 of the 28th-birthday year), configurable with `MEMBERSHIP_GRACE_DAYS`. Login/session and directory requests reconcile Youth-to-Trial and overdue Trial-to-Suspended transitions, retaining history. Dates use Hong Kong time. A daily background sweep, upgrade notification delivery and verified-payment restoration remain outstanding. Existing grace deadlines are retained if configuration changes.

Local password recovery is available at `/reset-password`: the operator retrieves the link with `node scripts/acceptance/local-outbox.mjs`. Reset links expire after 30 minutes and are single-use; successful resets revoke existing sessions. Live delivery is not configured.

Remaining full provider wiring, production persistence, events/tickets/transactions/messages integration and complete stakeholder browser/mobile acceptance remain deferred to the provider-integration pass. The local Sprint 1 acceptance slice is complete; this is not a production-launch approval.

SuiteCRM data has been staged locally (4,234 READY and 629 QUARANTINED rows); it has not been promoted to live members. Duplicate resolution is a separate migration task.

## Delivery records

Local operators can reconcile every live member (including those who have not logged in) with `node scripts/acceptance/reconcile-memberships.mjs`, after building the API and setting the same `SQLITE_PATH`. This writes lifecycle transitions/history and prints only counts. Staging records are excluded. An automatic daily scheduler is not configured yet.

- [Current verification results and gaps](docs/SPRINT_VERIFICATION_STATUS.md)
- [Sprint 0 implementation](docs/SPRINT_00_IMPLEMENTATION.md)
- [Sprint 1 brief](docs/SPRINT_1_BRIEF.md) — earlier Trial milestone; use the approved guide where scope differs
- [Member import mapping](docs/SUITECRM_MEMBER_IMPORT_MAPPING.md)
- [Import runbook](docs/MEMBERS_IMPORT_RUNBOOK.md)

Update this README at every sprint review and whenever startup, configuration, test commands or usable features change. Mark a sprint complete only after its required acceptance checks pass.
