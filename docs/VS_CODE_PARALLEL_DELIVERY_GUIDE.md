# DSOBA Parallel Delivery Guide

Status: Approved implementation direction  
Primary repository: `C:\local-server\dsoba-mobile-demo`  
Delivery target: Functional integrated build in 1–2 focused days  
Launch language: English only  
Authority order: latest user decisions in this guide → User Requirements v2 → technical requirements → existing demo implementation

## 1. Delivery objective

Complete the Public Web and Member Portal feature set first, backed by real persistence and authentication. Build the full Admin Portal last, while providing only the minimum internal approval capability required to test end-to-end membership and payment workflows.

This 1–2 day target is for an integrated functional build, not production launch certification. Production provider onboarding, security testing, migration rehearsal, operational hardening and stakeholder UAT remain separate release gates.

## 2. Confirmed business rules

### 2026 PDF override (confirmed by user)

The latest membership application PDF takes precedence where older text below differs. Trial expires on December 31 of the year of the 28th birthday; the configured 60-day grace period follows that expiry. School attendance is reviewed by GenCom: do not reject automatically for less than two years. Capture DPS-only attendance. Life can be requested at any age and requires verified payment plus approval. Under-18 Life is displayed as Life (Youth); Youth and Trial have no voting rights, adult active Life has voting rights recorded. Historical records are not silently migrated by this rule update.

### Membership eligibility and lifecycle

- Youth Member: applicant has studied at DBS for at least two years and is under 18. Free.
- Trial Member: age 18 to under 28. Free.
- At age 28, invite the member to upgrade to Life Membership.
- Confirmed default grace period: 60 calendar days from the Trial expiry date (28th birthday), configurable through `MEMBERSHIP_GRACE_DAYS`.
- Life Membership costs HKD 2,000.
- If the member does not complete the upgrade within the configured grace period, set the account to Suspended.
- A Suspended member may log in but must see a locked upgrade/payment experience and a persistent upgrade alert.
- Successful verified Life payment changes the membership to active Life.
- Preserve complete membership-state history and audit records.

### Application and account access

- Applicants do not need an account or login to start or submit an application.
- “Save and Continue Later” creates a Draft application and a secure, expiring resume token/link sent to the supplied email.
- Draft access is application-only and must never grant Member Portal access.
- Submitted applications become Pending and cannot access Member Portal.
- General Committee manually approves or rejects applications.
- Approval provisions the member account and sends an email verification/onboarding link.
- New members set an email + password credential; verification email remains required.
- Force password setup/change before first portal session.
- Rejected applicants do not receive portal access.

### Application statuses

Use:

`Draft → Pending → More Information Required → Pending → Approved | Rejected`

Also support `Withdrawn` and `Expired`.

Application status and payment status must remain separate.

### Payment statuses

Use:

`Not Required | Unpaid | Online Payment Pending | Proof Uploaded | Verifying | Paid | Failed | Refunded`

- Youth and Trial applications use Not Required.
- Life applicants may pay through the existing QFPay gateway or upload a payslip image.
- Record the applicant-facing method/status such as “Paid online” or “Proof uploaded”.
- Payslip payment remains Verifying until an authorised admin confirms or rejects it.
- QFPay must be implemented behind a payment-provider adapter with idempotent callback/webhook processing.
- Payment failure must not corrupt or duplicate the application, invoice or membership record.

### Storage and retained fields

- Applicant photos and payslips must use cloud object storage, not repository files or local production disk.
- Use an S3-compatible storage interface so the provider can be changed.
- Store private objects with signed, time-limited access URLs.
- Retain Marital Status for this delivery.
- Applicant photo and DOB remain mandatory.
- Social links remain optional.
- Never expose admin-only fields in the public form.

## 3. Public application form

Implement the supplied four-step form responsively.

### Step 1 — Profile

- First Name — required
- Last Name — required
- Middle Name
- Chinese Name
- Date of Birth — required
- Marital Status
- Profile Picture — required; JPG/PNG; validate type and size

### Step 2 — Contact and work

- Address lines, city, state/province/region, postal code, country
- Home Phone
- Mobile — required
- Email — required
- Company Name
- Nature of Business / Industry
- Occupation / Profession
- Office Phone

### Step 3 — School and education

- Class Year — required
- Year Joining School — required
- Year Leaving School — required
- House — required
- Enforce or flag the “studied at DBS for at least two years” rule
- Hobbies
- College / University
- Degree / Major
- Year of Graduation

### Step 4 — Confirmation and membership

- Decision/reason to join
- Introduced by / event
- Comments, maximum 300 characters
- Membership Type: Youth, Trial or Life
- Derive the recommended type from DOB but allow authorised review correction
- Display HKD 2,000 only for Life
- QFPay option and payslip-upload option for Life
- Show rules/by-laws acknowledgement and consent
- Exclude Payment Record, Membership Number and Approval By/Date from the public UI

Every step must autosave locally for resilience. Server-side Draft save uses the secure resume-token flow. Submission must validate all steps on the server.

## 4. Public Web scope

Preserve and complete the existing design system and routes, including their necessary detail/sub-pages:

- Home
- About and relevant organisational/history sections
- News listing and news detail
- Events listing, filters, event detail and public registration entry
- Chapters listing and chapter detail
- Membership overview, eligibility, fees, application and resume-application flow
- Contact
- Privacy policy, terms and relevant consent/legal pages
- Responsive navigation, footer, metadata, error and empty states

Use the existing structured content initially; keep data access behind typed adapters so CMS persistence can replace it without rewriting page components.

## 5. Member Portal scope

Implement real email/password authentication and protected routing:

- Login, email verification, password setup/reset, logout and session refresh
- Dashboard
- Profile view/edit
- Membership status, history and Life upgrade alert
- Privacy settings with per-field directory visibility
- Searchable member directory with industry/profession filters
- Events listing/detail and registration
- My bookings/tickets and QR display where available
- Transactions/invoices/payment status
- Messages/notifications
- Suspended-member locked payment/upgrade experience
- Loading, empty, validation, unauthorised and failure states

Directory APIs must enforce privacy settings server-side. Hidden fields must never be returned and merely concealed with CSS.

## 6. Minimum backend required before Admin Portal

Although the full Admin Portal is last, the following backend/internal capability is required for integration testing:

- Review a Pending application
- Request more information
- Approve or reject with reason
- Verify or reject uploaded payslip
- Override a derived membership type with audit logging
- Provision an approved account
- Generate a membership number
- Record actor, timestamp, previous state and new state

A protected minimal internal screen or controlled seed/CLI operation is acceptable during the first integration pass. Do not build the full Member 360 interface until Public Web and Member Portal flows work.

## 7. Technical baseline

Use the existing monorepo rather than replacing it:

- Nuxt 3 applications: `apps/public-web`, `apps/member-portal`, `apps/admin-portal`
- NestJS API: `apps/api`
- Shared contracts: `packages/types`
- Shared validation: `packages/validation`
- MySQL 8 for persistence
- Redis for sessions, rate limiting, queues and expiring resume-token support where appropriate
- S3-compatible cloud storage
- QFPay behind a provider interface
- English-only UI, while retaining UTF-8/utf8mb4 and locale-ready data structures

Choose one migration tool and use it consistently. Do not maintain competing schemas or duplicate business models across apps.

## 8. Parallel execution model

Do not create multiple VMs by default. Use one repository with isolated Git worktrees/branches and independent test database names.

### Integration owner

Owns shared contracts, migration ordering, API conventions, environment variables, merge order, integration tests and the continuously runnable main branch.

### Workstream A — Platform, identity and storage

- Database migrations and seeds
- Account/session/password/email verification
- Application resume tokens
- S3-compatible upload service and signed access
- Shared validation/types
- QFPay provider interface and webhook boundary

### Workstream B — Public Web and application

- Public routes and sub-pages
- Four-step application form
- Draft/resume/submit UX
- Membership eligibility/fee presentation
- Events/news/chapter detail routes
- Responsive and accessibility states

### Workstream C — Member Portal

- Login and protected layout
- Dashboard/profile/membership
- Privacy settings and directory
- Events/tickets/transactions/messages
- Suspended Life-upgrade experience

### Integration owner/API workstream

- Application, member, directory, lifecycle, event and payment APIs
- Approval/payment-verification internals
- Notification outbox
- End-to-end tests and branch integration

Frontend workstreams must consume shared typed contracts and may use contract-faithful adapters while endpoints are being completed. Do not invent independent mock shapes.

## 9. Two-day delivery sequence

### Day 1 morning — Freeze interfaces

1. Audit existing code; preserve working features.
2. Lock route map, entity states, request/response contracts and migrations.
3. Start MySQL/Redis and verify clean setup.
4. Create worktrees and isolated test databases.
5. Begin all three workstreams.

### Day 1 afternoon — Vertical paths

1. Draft/resume/submit application works against the real API.
2. Authentication and approved-member portal session work.
3. Public and portal pages use typed adapters.
4. Uploads reach cloud storage through the storage interface.
5. Integrate continuously in small commits.

### Day 2 morning — Member functionality

1. Profile, membership, privacy and directory integrate.
2. Events and transaction views integrate.
3. Life QFPay/payslip paths and Suspended experience integrate.
4. Minimum approval/payment-verification capability works.

### Day 2 afternoon — Stabilisation

1. Run clean-database end-to-end scenarios.
2. Fix integration, permission and responsive failures.
3. Run lint, typecheck, tests and production builds.
4. Produce a short gap list restricted to external-provider or production-readiness items.

## 10. Acceptance scenarios

At minimum, automate and demonstrate:

1. Anonymous applicant saves Draft, receives secure resume access, resumes and submits.
2. DOB/age recommends Youth, Trial or Life correctly; DBS two-year rule is validated/flagged.
3. Pending applicant cannot access Member Portal.
4. GenCom approval provisions account; verification/password setup enables login.
5. Approved member edits profile and privacy; directory respects hidden fields.
6. Youth turns 18 and becomes Trial.
7. Trial reaches 28 and receives Life upgrade alert.
8. Life applicant pays by QFPay or uploads proof; duplicate callbacks do not duplicate payment.
9. Admin verifies payslip and membership becomes active Life.
10. Grace-period expiry suspends the member; login shows only upgrade/payment access.
11. Successful later payment restores active Life access.
12. Public pages and Member Portal pass mobile and desktop smoke tests.

## 11. Non-negotiable safeguards

- Never expose admin fields or private object URLs publicly.
- Never trust client-calculated age, fees, roles, payment status or membership status.
- Hash passwords with an approved adaptive password hash.
- Hash resume, verification and reset tokens at rest; make them expiring and single-use where applicable.
- Enforce authorisation and directory privacy in API queries.
- Make approvals and payment reconciliation transactional and idempotent.
- Audit all state changes, admin actions and privacy changes.
- Do not add e-commerce; it is explicitly out of scope.
- Do not replace existing user changes or rebuild working modules without evidence.
- Do not declare completion solely because pages render; acceptance scenarios and builds must pass.

## 12. Required completion report

The VS Code agent must finish with:

- Features completed by route/module
- Database migrations added
- Tests and builds run with results
- Any assumptions made
- Remaining gaps classified as code, provider access, stakeholder UAT or production operations
- Exact commands for local startup and clean-database acceptance testing
