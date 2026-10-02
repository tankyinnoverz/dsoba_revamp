-- Sprint 1 member directory and SuiteCRM staging baseline.
-- The staging table keeps source values until status/type/privacy mapping is approved.

CREATE TABLE IF NOT EXISTS members (
  id CHAR(36) NOT NULL PRIMARY KEY,
  legacy_id VARCHAR(128) NULL,
  account_id CHAR(36) NULL,
  member_number VARCHAR(64) NULL,
  first_name VARCHAR(160) NOT NULL,
  last_name VARCHAR(160) NOT NULL,
  display_name_zh VARCHAR(160) NULL,
  email VARCHAR(320) NULL,
  mobile VARCHAR(32) NULL,
  date_of_birth DATE NULL,
  class_year VARCHAR(32) NULL,
  university_name VARCHAR(255) NULL,
  membership_type ENUM('YOUTH','TRIAL','LIFE') NULL,
  membership_status VARCHAR(64) NOT NULL DEFAULT 'Pending',
  legacy_status VARCHAR(128) NULL,
  membership_expiry DATE NULL,
  directory_visible BOOLEAN NOT NULL DEFAULT FALSE,
  phone_visible BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_members_legacy_id (legacy_id),
  UNIQUE KEY uq_members_member_number (member_number),
  KEY ix_members_directory (directory_visible, membership_status),
  CONSTRAINT fk_members_account FOREIGN KEY (account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suitecrm_member_staging (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  source_file VARCHAR(255) NOT NULL,
  source_row_number INT UNSIGNED NOT NULL,
  legacy_id VARCHAR(128) NULL,
  raw_payload JSON NOT NULL,
  normalized_email VARCHAR(320) NULL,
  normalized_member_number VARCHAR(64) NULL,
  legacy_status VARCHAR(128) NULL,
  proposed_membership_type ENUM('YOUTH','TRIAL','LIFE') NULL,
  proposed_directory_visible BOOLEAN NULL,
  proposed_phone_visible BOOLEAN NULL,
  validation_status ENUM('PENDING','READY','QUARANTINED','IMPORTED') NOT NULL DEFAULT 'PENDING',
  validation_errors JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_suitecrm_source_row (source_file, source_row_number),
  KEY ix_suitecrm_validation (validation_status),
  KEY ix_suitecrm_legacy_id (legacy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

