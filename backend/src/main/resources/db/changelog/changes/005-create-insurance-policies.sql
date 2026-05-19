--liquibase formatted sql

--changeset omprakash:005-create-insurance-policies

CREATE TABLE ldg_insurance_policies (
    id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID           NOT NULL REFERENCES ldg_users (id) ON DELETE CASCADE,
    policy_type         VARCHAR(30)    NOT NULL,
    insurer             VARCHAR(255)   NOT NULL,
    policy_number       VARCHAR(100),
    life_assured        VARCHAR(100),
    sum_assured         NUMERIC(18, 2),
    premium_amount      NUMERIC(18, 2),
    premium_due_month   INT            CHECK (premium_due_month BETWEEN 1 AND 12),
    premium_due_day     INT            CHECK (premium_due_day BETWEEN 1 AND 31),
    trusted_person_id   UUID           REFERENCES ldg_trusted_persons (id) ON DELETE SET NULL,
    maturity_date       DATE,
    document_location   VARCHAR(500),
    remarks             TEXT,
    created_at          TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ldg_insurance_user ON ldg_insurance_policies (user_id);
