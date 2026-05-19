--liquibase formatted sql

--changeset omprakash:007-create-recurring-obligations

CREATE TABLE ldg_recurring_obligations (
    id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID           NOT NULL REFERENCES ldg_users (id) ON DELETE CASCADE,
    obligation_type  VARCHAR(30)    NOT NULL,
    payee            VARCHAR(255)   NOT NULL,
    amount           NUMERIC(18, 2) NOT NULL,
    frequency        VARCHAR(20)    NOT NULL,
    due_day          INT            CHECK (due_day BETWEEN 1 AND 31),
    payment_source   VARCHAR(255),
    action_on_death  VARCHAR(20),
    remarks          TEXT,
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ldg_recurring_user ON ldg_recurring_obligations (user_id);
