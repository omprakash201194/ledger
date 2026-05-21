-- liquibase formatted sql

-- changeset omprakash:011-add-asset-maturity-date
ALTER TABLE ldg_assets ADD COLUMN IF NOT EXISTS maturity_date DATE;
-- rollback ALTER TABLE ldg_assets DROP COLUMN IF EXISTS maturity_date;
