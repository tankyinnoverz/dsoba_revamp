# DSOBA 2026 Sprint Roadmap

Status: Revised sequencing for stakeholder alignment  
Cadence: 2-week sprints  
Baseline: Sprint 0 demo foundation completed

## Product outcome

Deliver a mobile-first public website, secure member portal, admin portal and central Member 360 platform covering membership, content, events, payments, communications and controlled migration.

## Roadmap

| Sprint | Theme | Primary outcome | Exit gate |
| --- | --- | --- | --- |
| Sprint 0 — Complete | Foundation and demo | Public Web, Member Portal, Admin Portal, API foundation, shared contracts and bilingual UI shell | Apps build; demo routes and limitations documented |
| Sprint 1 | Local membership vertical slice | Local public application → approval → member account → portal status, with SQLite and provider simulations | Local acceptance path and automated tests pass |
| Sprint 2 | Full Public Web | Complete sitemap, page content, legal pages, bilingual shell, responsive states, SEO and accessibility-ready content adapters; no live API dependency | Sitemap routes render; content inventory signed off; desktop/mobile smoke passes |
| Sprint 3 | Full Member Portal | Complete portal screens and journeys using typed contract adapters: login/setup/profile/membership/privacy/directory/events/bookings/transactions/messages/suspended state | Portal route map complete; loading/empty/error/unauthorised states pass |
| Sprint 4 | Full Admin Backend UI | Admin shell, application queue/detail, review, approval, membership, payment-proof review, audit and content controls using local adapters | Admin role matrix and review journeys pass locally |
| Sprint 5 | API and persistence integration | Connect Public Web, Member Portal and Admin UI to NestJS APIs, MySQL migration path, real contracts and audit/outbox persistence | Clean database end-to-end acceptance passes |
| Sprint 6 | External providers | DigitalOcean Spaces, QFPay and SMTP2GO sandbox adapters, secrets, callbacks, retries and idempotency | Provider sandbox tests and failure paths pass |
| Sprint 7 | Events and booking integration | Event registration, capacity, bookings, tickets/QR and admin attendance operations | Event journeys and capacity tests pass |
| Sprint 8 | Payments and transactions completion | Invoices, reconciliation, payslips, refunds and member transaction history | Payment reconciliation and duplicate protection pass |
| Sprint 9 | Migration, communications and reporting | SuiteCRM rehearsal, cleansing, governed communications, consent, reports and dashboards | Accuracy/completeness thresholds and delivery tests pass |
| Sprint 10 | SIT, UAT and launch readiness | Full integration validation, training, runbooks, cutover/rollback, monitoring and backup rehearsal | UAT signed; no launch-blocking defects |

## Continuous workstreams

- Governance: backlog, decisions, acceptance criteria and sign-off.
- Security/privacy: least privilege, consent, retention, audit and secrets.
- Quality: automated tests, bilingual review, accessibility and responsive regression.
- Delivery: CI/CD, environments, monitoring, backups and recovery rehearsal.
- Migration: source profiling and mapping start in Sprint 1.
- Content: inventory, ownership and translation run throughout delivery.

## Milestones

| Milestone | Target | Evidence |
| --- | --- | --- |
| Membership workflow alpha | End Sprint 1 | Replayable local public-to-admin-to-member test |
| Public website content alpha | End Sprint 2 | Full sitemap, content inventory and responsive pages |
| Member Portal beta | End Sprint 3 | Complete authenticated portal route map using typed adapters |
| Admin backend beta | End Sprint 4 | Local review, approval, payment-proof and audit journeys |
| Integrated service beta | End Sprint 5 | Public, portal and admin connected to API/persistence |
| Provider sandbox beta | End Sprint 6 | DigitalOcean, QFPay and SMTP2GO sandbox paths |
| UAT candidate | End Sprint 9 | Reconciled migration, communications and reports |
| Production readiness | End Sprint 10 | Signed UAT and cutover/rollback approval |

## Revised delivery order

1. Finish Public Web and content readiness before requiring live API integration.
2. Finish Member Portal screens and user journeys using typed contract-faithful local adapters.
3. Finish Admin backend UI and local review workflows.
4. Integrate all three surfaces with the API and production-shaped persistence.
5. Connect DigitalOcean Spaces, QFPay and SMTP2GO only after the local integrated paths are stable.

The UI-first sequence does not permit independent mock contracts. Each adapter must implement the shared types and be replaceable by the API adapter without changing page components.

## Early decisions

1. Confirm membership definitions, Trial duration, expiry rules and approval roles.
2. Select the MySQL-compatible persistence and migration framework.
3. Confirm authentication and administrator identity source.
4. Approve data visibility, retention, consent and directory privacy rules.
5. Obtain representative source data and nominate source owners.
6. Confirm payment, WhatsApp, email and Shopify vendors/sandboxes.
7. Nominate bilingual content owners and UAT representatives.

## Change control

At each review, update scope and forecasts using demonstrated evidence. New requirements enter backlog refinement and do not displace committed work unless the product owner explicitly re-prioritises the sprint goal.
