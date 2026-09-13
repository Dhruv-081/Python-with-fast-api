/*
# Create complaints table for Pharmaceutical QA system

1. New Tables
- `complaints`
  - `id` (uuid, primary key)
  - `customer_name` (text, not null) - name of the customer filing the complaint
  - `product_name` (text, not null) - name of the pharmaceutical product
  - `batch_lot_number` (text) - batch or lot identifier
  - `manufacturing_date` (date) - date the product was manufactured
  - `expiry_date` (date) - expiration date of the product
  - `quantity_affected` (integer) - number of units affected
  - `complaint_type` (text) - category: Product Quality, Packaging, Labeling, Efficacy, Adverse Event, Other
  - `description` (text) - detailed complaint description
  - `severity` (text) - Critical, Major, Minor
  - `priority` (text) - Urgent, High, Medium, Low
  - `status` (text, default 'Open') - Open, Under Investigation, Resolved, Closed
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `complaints`.
- Allow anon + authenticated CRUD because this is a single-tenant QA tool with no sign-in.
*/

CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  product_name text NOT NULL,
  batch_lot_number text,
  manufacturing_date date,
  expiry_date date,
  quantity_affected integer,
  complaint_type text,
  description text,
  severity text,
  priority text,
  status text NOT NULL DEFAULT 'Open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_complaints" ON complaints;
CREATE POLICY "anon_select_complaints" ON complaints FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_complaints" ON complaints;
CREATE POLICY "anon_insert_complaints" ON complaints FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_complaints" ON complaints;
CREATE POLICY "anon_update_complaints" ON complaints FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_complaints" ON complaints;
CREATE POLICY "anon_delete_complaints" ON complaints FOR DELETE
  TO anon, authenticated USING (true);
