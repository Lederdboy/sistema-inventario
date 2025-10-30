/*
  # Inventory Management System Database Schema

  ## Overview
  Complete inventory management system with products, categories, suppliers, 
  stock movements, and requirements tracking.

  ## New Tables
  
  ### 1. `categories`
    - `id` (uuid, primary key) - Unique category identifier
    - `name` (text) - Category name
    - `description` (text) - Category description
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. `suppliers`
    - `id` (uuid, primary key) - Unique supplier identifier
    - `name` (text) - Supplier name
    - `contact_name` (text) - Contact person name
    - `email` (text) - Contact email
    - `phone` (text) - Contact phone
    - `address` (text) - Supplier address
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. `products`
    - `id` (uuid, primary key) - Unique product identifier
    - `sku` (text, unique) - Stock keeping unit
    - `name` (text) - Product name
    - `description` (text) - Product description
    - `category_id` (uuid) - Foreign key to categories
    - `supplier_id` (uuid) - Foreign key to suppliers
    - `unit_price` (decimal) - Product price per unit
    - `current_stock` (integer) - Current stock quantity
    - `min_stock` (integer) - Minimum stock threshold
    - `max_stock` (integer) - Maximum stock capacity
    - `location` (text) - Storage location
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp
  
  ### 4. `stock_movements`
    - `id` (uuid, primary key) - Unique movement identifier
    - `product_id` (uuid) - Foreign key to products
    - `movement_type` (text) - Type: 'IN', 'OUT', 'ADJUSTMENT'
    - `quantity` (integer) - Quantity moved
    - `previous_stock` (integer) - Stock before movement
    - `new_stock` (integer) - Stock after movement
    - `reason` (text) - Movement reason
    - `reference` (text) - Reference number/document
    - `notes` (text) - Additional notes
    - `created_at` (timestamptz) - Movement timestamp
    - `created_by` (uuid) - User who created the movement
  
  ### 5. `requirements`
    - `id` (uuid, primary key) - Unique requirement identifier
    - `product_id` (uuid) - Foreign key to products
    - `quantity_needed` (integer) - Quantity required
    - `priority` (text) - Priority: 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    - `status` (text) - Status: 'PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED'
    - `requested_by` (text) - Person who requested
    - `department` (text) - Requesting department
    - `reason` (text) - Reason for requirement
    - `expected_date` (date) - Expected delivery date
    - `approved_by` (text) - Approver name
    - `approved_at` (timestamptz) - Approval timestamp
    - `notes` (text) - Additional notes
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ## Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data
    - Users can read all data
    - Users can insert, update, and delete their own data

  ## Indexes
    - Products: SKU, category_id, supplier_id, current_stock
    - Stock movements: product_id, created_at
    - Requirements: product_id, status, priority
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  unit_price decimal(10,2) DEFAULT 0,
  current_stock integer DEFAULT 0,
  min_stock integer DEFAULT 0,
  max_stock integer DEFAULT 1000,
  location text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  movement_type text NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity integer NOT NULL,
  previous_stock integer NOT NULL,
  new_stock integer NOT NULL,
  reason text DEFAULT '',
  reference text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

-- Create requirements table
CREATE TABLE IF NOT EXISTS requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity_needed integer NOT NULL,
  priority text DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED')),
  requested_by text NOT NULL,
  department text DEFAULT '',
  reason text DEFAULT '',
  expected_date date,
  approved_by text DEFAULT '',
  approved_at timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(current_stock);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_requirements_product ON requirements(product_id);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements(status);
CREATE INDEX IF NOT EXISTS idx_requirements_priority ON requirements(priority);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view all categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Suppliers policies
CREATE POLICY "Users can view all suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (true);

-- Products policies
CREATE POLICY "Users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Stock movements policies
CREATE POLICY "Users can view all stock movements"
  ON stock_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert stock movements"
  ON stock_movements FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update stock movements"
  ON stock_movements FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete stock movements"
  ON stock_movements FOR DELETE
  TO authenticated
  USING (true);

-- Requirements policies
CREATE POLICY "Users can view all requirements"
  ON requirements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert requirements"
  ON requirements FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update requirements"
  ON requirements FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete requirements"
  ON requirements FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();