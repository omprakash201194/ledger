--liquibase formatted sql

--changeset omprakash:004-create-liabilities

CREATE TABLE ldg_liabilities (
    id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID           NOT NULL REFERENCES ldg_users (id) ON DELETE CASCADE,
    liability_type      VARCHAR(30)    NOT NULL,
    lender              VARCHAR(255)   NOT NULL,
    account_number      VARCHAR(100),
    original_amount     NUMERIC(18, 2),
    outstanding_balance NUMERIC(18, 2),
    emi_amount          NUMERIC(18, 2),
    tenure_end_date     DATE,
    linked_asset_id     UUID           REFERENCES ldg_assets (id) ON DELETE SET NULL,
    remarks             TEXT,
    created_at          TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ldg_liabilities_user ON ldg_liabilities (user_id);
