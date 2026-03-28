-- Nexaxotics Database Schema
-- Run this against PostgreSQL to initialize the schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Agencies (one per account)
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  website VARCHAR(500),
  services TEXT[] DEFAULT '{}',
  brand_color VARCHAR(7) DEFAULT '#4F46E5',
  logo_url VARCHAR(1000),
  email_verified BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  website VARCHAR(500),
  services_contracted TEXT[] DEFAULT '{}',
  start_date DATE,
  contract_duration VARCHAR(100),
  project_scope TEXT,
  monthly_fee NUMERIC(10,2),
  payment_terms VARCHAR(255),
  currency VARCHAR(10) DEFAULT 'USD',
  instagram_handle VARCHAR(255),
  facebook_page VARCHAR(500),
  google_ads_id VARCHAR(255),
  website_cms VARCHAR(255),
  ad_account_id VARCHAR(255),
  meeting_platform VARCHAR(100),
  calendly_link VARCHAR(500),
  business_goals TEXT,
  target_audience TEXT,
  key_metrics TEXT,
  reporting_frequency VARCHAR(50) DEFAULT 'monthly',
  lifecycle_stage INTEGER DEFAULT 1 CHECK (lifecycle_stage BETWEEN 1 AND 10),
  status VARCHAR(50) DEFAULT 'active',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (one per type per client)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id),
  doc_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  generated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_to_email VARCHAR(255),
  pdf_url VARCHAR(1000),
  pdf_expires_at TIMESTAMPTZ,
  custom_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, doc_type)
);

-- Status Updates
CREATE TABLE IF NOT EXISTS status_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id),
  update_type VARCHAR(50) DEFAULT 'weekly',
  content TEXT NOT NULL,
  next_steps TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  document_id UUID REFERENCES documents(id),
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  sendgrid_message_id VARCHAR(500),
  status VARCHAR(50) DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_agency_id ON clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_clients_lifecycle ON clients(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_agency_doc_type ON documents(agency_id, doc_type);
CREATE INDEX IF NOT EXISTS idx_status_updates_client ON status_updates(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_client ON email_logs(client_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_agency ON email_logs(agency_id, sent_at DESC);
