-- DineFlow PostgreSQL initialization script
-- Creates the application database user and enables required extensions

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for fuzzy text search (menu items, restaurant search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Seed a free plan for new restaurant registrations
INSERT INTO plans (id, name, slug, monthly_price, annual_price, max_tables, max_staff, has_analytics, has_feedback, has_payments, features, is_active, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'Free',
    'free',
    0.00,
    0.00,
    5,
    3,
    false,
    true,
    false,
    '{"description": "Get started with basic restaurant management"}',
    true,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;
