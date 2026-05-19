--liquibase formatted sql

--changeset omprakash:008-create-will-records

CREATE TABLE ldg_will_records (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID         NOT NULL REFERENCES ldg_users (id) ON DELETE CASCADE,
    has_will            BOOLEAN      NOT NULL DEFAULT FALSE,
    will_type           VARCHAR(20),
    location            VARCHAR(500),
    executor_id         UUID         REFERENCES ldg_trusted_persons (id) ON DELETE SET NULL,
    registered_with     VARCHAR(255),
    review_reminder_date DATE,
    notes               TEXT,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);
