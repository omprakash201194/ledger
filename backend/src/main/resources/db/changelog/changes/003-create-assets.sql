--liquibase formatted sql

--changeset omprakash:003-create-assets

CREATE TABLE ldg_assets (
    id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID           NOT NULL REFERENCES ldg_users (id) ON DELETE CASCADE,
    asset_type          VARCHAR(30)    NOT NULL,
    description         VARCHAR(255)   NOT NULL,
    institution         VARCHAR(255),
    account_number      VARCHAR(100),
    holding_mode        VARCHAR(30)    NOT NULL DEFAULT 'SINGLE',
    joint_holder_name   VARCHAR(100),
    trusted_person_id   UUID           REFERENCES ldg_trusted_persons (id) ON DELETE SET NULL,
    approx_value        NUMERIC(18, 2),
    value_as_of         DATE,
    document_location   VARCHAR(500),
    remarks             TEXT,
    created_at          TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ldg_assets_user ON ldg_assets (user_id);
