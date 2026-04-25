-- Database schema for Health Credits Platform

-- Users table (minimal, since Auth0 handles auth)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily check-ins table
CREATE TABLE daily_checkins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    checkin_date DATE NOT NULL,
    blood_sugar DECIMAL(5,2),
    insulin_taken DECIMAL(5,2),
    medications_taken TEXT,
    symptoms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, checkin_date)
);

-- Credits ledger table
CREATE TABLE credits_ledger (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    transaction_type VARCHAR(50) NOT NULL, -- 'earned', 'redeemed'
    amount INTEGER NOT NULL,
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_checkins_user_date ON daily_checkins(user_id, checkin_date);
CREATE INDEX idx_credits_user ON credits_ledger(user_id);

-- Blackboard / learning module completion events
CREATE TABLE learning_completions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    module_id VARCHAR(255) NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    source VARCHAR(50) DEFAULT 'blackboard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module_id, completed_at)
);

CREATE INDEX idx_learning_user_completed ON learning_completions(user_id, completed_at);

-- new patient table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,  -- ← unique constraint inline
    name VARCHAR(255),
    sex VARCHAR(50),
    height_in DECIMAL(5,2),
    weight_lbs DECIMAL(5,2),
    date_of_birth DATE,
    diseases TEXT[],
    tobacco_vaping BOOLEAN DEFAULT false,
    drinking_times_per_week INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);