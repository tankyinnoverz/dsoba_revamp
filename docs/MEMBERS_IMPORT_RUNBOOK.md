# SuiteCRM Members Import Runbook

This runbook is for the reviewed `resources/Old_Data/Members.csv` export. The original file must remain unchanged.

## Safety gates

- Run validation first: `node scripts/migration/validate-members-csv.mjs`.
- Require a fresh database backup and a named operator before import.
- Import into `legacy_member_import_staging` first; do not write directly to `members`.
- Rows with duplicate email or member number are `QUARANTINED` until resolved.
- Preserve `legacy_id`, source row number, import batch and validation errors for audit.
- Never import passwords, payment details, secrets or unrelated workflow payloads.

## Approved mappings

- `Active` → `ACTIVE`
- `Trial Expired` → `EXPIRED`
- `Terminated` → `TERMINATED`
- `Deceased` → `DECEASED`
- `Life Member` → `LIFE`
- `Trial Member` → `TRIAL`
- `Guest` → `account_type = GUEST`

`Expired`, `Terminated` and `Deceased` must remain separate statuses.

## Execution order

1. Apply migrations `001_platform_identity_storage.sql` and `002_membership_directory.sql` to an empty or backup-restored MySQL 8 database.
2. Run the CSV validator and archive its JSON report with the import batch identifier.
3. Load normalized, allow-listed fields into `legacy_member_import_staging`.
4. Quarantine duplicate email/member-number rows and any row with an unmapped status/type or invalid source relationship.
5. Review the quarantine report and approve a batch-specific exception list.
6. Upsert approved rows into `members` using `legacy_id` as the stable key; never match by name alone.
7. Create `memberships` and `member_directory_preferences` records in the same transaction.
8. Write an audit event for each insert/update and mark staging rows `IMPORTED`.
9. Run the clean-database acceptance scenario and verify counts before enabling directory visibility.

## Required runtime configuration

The import worker must receive a MySQL connection string through the deployment secret store, not a committed file. No import should run until the database owner supplies the host, database, least-privilege user and backup/restore procedure.

