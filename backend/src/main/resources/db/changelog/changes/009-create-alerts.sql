--liquibase formatted sql

--changeset omprakash:009-create-alerts

CREATE TABLE ldg_alerts (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID         NOT NULL REFERENCES ldg_users (id) ON DELETE CASCADE,
    alert_type     VARCHAR(30)  NOT NULL,
    title          VARCHAR(255) NOT NULL,
    message        TEXT         NOT NULL,
    source_entity  VARCHAR(100),
    due_date       DATE,
    is_read        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ldg_alerts_user        ON ldg_alerts (user_id, is_read);
CREATE INDEX idx_ldg_alerts_source      ON ldg_alerts (user_id, source_entity, alert_type) WHERE is_read = FALSE;
