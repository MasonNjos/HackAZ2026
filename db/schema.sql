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