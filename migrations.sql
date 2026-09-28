-- ============================================================
-- MIGRATIONS LOG
-- ============================================================
-- Every schema change (new column, new table, ALTER, etc.) gets
-- added here BEFORE running it anywhere. Run on `staging` first,
-- test locally, then run the EXACT same SQL on `main`.
--
-- Workflow: write it here → run on staging → test locally →
--           run identical SQL on main → deploy code
-- ============================================================


-- 2026-09-24: (example placeholder — delete once you have real entries)
-- ALTER TABLE quote_templates ADD COLUMN tax_rate NUMERIC(6,3) DEFAULT 0;