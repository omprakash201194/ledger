--liquibase formatted sql

--changeset omprakash:006-create-digital-accounts

CREATE TABLE ldg_digital_accounts (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID         NOT NULL REFERENCES ldg_users (id) ON DELETE CASCADE,
    category            VARCHAR(30)  NOT NULL,
    service_name        VARCHAR(255) NOT NULL,
    username            VARCHAR(255),
    credential_location VARCHAR(500),
    two_fa_method       VARCHAR(100),
    recovery_contact    VARCHAR(255),
    action_on_death     VARCHAR(20),
    remarks             TEXT,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ldg_digital_accounts_user ON ldg_digital_accounts (user_id);
