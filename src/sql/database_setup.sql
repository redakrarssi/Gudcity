-- Database schema and functions for GudCity Loyalty System

-- Enable RLS (Row Level Security)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Foreign Key Relationships

-- users to businesses
ALTER TABLE users 
ADD CONSTRAINT fk_users_business 
FOREIGN KEY (business_id) 
REFERENCES businesses(id) 
ON DELETE SET NULL;

-- customers to businesses
ALTER TABLE customers 
ADD CONSTRAINT fk_customers_business 
FOREIGN KEY (business_id) 
REFERENCES businesses(id) 
ON DELETE CASCADE;

-- loyalty_programs to businesses
ALTER TABLE loyalty_programs 
ADD CONSTRAINT fk_programs_business 
FOREIGN KEY (business_id) 
REFERENCES businesses(id) 
ON DELETE CASCADE;

-- transactions to businesses, customers, programs, and staff
ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_business 
FOREIGN KEY (business_id) 
REFERENCES businesses(id) 
ON DELETE CASCADE;

ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_customer 
FOREIGN KEY (customer_id) 
REFERENCES customers(id) 
ON DELETE CASCADE;

ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_program 
FOREIGN KEY (program_id) 
REFERENCES loyalty_programs(id) 
ON DELETE SET NULL;

ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_staff 
FOREIGN KEY (staff_id) 
REFERENCES users(id) 
ON DELETE SET NULL;

-- rewards to businesses and programs
ALTER TABLE rewards 
ADD CONSTRAINT fk_rewards_business 
FOREIGN KEY (business_id) 
REFERENCES businesses(id) 
ON DELETE CASCADE;

ALTER TABLE rewards 
ADD CONSTRAINT fk_rewards_program 
FOREIGN KEY (program_id) 
REFERENCES loyalty_programs(id) 
ON DELETE CASCADE;

-- loyalty_cards to businesses, customers, and programs
ALTER TABLE loyalty_cards 
ADD CONSTRAINT fk_loyalty_cards_business 
FOREIGN KEY (business_id) 
REFERENCES businesses(id) 
ON DELETE CASCADE;

ALTER TABLE loyalty_cards 
ADD CONSTRAINT fk_loyalty_cards_customer 
FOREIGN KEY (customer_id) 
REFERENCES customers(id) 
ON DELETE CASCADE;

ALTER TABLE loyalty_cards 
ADD CONSTRAINT fk_loyalty_cards_program 
FOREIGN KEY (program_id) 
REFERENCES loyalty_programs(id) 
ON DELETE CASCADE;

-- settings to businesses
ALTER TABLE settings 
ADD CONSTRAINT fk_settings_business 
FOREIGN KEY (business_id) 
REFERENCES businesses(id) 
ON DELETE CASCADE;

-- Helper Functions for Point Management

-- Function to increment customer points
CREATE OR REPLACE FUNCTION increment_customer_points(p_customer_id UUID, p_points_amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE customers
  SET total_points = total_points + p_points_amount,
      updated_at = NOW()
  WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement customer points
CREATE OR REPLACE FUNCTION decrement_customer_points(p_customer_id UUID, p_points_amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE customers
  SET total_points = GREATEST(0, total_points - p_points_amount),
      updated_at = NOW()
  WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment loyalty card points
CREATE OR REPLACE FUNCTION increment_loyalty_card_points(p_customer_id UUID, p_program_id UUID, p_points_amount INT)
RETURNS VOID AS $$
DECLARE
  v_card_id UUID;
  v_program_type TEXT;
BEGIN
  -- Get the program type
  SELECT type INTO v_program_type
  FROM loyalty_programs
  WHERE id = p_program_id;
  
  -- Get the loyalty card ID
  SELECT id INTO v_card_id
  FROM loyalty_cards
  WHERE customer_id = p_customer_id AND program_id = p_program_id;
  
  IF v_card_id IS NULL THEN
    -- Card doesn't exist, create a new one
    INSERT INTO loyalty_cards (
      id, business_id, customer_id, program_id, points_balance, 
      punch_count, tier, issue_date, active, created_at, updated_at
    )
    SELECT 
      gen_random_uuid(), business_id, p_customer_id, p_program_id, p_points_amount, 
      CASE WHEN v_program_type = 'punchcard' THEN 1 ELSE NULL END,
      CASE WHEN v_program_type = 'tiered' THEN 'Bronze' ELSE NULL END,
      NOW(), true, NOW(), NOW()
    FROM loyalty_programs
    WHERE id = p_program_id;
  ELSE
    -- Update existing card
    IF v_program_type = 'points' OR v_program_type = 'tiered' THEN
      UPDATE loyalty_cards
      SET points_balance = points_balance + p_points_amount,
          updated_at = NOW()
      WHERE id = v_card_id;
      
      -- Check and update tier for tiered programs
      IF v_program_type = 'tiered' THEN
        PERFORM update_customer_tier(v_card_id);
      END IF;
    ELSIF v_program_type = 'punchcard' THEN
      UPDATE loyalty_cards
      SET punch_count = punch_count + 1,
          updated_at = NOW()
      WHERE id = v_card_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement loyalty card points
CREATE OR REPLACE FUNCTION decrement_loyalty_card_points(p_customer_id UUID, p_program_id UUID, p_points_amount INT)
RETURNS VOID AS $$
DECLARE
  v_card_id UUID;
  v_program_type TEXT;
BEGIN
  -- Get the program type
  SELECT type INTO v_program_type
  FROM loyalty_programs
  WHERE id = p_program_id;
  
  -- Get the loyalty card ID
  SELECT id INTO v_card_id
  FROM loyalty_cards
  WHERE customer_id = p_customer_id AND program_id = p_program_id;
  
  IF v_card_id IS NOT NULL THEN
    -- Update existing card
    IF v_program_type = 'points' OR v_program_type = 'tiered' THEN
      UPDATE loyalty_cards
      SET points_balance = GREATEST(0, points_balance - p_points_amount),
          updated_at = NOW()
      WHERE id = v_card_id;
      
      -- Check and update tier for tiered programs
      IF v_program_type = 'tiered' THEN
        PERFORM update_customer_tier(v_card_id);
      END IF;
    ELSIF v_program_type = 'punchcard' THEN
      -- Reset punch card after redemption
      UPDATE loyalty_cards
      SET punch_count = 0,
          updated_at = NOW()
      WHERE id = v_card_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer tier based on points
CREATE OR REPLACE FUNCTION update_customer_tier(p_card_id UUID)
RETURNS VOID AS $$
DECLARE
  v_program_id UUID;
  v_points_balance INT;
  v_tiers JSONB;
  v_current_tier TEXT;
  v_new_tier TEXT := 'Bronze'; -- Default tier
BEGIN
  -- Get card info
  SELECT program_id, points_balance, tier
  INTO v_program_id, v_points_balance, v_current_tier
  FROM loyalty_cards
  WHERE id = p_card_id;
  
  -- Get program tiers
  SELECT rules->'tiers' INTO v_tiers
  FROM loyalty_programs
  WHERE id = v_program_id;
  
  -- Find the appropriate tier based on points
  FOR i IN 0..jsonb_array_length(v_tiers) - 1 LOOP
    IF v_points_balance >= (v_tiers->i->>'threshold')::INT THEN
      v_new_tier := v_tiers->i->>'name';
    END IF;
  END LOOP;
  
  -- Update tier if changed
  IF v_current_tier IS DISTINCT FROM v_new_tier THEN
    UPDATE loyalty_cards
    SET tier = v_new_tier,
        updated_at = NOW()
    WHERE id = p_card_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers for data integrity and automation

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER set_updated_at_businesses
BEFORE UPDATE ON businesses
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_customers
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_loyalty_programs
BEFORE UPDATE ON loyalty_programs
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_transactions
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_rewards
BEFORE UPDATE ON rewards
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_loyalty_cards
BEFORE UPDATE ON loyalty_cards
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_settings
BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS Policies for table security

-- Businesses: Users can only access their own business
CREATE POLICY business_owner_access ON businesses
FOR ALL USING (
  auth.uid() IN (
    SELECT owner_id FROM businesses WHERE id = businesses.id
  )
);

-- Users: Business owners can access only their business's users
CREATE POLICY business_users_access ON users
FOR ALL USING (
  auth.uid() IN (
    SELECT owner_id FROM businesses WHERE id = users.business_id
  )
);

-- Customers: Business users can access only their business's customers
CREATE POLICY business_customers_access ON customers
FOR ALL USING (
  auth.uid() IN (
    SELECT owner_id FROM businesses WHERE id = customers.business_id
  ) OR 
  auth.uid() IN (
    SELECT id FROM users WHERE business_id = customers.business_id
  )
);

-- Index for performance optimization
CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_loyalty_programs_business_id ON loyalty_programs(business_id);
CREATE INDEX idx_transactions_business_id ON transactions(business_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_loyalty_cards_customer_id_program_id ON loyalty_cards(customer_id, program_id);
CREATE INDEX idx_settings_business_id_category ON settings(business_id, category);

-- Database Schema Setup for Gudcity
-- This file contains all the SQL statements to create the necessary database tables
-- To be used with the setup-neon-database.js script

-- Users table: Stores authentication and user information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  business_id UUID,
  role VARCHAR(20) CHECK (role IN ('admin', 'manager', 'staff', 'customer')) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Businesses table: Stores business information
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint from users to businesses after both tables exist
ALTER TABLE users ADD CONSTRAINT fk_user_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL;

-- Customers table: Stores customer information
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  sign_up_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  total_points INTEGER DEFAULT 0,
  birthday DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

-- Loyalty Programs table: Defines different types of loyalty programs for businesses
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('points', 'punchcard', 'tiered')) NOT NULL,
  description TEXT,
  rules JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Rewards table: Defines rewards that customers can redeem with points
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  program_id UUID REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Loyalty Cards table: Links customers with loyalty programs
CREATE TABLE IF NOT EXISTS loyalty_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  program_id UUID REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  points_balance INTEGER DEFAULT 0,
  punch_count INTEGER,
  tier VARCHAR(50),
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, program_id)
);

-- Transactions table: Records purchases, refunds, and reward redemptions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  program_id UUID REFERENCES loyalty_programs(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  type VARCHAR(20) CHECK (type IN ('purchase', 'refund', 'reward_redemption')) NOT NULL,
  staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  receipt_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Settings table: Stores business-specific settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  settings_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Redemption Codes table: Stores promotional or reward codes
CREATE TABLE IF NOT EXISTS redemption_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL UNIQUE,
  reward_id UUID REFERENCES rewards(id) ON DELETE SET NULL,
  value_type VARCHAR(20) CHECK (value_type IN ('points', 'discount', 'product')) NOT NULL,
  value_amount DECIMAL(10, 2) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES customers(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- QR Codes table: Stores QR codes for various purposes
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  link_url TEXT,
  code_type VARCHAR(20) CHECK (code_type IN ('loyalty', 'product', 'promotion', 'payment')) NOT NULL,
  scans_count INTEGER DEFAULT 0,
  unique_scans_count INTEGER DEFAULT 0,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Comments table: Simple table for demo purposes
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_business_id ON transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_programs_business_id ON loyalty_programs(business_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_customer_id ON loyalty_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_program_id ON loyalty_cards(program_id); 