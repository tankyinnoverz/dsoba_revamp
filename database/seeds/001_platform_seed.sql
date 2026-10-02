-- Deterministic local-only seed. Password is intentionally unset; use password setup flow.
INSERT INTO accounts (id, email, email_verified_at, force_password_setup, status)
VALUES ('00000000-0000-4000-8000-000000000001', 'admin@dsoba.local', CURRENT_TIMESTAMP(3), TRUE, 'ACTIVE')
ON DUPLICATE KEY UPDATE email=email;
