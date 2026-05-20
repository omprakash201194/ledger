--liquibase formatted sql

--changeset ogautam:010-create-password-reset-tokens
CREATE TABLE ldg_password_reset_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID        NOT NULL REFERENCES ldg_users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMP   NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prt_token_hash ON ldg_password_reset_tokens(token_hash);
