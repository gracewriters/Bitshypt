-- Combined migration file
-- 1) create safe backups of the two tables
-- 2) add new columns if missing
-- 3) populate new columns from legacy columns where present
-- 4) add simple indexes
-- 5) provide verification queries and commented drop statements

-- IMPORTANT: Run in Supabase SQL editor or psql. BACKUP before applying to production.

-- 0) Create quick backups (lightweight copies). You can skip if you already have backups.
BEGIN;
CREATE TABLE IF NOT EXISTS blocks_backup AS TABLE blocks WITH NO DATA;
INSERT INTO blocks_backup SELECT * FROM blocks;

CREATE TABLE IF NOT EXISTS telemetry_backup AS TABLE telemetry WITH NO DATA;
INSERT INTO telemetry_backup SELECT * FROM telemetry;
COMMIT;

-- 1) Add `zk_proof` and `anchored_at` columns if missing
ALTER TABLE IF EXISTS blocks ADD COLUMN IF NOT EXISTS zk_proof text;
ALTER TABLE IF EXISTS blocks ADD COLUMN IF NOT EXISTS anchored_at timestamptz;

ALTER TABLE IF EXISTS telemetry ADD COLUMN IF NOT EXISTS zk_proof text;

-- 2) Populate `zk_proof` from legacy columns (`pod_hash`, `hash`) if they exist
-- Use COALESCE so we don't overwrite an existing zk_proof
BEGIN;
-- Safely copy from legacy columns only if they exist. Use DO blocks to avoid
-- parse-time errors when a legacy column is missing.
DO $$
BEGIN
	IF EXISTS(
		SELECT 1 FROM information_schema.columns WHERE table_name='blocks' AND column_name='pod_hash'
	) THEN
		EXECUTE 'UPDATE blocks SET zk_proof = COALESCE(zk_proof, pod_hash) WHERE zk_proof IS NULL AND pod_hash IS NOT NULL';
	END IF;

	IF EXISTS(
		SELECT 1 FROM information_schema.columns WHERE table_name='blocks' AND column_name='hash'
	) THEN
		EXECUTE 'UPDATE blocks SET zk_proof = COALESCE(zk_proof, hash) WHERE zk_proof IS NULL AND hash IS NOT NULL';
	END IF;
END$$;

DO $$
BEGIN
	IF EXISTS(
		SELECT 1 FROM information_schema.columns WHERE table_name='telemetry' AND column_name='pod_hash'
	) THEN
		EXECUTE 'UPDATE telemetry SET zk_proof = COALESCE(zk_proof, pod_hash) WHERE zk_proof IS NULL AND pod_hash IS NOT NULL';
	END IF;

	IF EXISTS(
		SELECT 1 FROM information_schema.columns WHERE table_name='telemetry' AND column_name='hash'
	) THEN
		EXECUTE 'UPDATE telemetry SET zk_proof = COALESCE(zk_proof, hash) WHERE zk_proof IS NULL AND hash IS NOT NULL';
	END IF;
END$$;
COMMIT;

-- 3) Create indexes to speed reads (no-op if they already exist)
CREATE INDEX IF NOT EXISTS idx_blocks_block_number ON blocks(block_number DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_recorded_at ON telemetry(recorded_at DESC);

-- Optional: index zk_proof if you will query by it
CREATE INDEX IF NOT EXISTS idx_blocks_zk_proof ON blocks(zk_proof);
CREATE INDEX IF NOT EXISTS idx_telemetry_zk_proof ON telemetry(zk_proof);

-- 4) Verification queries: run these to validate migration
-- Check columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name='blocks' AND column_name IN ('zk_proof','anchored_at');

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name='telemetry' AND column_name='zk_proof';

-- Sample data checks
SELECT block_number, zk_proof, pod_hash, hash
FROM blocks
ORDER BY block_number DESC
LIMIT 10;

SELECT recorded_at, zk_proof, pod_hash, hash
FROM telemetry
ORDER BY recorded_at DESC
LIMIT 10;

-- 5) OPTIONAL: drop legacy columns (UNCOMMENT ONLY AFTER YOU'VE VERIFIED)
-- NOTE: do not run these until you are certain data is correct and backups exist.
-- BEGIN;
-- ALTER TABLE blocks DROP COLUMN IF EXISTS pod_hash;
-- ALTER TABLE blocks DROP COLUMN IF EXISTS hash;
-- ALTER TABLE telemetry DROP COLUMN IF EXISTS pod_hash;
-- ALTER TABLE telemetry DROP COLUMN IF EXISTS hash;
-- COMMIT;

-- 6) Rollback guidance: if something goes wrong and you need to restore from the backups created above:
-- BEGIN; TRUNCATE TABLE blocks; INSERT INTO blocks SELECT * FROM blocks_backup; TRUNCATE TABLE telemetry; INSERT INTO telemetry SELECT * FROM telemetry_backup; COMMIT;

-- End of migration
