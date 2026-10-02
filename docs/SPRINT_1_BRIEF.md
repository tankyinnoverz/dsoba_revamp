# Sprint 1 Brief — Alumni Trial Membership Vertical Slice

Status: In progress — first vertical slice running locally  
Duration: 2 weeks  
Sprint dates: To be confirmed  
Product owner: To be confirmed  
Delivery owner: To be confirmed

## Sprint goal

Prove the first production-shaped workflow: a visitor submits an Alumni Trial application, an authorised administrator approves it, Member 360 is updated, and the member sees an active Trial membership with its expiry date.

## User outcome

- Visitor receives a stable application reference.
- Administrator reviews and approves a pending application.
- Approval produces consistent member and audit records.
- Member Portal reads status from the API.
- An outbox record is ready for future email/WhatsApp delivery.
- English is the launch language; zh-HK dictionaries remain ready for the approved later activation.

## Committed scope

- Confirm eligibility, fields, Trial duration, expiry, statuses, roles, consent and retention.
- Select a MySQL-compatible migration framework.
- Model applications, members, memberships, audit and notification outbox records.
- Implement validated submission, listing/detail and transactional/idempotent approval APIs.
- Public Web: English form, validation, states and stable reference (locale-ready for zh-HK).
- Admin Portal: API-backed queue/detail and role-restricted approval.
- Member Portal: API-backed membership type, Active status and expiry.
- Test transitions, idempotency, audit/outbox and a clean-database end-to-end path.
- Verify English labels, keyboard use and mobile/desktop layouts; keep zh-HK locale coverage ready.

## Backlog

| ID | Story | Acceptance summary | Priority |
| --- | --- | --- | --- |
| S1-01 | Confirm rules/ownership | Approved decision log with owners | Must |
| S1-02 | Establish persistence | Clean database migrates consistently | Must |
| S1-03 | Model records | Relationships, statuses and audit fields enforced | Must |
| S1-04 | Submit application | Valid form returns reference; invalid input rejected | Must |
| S1-05 | Review applications | Authorised admin retrieves queue/detail | Must |
| S1-06 | Approve transactionally | Records update without duplication | Must |
| S1-07 | Display membership | Portal shows API-backed type/status/expiry | Must |
| S1-08 | Audit and outbox | Success records both; failure leaves no partial state | Must |
| S1-09 | Automate acceptance | Clean-database path repeats locally/in CI | Must |
| S1-10 | Bilingual/responsive QA | Critical path passes viewport/keyboard checks | Must |
| S1-11 | Migration mapping draft | Unknowns have named owners | Should |
| S1-12 | Basic telemetry | Correlated, safe outcome logs are visible | Should |

## Acceptance scenario

1. Visitor opens the application in English or zh-HK.
2. Required profile and consent fields are submitted.
3. One Pending application is created and a stable reference returned.
4. An unauthorised user cannot approve it.
5. An authorised administrator approves it.
6. Approval atomically creates/updates one member and one Active Alumni Trial membership.
7. Expiry follows the approved rule.
8. Repeated approval creates no duplicates or duplicate side effects.
9. Member Portal displays type, status and expiry from the API.
10. Audit records action, actor and time; one outbox item exists.

## Definition of done

- All Must stories meet acceptance criteria.
- API contract, validation schema and migrations are documented/tested.
- Apps use stable shared identifiers.
- Tests cover happy and critical failure paths.
- No known critical/high security defect remains.
- English and zh-HK content is present; English remains default.
- Responsive and keyboard checks pass.
- Stakeholders see the clean-database scenario.
- Product owner signs off the result and exclusions.

## Out of scope

Production authentication rollout; Life Member payments; production PayMe/FPS, email or WhatsApp; Shopify checkout; complex events/seating/QR; full CMS or SuiteCRM migration; production cutover; eMember wallet/card.

## Risks

| Risk | Mitigation |
| --- | --- |
| Rules remain unapproved | Product owner confirms before model closure |
| Authentication undecided | Use identity interfaces; avoid coupling to demo login |
| Migration framework delayed | Time-box and decide at sprint start |
| Data visibility unclear | Approve minimum field set and role matrix |
| Source data unavailable | Obtain a sanitised representative extract |
| Scope expands to providers | Deliver adapter/outbox boundaries only |

## Sprint review decision

Acceptance requires a repeatable end-to-end scenario. A form without persistence, or an API without all three user-facing touchpoints, does not satisfy the sprint goal.
