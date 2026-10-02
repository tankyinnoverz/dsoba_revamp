-- DSOBA Sprint 1 platform baseline.
-- MySQL 8 / utf8mb4. Apply migrations in filename order.

CREATE TABLE IF NOT EXISTS accounts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  password_hash VARCHAR(255) NULL,
  email_verified_at DATETIME(3) NULL,
  force_password_setup BOOLEAN NOT NULL DEFAULT TRUE,
  status ENUM('PENDING','ACTIVE','SUSPENDED','DISABLED') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_accounts_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS applications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  reference VARCHAR(32) NOT NULL,
  email VARCHAR(320) NOT NULL,
  status ENUM('DRAFT','PENDING','MORE_INFORMATION_REQUIRED','APPROVED','REJECTED','WITHDRAWN','EXPIRED') NOT NULL DEFAULT 'DRAFT',
  payment_status ENUM('NOT_REQUIRED','UNPAID','ONLINE_PAYMENT_PENDING','PROOF_UPLOADED','VERIFYING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'NOT_REQUIRED',
  membership_type ENUM('YOUTH','TRIAL','LIFE') NULL,
  payload JSON NOT NULL,
  submitted_at DATETIME(3) NULL,
  expires_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_applications_reference (reference),
  KEY ix_applications_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_tokens (
  id CHAR(36) NOT NULL PRIMARY KEY,
  account_id CHAR(36) NULL,
  application_id CHAR(36) NULL,
  token_type ENUM('EMAIL_VERIFICATION','PASSWORD_RESET','PASSWORD_SETUP','APPLICATION_RESUME') NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  used_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_auth_tokens_hash (token_hash),
  KEY ix_auth_tokens_expiry (token_type, expires_at),
  CONSTRAINT fk_auth_tokens_account FOREIGN KEY (account_id) REFERENCES accounts(id),
  CONSTRAINT fk_auth_tokens_application FOREIGN KEY (application_id) REFERENCES applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  account_id CHAR(36) NOT NULL,
  session_hash CHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  revoked_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_sessions_hash (session_hash),
  KEY ix_sessions_account (account_id, expires_at),
  CONSTRAINT fk_sessions_account FOREIGN KEY (account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS object_uploads (
  id CHAR(36) NOT NULL PRIMARY KEY,
  owner_type ENUM('APPLICATION','MEMBER') NOT NULL,
  owner_id CHAR(36) NOT NULL,
  object_key VARCHAR(512) NOT NULL,
  content_type VARCHAR(128) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL,
  visibility ENUM('PRIVATE') NOT NULL DEFAULT 'PRIVATE',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_object_upload_key (object_key),
  KEY ix_object_upload_owner (owner_type, owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) NOT NULL PRIMARY KEY,
  application_id CHAR(36) NOT NULL,
  provider VARCHAR(64) NOT NULL,
  provider_reference VARCHAR(255) NULL,
  method ENUM('QFPAY','PAYSLIP') NOT NULL,
  status ENUM('UNPAID','ONLINE_PAYMENT_PENDING','PROOF_UPLOADED','VERIFYING','PAID','FAILED','REFUNDED') NOT NULL,
  amount_hkd DECIMAL(10,2) NOT NULL,
  raw_reference VARCHAR(255) NULL,
  paid_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_payments_provider_reference (provider, provider_reference),
  KEY ix_payments_application (application_id, status),
  CONSTRAINT fk_payments_application FOREIGN KEY (application_id) REFERENCES applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  actor_account_id CHAR(36) NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id CHAR(36) NOT NULL,
  action VARCHAR(64) NOT NULL,
  previous_state JSON NULL,
  new_state JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY ix_audit_entity (entity_type, entity_id, created_at),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_outbox (
  id CHAR(36) NOT NULL PRIMARY KEY,
  recipient_email VARCHAR(320) NULL,
  channel ENUM('EMAIL','WHATSAPP') NOT NULL,
  template VARCHAR(128) NOT NULL,
  payload JSON NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL,
  status ENUM('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
  attempts INT UNSIGNED NOT NULL DEFAULT 0,
  available_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  sent_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_outbox_idempotency (idempotency_key),
  KEY ix_outbox_delivery (status, available_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
