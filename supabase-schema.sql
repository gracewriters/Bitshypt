-- BitShypt Supabase Database Schema
-- Run this SQL file in your Supabase SQL Editor

-- 1. Stats table (single row with platform statistics)
DROP TABLE IF EXISTS stats CASCADE;
CREATE TABLE stats (
  id BIGSERIAL PRIMARY KEY,
  packages_delivered BIGINT DEFAULT 2400000,
  countries_active INTEGER DEFAULT 34,
  vlos_compliance NUMERIC(5,2) DEFAULT 99.97,
  avg_proof_of_delivery NUMERIC(4,1) DEFAULT 4.2,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial data
INSERT INTO stats (packages_delivered, countries_active, vlos_compliance, avg_proof_of_delivery)
VALUES (2400000, 34, 99.97, 4.2)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 2. Telemetry table (drone telemetry data)
DROP TABLE IF EXISTS telemetry CASCADE;
CREATE TABLE telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alt INTEGER,
  speed NUMERIC(5,1),
  battery INTEGER,
  vlos VARCHAR(10),
  hash VARCHAR(255),
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample telemetry data
INSERT INTO telemetry (alt, speed, battery, vlos, hash)
VALUES 
  (118, 24.3, 78, 'OK', '0xa4f9…3b21'),
  (125, 22.5, 72, 'OK', '0xb2e3…7d8e'),
  (110, 26.1, 85, 'OK', '0xf8c2…9c3d');

-- 3. Blocks table (blockchain delivery blocks)
DROP TABLE IF EXISTS blocks CASCADE;
CREATE TABLE blocks (
  block_number BIGINT PRIMARY KEY,
  block_hash VARCHAR(255),
  pod_hash VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample blocks
INSERT INTO blocks (block_number, block_hash, pod_hash, status)
VALUES 
  (1204817, '00000a4f9b2e3c…7d8e12f3', 'a4f9b2e3c71d…0x3b21', 'DELIVERED'),
  (1204816, '00000f8c2a1b4e…9c3d05a1', 'f8c2a1b4e69f…0x9a04', 'IN_TRANSIT'),
  (1204815, '00000b3e7f2c9d…2a4e18b7', 'b3e7f2c9d48a…0x71cc', 'ACCEPTED');

-- 4. Sample data table (marketplace items)
DROP TABLE IF EXISTS sample_data CASCADE;
CREATE TABLE sample_data (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  value TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample marketplace data
INSERT INTO sample_data (name, value)
VALUES 
  ('Rooftop MkII', 'Premium urban drone landing pad'),
  ('BalconyClip Pro', 'Compact balcony mount for micro-drones'),
  ('Ground Shield X1', 'Weatherproof ground landing pad');

-- Enable RLS (Row Level Security) - optional, for public access
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read for all users" ON stats FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON telemetry FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON blocks FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON sample_data FOR SELECT USING (true);

-- Verify tables were created
SELECT 'Setup complete!' as status;
