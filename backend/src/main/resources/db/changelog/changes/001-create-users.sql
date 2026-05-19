--liquibase formatted sql

--changeset omprakash:001-create-users

CREATE TABLE ldg_users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    name          VARCHAR(100) NOT NULL,
    provider      VARCHAR(10)  NOT NULL DEFAULT 'LOCAL',
    password_hash VARCHAR(255),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);
