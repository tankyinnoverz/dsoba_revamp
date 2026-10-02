# SuiteCRM Members CSV — Sprint 1 Import Mapping

## Source audit

- Source: `resources/Old_Data/Members.csv`
- Size: approximately 6.5 MB
- Rows: 42,497 data rows plus header
- Columns: 168 header fields
- Encoding/content: quoted CSV with SuiteCRM-style export fields
- Import blocker: the header contains the duplicate field `member id qr code`; the importer must preserve both source positions with deterministic names before validation.

The source file is preserved unchanged. No records have been imported.

## Proposed mapping

The following decisions are now approved for the Sprint 1 staging design:

- `Member Status` is extensible. Map `Active`, `Suspended`, `Pending`, `Expired`, `Terminated` and `Deceased`; preserve any other source value in `legacyStatus` for later mapping.
- `Membership Type` / `Member Level ID` map to `Youth`, `Trial` or `Life`.
- Directory and phone visibility are separate privacy controls. Blank or unclear source values default to not public.

### Confirmed status semantics

| SuiteCRM value | New status | Portal/account handling |
| --- | --- | --- |
| `Active` | `ACTIVE` | Normal member access subject to privacy settings |
| `Trial Expired` | `EXPIRED` | No active membership; retain account/history for renewal |
| `Terminated` | `TERMINATED` | Access disabled; retain reason, actor and timestamp |
| `Deceased` | `DECEASED` | Access disabled; retain historical record and suppress directory |

`Terminated` and `Deceased` are distinct from `Expired`. `Expired` is a time-based membership outcome; `Terminated` is an administrative removal; `Deceased` is a life-event record.

| New member field | SuiteCRM source field | Rule |
| --- | --- | --- |
| `legacyId` | `ID` | Required migration key; retain as external reference |
| `firstName` | `First Name` | Trim; review compound/household names |
| `lastName` | `Last Name` | Trim; review compound/household names |
| `displayNameZh` | `Chinese Name` | Nullable |
| `email` | `Email Address`, fallback `Email-DSOBA (cancel)`, then `Company Email` | Normalize lowercase; quarantine conflicts |
| `mobile` | `Mobile`, fallback `Other Mobile`, then `Whatsapp` | Normalize to E.164 where possible |
| `dateOfBirth` | `Birthdate` | ISO date; quarantine invalid/future values |
| `classYear` | `Class of Exit`, fallback `Class of Entry` | Preserve source value until business confirmation |
| `universityName` | `University name` | Nullable |
| `memberNumber` | `Member Number` | Preserve; enforce uniqueness after trimming |
| `accountType` | `Portal User Type`, `Member Status` | Map guest/non-member rows to `GUEST`, waiting rows to `APPLICANT`, approved member rows to `MEMBER` |
| `membershipStatus` | `Member Status`, fallback `Approval status` | Map to `PENDING`, `ACTIVE`, `SUSPENDED`, `EXPIRED`, `TERMINATED`, `DECEASED`, `REJECTED`, `WITHDRAWN` or `CANCELLED`; retain unmapped source value in `legacyStatus` |
| `membershipType` | `Membership Type  (cancel)`, `Member Level ID` | Map to `YOUTH`, `TRIAL` or `LIFE`; retain unknown values for review |
| `membershipExpiry` | `Member end date` | ISO date; `2999-12-31` must be treated as a source sentinel |
| `chapter` | `Legal chapter`, fallback `Music Chapter`, `FIBA chapter`, `DBE chapter` | Keep source relationships in a separate link table |
| `privacyDirectory` | `Phone - Directory`, `Publish profile?`, `Publish Status?` | Map only after privacy rule confirmation |
| `createdAt` | `Date Created` | Preserve source timestamp |
| `updatedAt` | `Date Modified` | Preserve source timestamp |

## Fields requiring review

- Compound household rows appear possible (for example, a salutation/name containing two people). These must not be split automatically.
- Membership type/status values need a signed mapping table before production activation.
- `Deceased` means the member has passed away and must remain as a historical status; it is not `Expired`.
- `Terminated` means DSOBA actively removed the member; it is not `Expired` and must retain an audit trail.
- `Expired` means the membership validity ended and may support a later renewal/reactivation workflow.
- The export includes operational, parking, event, QR, geolocation and other fields outside the Sprint 1 member core. Keep them in a quarantined source table until a later migration decision.
- Do not import passwords, payment details, secrets or unrelated SuiteCRM workflow fields.

## Import sequence

1. Normalize duplicate headers by source position, preserving the raw export.
2. Load the raw rows into a quarantine/staging table with `legacy_id` and row number.
3. Produce a data-quality report: duplicate email/member number, invalid dates, missing names, conflicting status and household records.
4. Obtain approval for membership/status/privacy mapping.
5. Upsert members by `legacyId`; never match solely on name.
6. Write an audit record for every imported/updated member and retain the source row reference.
7. Run the clean-database acceptance scenario before enabling portal visibility.

