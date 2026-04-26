# HackAZ2026 (VoucherChain) — Backend

## Backend stack
- **Node/Express** API in [`server/`](server/)
- **Postgres** database schema in [`db/schema.sql`](db/schema.sql)

## Local setup

### 1) Create the database + tables
Create a Postgres database called `health_credits`, then run the schema:

```sql
-- from db/schema.sql
```

### 2) Configure environment variables
Copy the example env file:
- Copy [`server/.env.example`](server/.env.example) → `server/.env`

Update the `DB_*` values for your local Postgres.

### 3) Run the API
From the `server` folder:

```bash
npm install
npm start
```

You should see the server start on `http://localhost:5000`.

## Quick manual test (curl examples)

### Health
```bash
curl http://localhost:5000/api/health
```

### Submit a check-in (earns 10 credits)
```bash
curl -X POST http://localhost:5000/api/checkins ^
  -H "Content-Type: application/json" ^
  -d "{\"blood_sugar\": 155, \"insulin_taken\": 2, \"medications_taken\":\"metformin\", \"symptoms\":\"\"}"
```

### List check-ins
```bash
curl http://localhost:5000/api/checkins
```

### Credits balance + ledger
```bash
curl http://localhost:5000/api/credits/balance
curl http://localhost:5000/api/credits/ledger
```

### Redeem credits (defaults to 20 for a Gas card)
```bash
curl -X POST http://localhost:5000/api/redeem ^
  -H "Content-Type: application/json" ^
  -d "{\"reward_type\":\"Gas card\",\"cost\":20}"
```

### Blackboard module completion event (earns 25 credits)
If you set `EVENTS_SHARED_SECRET` in `server/.env`, include the header:

```bash
curl -X POST http://localhost:5000/api/events/blackboard ^
  -H "Content-Type: application/json" ^
  -H "x-events-secret: YOUR_SECRET" ^
  -d "{\"module_id\":\"UnderstandingMyA1C\",\"completed_at\":\"2026-04-25T20:00:00Z\"}"
```

### Insights (Gemma mock alerts)
```bash
curl http://localhost:5000/api/insights?days=7
```

## Notes
- Auth is **MVP-disabled** by default (`AUTH_REQUIRED=false`). A scaffold middleware exists for later Auth0 JWT verification.\n
