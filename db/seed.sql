-- db/seed.sql
INSERT INTO users (id, auth0_id, email, name)
VALUES (1, 'mock-auth0-id', 'test@test.com', 'Test User')
ON CONFLICT DO NOTHING;