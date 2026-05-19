--liquibase formatted sql

--changeset omprakash:002-create-trusted-persons

CREATE TABLE ldg_trusted_persons (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL REFERENCES ldg_users (id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    relationship VARCHAR(100),
    type         VARCHAR(20)  NOT NULL,
    phone        VARCHAR(30),
    email        VARCHAR(255),
    notes        TEXT,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ldg_trusted_persons_user ON ldg_trusted_persons (user_id);
