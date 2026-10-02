-- DSOBA Sprint 1 membership and SuiteCRM staging schema.
-- Apply after 001_platform_identity_storage.sql.

CREATE TABLE IF NOT EXISTS members (
  id CHAR(36) NOT NULL PRIMARY KEY,
  account_id CHAR(36) NULL,
  legacy_id VARCHAR(128) NULL,
  member_number VARCHAR(64) NULL,
  account_type ENUM('GUEST','APPLICANT','MEMBER') NOT NULL DEFAULT 'MEMBER',
  membership_status ENUM('PENDING','ACTIVE','SUSPENDED','EXPIRED','TERMINATED','DECEASED','REJECTED','WITHDRAWN','CANCELLED') NOT NULL DEFAULT 'PENDING',
  membership_type ENUM('YOUTH','TRIAL','LIFE') NULL,
  first_name VARCHAR(160) NOT NULL,
  last_name VARCHAR(160) NOT NULL,
  display_name_zh VARCHAR(160) NULL,
  email VARCHAR(320) NULL,
  mobile VARCHAR(40) NULL,
  date_of_birth DATE NULL,
  class_year VARCHAR(32) NULL,
  university_name VARCHAR(255) NULL,
  chapter VARCHAR(160) NULL,
  legacy_status VARCHAR(160) NULL,
  source_updated_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_members_legacy_id (legacy_id),
  UNIQUE KEY uq_members_member_number (member_number),
  KEY ix_members_email (email),
  KEY ix_members_status (membership_status, membership_type),
  CONSTRAINT fk_members_account FOREIGN KEY (account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS memberships (
  id CHAR(36) NOT NULL PRIMARY KEY,
  member_id CHAR(36) NOT NULL,
  membership_type ENUM('YOUTH','TRIAL','LIFE') NOT NULL,
  status ENUM('PENDING','ACTIVE','SUSPENDED','EXPIRED','TERMINATED','DECEASED','REJECTED','WITHDRAWN','CANCELLED') NOT NULL,
  starts_at DATE NULL,
  expires_at DATE NULL,
  ended_at DATE NULL,
  source VARCHAR(64) NOT NULL DEFAULT 'DSOBA',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY ix_memberships_member (member_id, status),
  CONSTRAINT fk_memberships_member FOREIGN KEY (member_id) REFERENCES members(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS member_directory_preferences (
  member_id CHAR(36) NOT NULL PRIMARY KEY,
  directory_visible BOOLEAN NOT NULL DEFAULT FALSE,
  phone_visible BOOLEAN NOT NULL DEFAULT FALSE,
  source VARCHAR(64) NOT NULL DEFAULT 'DSOBA',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_directory_preferences_member FOREIGN KEY (member_id) REFERENCES members(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS legacy_member_import_staging (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  import_batch VARCHAR(64) NOT NULL,
  source_row_number INT UNSIGNED NOT NULL,
  legacy_id VARCHAR(128) NULL,
  raw_payload JSON NOT NULL,
  validation_status ENUM('READY','QUARANTINED','IMPORTED') NOT NULL DEFAULT 'READY',
  validation_errors JSON NULL,
  imported_member_id CHAR(36) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_import_row (import_batch, source_row_number),
  KEY ix_import_validation (import_batch, validation_status),
  CONSTRAINT fk_import_member FOREIGN KEY (imported_member_id) REFERENCES members(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
