# Sprint 1 Requirements Reconciliation

Status: Decision-ready

## Authority documents reviewed

- RFP: DSOBA RFP Website CRM v1 0 (Tanky), PDF/DOCX, in 0. Proposal Submitted.
- Submitted Proposal: Dsoba Website & Member System Revamp Proposal (Full Migration) 20260124(Tanky), in 0. Proposal Submitted.
- Project Plan: DSOBA Detailed Project Implementation Plan-rev (20260409), in 1. Project Management.

## Cross-document requirement alignment

| Requirement | RFP | Submitted Proposal | Project Plan | Sprint implication |
| --- | --- | --- | --- | --- |
| Mobile-first public website and secure member portal | Primary objective | Single responsive Nuxt site | Public website, then member portal | Keep responsive UI and shared identity contracts |
| Central Member 360 backend | SuiteCRM replacement or migration decision | Full migration to a new backend CRM | Backend CRM development and data mapping | Establish member, application and audit data model first |
| Membership lifecycle | Application, approval, payment, notification and eMember card | Public vs Alumni; Trial vs Life rules | Backend approvals, payments and notifications | Use membership approval as the first vertical slice |
| Public CMS and chapters | Static pages, chapters, news and social links | CMS and content migration | Public website and CMS alpha | Keep public content shell separate from transactional workflow |
| Events and ticketing | Simple and complex event models, seating and reporting | Events engine and booking module | Event module follows public website | Build after identity and membership workflow contracts |
| E-commerce | Product, cart, checkout, PayMe/FPS | Shopify Basic with SSO | Payment/invoice/reporting later | Defer external commerce until identity and order boundaries are stable |
| WhatsApp service channel | Authenticated member service flows | Vendor integration with Member 360 | Backend and WhatsApp integration | Use an internal notification/outbox boundary first |
| Migration and acceptance | SuiteCRM integration or replacement required | Full migration recommended | Data audit, mapping, rehearsal and UAT | Do mapping before importing or cutover |

## Reconciled delivery order

The Project Plan contains a sequencing issue: UAT criteria are dated before build activities. The following order is safer and traceable:

1. Confirm scope, roles, acceptance criteria and architecture.
2. Approve sitemap, public/member journeys and API contracts.
3. Define Member 360 data model, audit fields and migration mapping.
4. Deliver one vertical membership workflow end to end.
5. Extend the stable identity and membership contracts into events, transactions and directory.
6. Add payment, Shopify, WhatsApp and reporting integrations behind explicit adapters.
7. Run system integration testing, migration rehearsal and UAT.

## Selected end-to-end acceptance scope

### Alumni Trial Membership application

This is the first acceptance slice:

1. A visitor selects Alumni registration on Public Web.
2. The visitor submits the required profile and consent fields.
3. The API creates an application with status Pending and an audit record.
4. An authorised admin sees the pending application and approves it.
5. The system creates or updates the Member 360 record as Alumni Trial.
6. The Member Portal shows membership type, Active status and the Trial expiry date.
7. The system records the approval event and exposes a notification/outbox item for email or WhatsApp delivery.
8. The journey is usable in English; locale-ready structures remain available, while the delivery guide's launch language is English only.

### Acceptance evidence

- Public Web form submission returns a stable application reference.
- Admin approval changes the application and member records transactionally.
- Member Portal reads the resulting status from the API rather than mock-only state.
- Audit history identifies who approved the application and when.
- Validation rejects incomplete or invalid submissions.
- Responsive checks pass for desktop and mobile widths.

### Explicitly out of this first slice

- Life Member payment gateway execution.
- PayMe/FPS production integration.
- Shopify SSO, catalogue and checkout.
- WhatsApp production provider integration.
- Complex event seating, QR check-in and onsite operations.
- Full SuiteCRM migration and production cutover.
- eMember wallet/card issuance.

These remain subsequent vertical slices or integration work, not hidden dependencies of the first acceptance test.

## Definition of done for this slice

- API contract and validation schema are documented.
- Public, Admin and Member Portal flows use the same application/member identifiers.
- Persistence, audit and notification boundary are covered by automated tests.
- English labels are present and English is the launch/default language; zh-HK remains locale-ready for a later release.
- One scripted acceptance scenario can be replayed from a clean database.
- Stakeholder signs off the scenario and the excluded integration list.
