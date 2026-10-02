# Sprint verification status

The approved delivery guide controls scope. SQLite is the user-approved local/test exception; production remains MySQL 8. Sprint 0 is the demonstration foundation. The no-external-integration Sprint 1 acceptance slice is complete; provider wiring and full portal scope remain a separate release gate.

## Verified in this implementation pass

### 2026-10-01 verification update

- `corepack pnpm test`: exit 0, 13 passing tests, zero failures. The root command now runs real service and HTTP tests, not workspace placeholders.
- `corepack pnpm lint`: exit 0 for all four applications; `corepack pnpm build`: exit 0 for API/Public Web/Member Portal/Admin Portal. Dependency deprecation warnings remain.
- HTTP tests start an isolated API process and temporary SQLite database. They cover draft token protection and acknowledgement validation, approval/idempotency/onboarding, privacy filtering, password reset/logout and more-information resubmission/rejection. No live CRM data is modified.
- Draft resume and more-information messages use a separate local `application_outbox` table. Review renews and rotates the hashed resume credential; the old token is rejected. `local-outbox.mjs` is operator-only, not live delivery.
- Public resume/error/read-only status handling is implemented. Locally autosaved changes are preserved when merely checking server status.
- Browser inspection found `/membership/apply` was shadowed by `pages/membership.vue`. The overview moved to `pages/membership/index.vue` so the application is a separate route. The overview now describes paid Life at any age and the PDF expiry rule.
- Browser/mobile end-to-end acceptance remains a separate gate; these checks do not certify payment, storage, events or production readiness.
- Targeted browser smoke after the route fix: the built application displays all four step headings; the expanded navigation at 390×844 stays within the viewport; unauthenticated Member Portal `/profile` redirects to `/login?redirect=/profile`. Public Web was rebuilt and typechecked successfully after the route correction. Full logged-in/mobile end-to-end coverage is still outstanding.
- Local provider simulation: `LocalObjectStorage` enforces private JPEG/PNG objects and bounded signed URLs; `LocalPaymentProvider` simulates HKD 2,000 Life checkout and idempotent signed callbacks. These acceptance-only adapters do not contact DigitalOcean or QFPay.

- Workspace typechecks passed.
- All four workspace production builds passed (Nuxt dependency deprecation warnings remain).
- API build passed.
- Internal service credential required for review/approval/member lookup; client role headers are not trusted.
- Resume access requires an expiring hashed token; public reads no longer expose stored tokens.
- Approval commits application, member, pending account and onboarding outbox in a SQLite transaction.
- Activation verifies possession of a single-use link and sets a scrypt password.
- Real approved member accounts replace seeded demo login.
- Sessions persist, expire after eight hours, and are revoked on logout.
- Tests exercise account activation, pre-verification login denial, token reuse denial, session reload/logout and idempotent approval.
- Server derives membership from DOB, checks dates, consent and school duration, and blocks unpaid Life activation.
- Profile and directory pages use authenticated APIs. Mobile, industry, profession and directory/phone visibility can be saved. Identity fields remain read-only.
- Directory defaults to hidden; only active members with explicit visibility appear. Hidden phone numbers and email addresses are omitted from responses.
- Profile/privacy changes are committed with audit records. Logout clears profile/directory caches; suspended sessions are routed to membership only.

## Local test commands

```powershell
corepack pnpm --filter api build
node --test scripts/acceptance/security-persistence.test.mjs
```

To run the API, configure a random INTERNAL_API_TOKEN of at least 32 characters and an explicit SQLITE_PATH in the API process. Use the same settings for acceptance. Do not commit credentials.

```powershell
node apps/api/dist/main.js
powershell -ExecutionPolicy Bypass -File scripts/acceptance/membership-trial.ps1
node scripts/acceptance/local-outbox.mjs
```

The local outbox command prints activation links for the operator. Open a link on Member Portal port 3001, set a password, then sign in with the application email. This is a local delivery simulator, not live email verification delivery. Previously seeded demo credentials are no longer supported. Older drafts without token expiry metadata must be recreated.

## Remaining release gaps

- PDF integration: new approvals copy allow-listed contact/school/declaration details into the local member payload. Portal membership displays classification, voting record and lifecycle history. Historical backfill, full declaration evidence validation and production schema parity still require work.

- Lifecycle: request-time Youth-to-Trial/Trial upgrade/60-day suspension reconciliation implemented with persisted history and Hong Kong date boundaries. Terminal statuses are preserved. API tests cover boundary dates and replay. Daily scheduling, upgrade email and verified-payment restoration remain outstanding.

- Password recovery: local request/reset endpoints and page implemented. Tests verify identical request messages, token purpose separation, single use, old password rejection and session revocation. Provider email delivery remains outstanding.
- Code: remaining profile fields/per-field visibility, wiring local/provider adapters into payment/upload APIs, Life payment state persistence, lifecycle transitions, portal event/transaction/message integration, membership-number generation, audited type override, production MySQL adapter and broader acceptance coverage. Public resubmission is integrated but needs complete browser acceptance.
- Provider access: outbound email, private object storage and QFPay credentials.
- Verification: browser/mobile/keyboard acceptance and stakeholder UAT still required; builds alone do not certify these.
- Migration: staging is not account activation; imported CSV records remain outside the live member login flow.

Do not label Sprint 1 complete on the basis of the Trial service test alone.
