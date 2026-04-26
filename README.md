# 🌵 Saguaro Link

> **HackAZ 2026 — Southern Arizona Social Innovation Track**  
> **Challenge 2: Expanding Access to Chronic Care for Communities in Rural Arizona**  
> **Partner:** Banner – University Family Care

---

## 🩺 About the Project

**Saguaro Link** is a bilingual (English/Spanish) health management portal designed for Medicaid (AHCCCS) patients in rural Arizona who are managing chronic conditions like diabetes, heart disease, and respiratory illness.

Rural communities face compounding barriers to care: geographic isolation, limited transportation, workforce shortages, and gaps in digital literacy. Saguaro Link addresses these by giving patients a simple, culturally responsive tool to stay connected to their care team — even between appointments.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎤 **Voice Check-In** | Speak your health update — the app transcribes and parses it into structured vitals using AI |
| ⌨️ **Text Check-In** | Standard form with mood, activity, symptoms, blood pressure, and blood glucose |
| 🖼️ **Picture Mode** | Emoji/image-based check-in for patients with lower digital literacy |
| 🤖 **AI Health Insights** | Powered by Gemini — gives a brief, empathetic response in English or Spanish |
| 🔥 **Streak & Rewards** | Daily check-in streaks earn Banner Bucks and Grocery Credits — incentivizing consistent engagement |
| 🚗 **Request a Ride** | Book a wheelchair-accessible ride to appointments directly from the app |
| 📋 **History Logs** | View past check-ins with color-coded blood sugar and blood pressure indicators |
| 💬 **Doctor Chat** | Simulated in-app messaging with a care provider |
| 🌎 **English / Spanish** | Full bilingual support throughout every patient-facing screen |

---

## 🏗️ Tech Stack

### Frontend
- **React** (Create React App)
- **Auth0** for authentication
- **Axios** for API requests
- **Web Speech API** (browser-native) for voice input
- **ElevenLabs** for text-to-speech (interactive voice check-in flow)
- **Vanilla CSS** — no UI frameworks

### Backend
- **Node.js / Express**
- **PostgreSQL** for persistent storage
- **Google Gemini API** (`@google/genai`) for AI health insights and voice transcript parsing
- **Auth0 JWT** middleware (optional, MVP-disabled by default)

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL running locally
- A `.env` file in `server/` (see below)

---

### 1. Clone & Install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

---

### 2. Configure Environment Variables

Create `server/.env` from the example:

```env
PORT=5001
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/health_credits
CORS_ORIGIN=http://localhost:3000
GEMINI_API_KEY=your_google_gemini_api_key
AUTH_REQUIRED=false
```

Create `client/.env`:

```env
REACT_APP_AUTH0_DOMAIN=your_auth0_domain
REACT_APP_AUTH0_CLIENT_ID=your_auth0_client_id
REACT_APP_ELEVEN_LABS_API_KEY=your_elevenlabs_key   # optional — for TTS voice check-in
```

---

### 3. Initialize the Database

The server auto-creates all tables on startup. Just make sure PostgreSQL is running and `DATABASE_URL` is correct.

---

### 4. Run the App

```bash
# Terminal 1 — Start the API
cd server && npm start
# → Server running on http://localhost:5001

# Terminal 2 — Start the React frontend
cd client && npm start
# → App running on http://localhost:3000
```

---

## 📡 API Reference

### Health Check
```bash
GET  /api/health
```

### Daily Check-Ins
```bash
POST /api/checkins          # Submit a check-in (earns 10 credits)
GET  /api/checkins          # List all check-ins
```

### AI Analysis
```bash
POST /api/ai/parse          # Parse a voice transcript into structured health JSON
POST /api/ai/analyze-voice  # Generate an AI insight from a voice check-in
POST /api/ai/analyze-manual # Generate an AI insight from a manual check-in
```

### Rewards & Credits
```bash
GET  /api/credits/balance   # Current points, streak, Banner Bucks, Grocery Credit
GET  /api/credits/ledger    # Full transaction history
POST /api/redeem            # Redeem points for a reward
```

### Rides
```bash
POST /api/rides             # Request a ride
GET  /api/rides             # List requested rides
```

### Events (Blackboard Integration)
```bash
POST /api/events/blackboard # Webhook: log a learning module completion (earns 25 credits)
```

---

## 🎯 Challenge Context

> *"How might we improve access to and continuity of care for individuals in rural Arizona who are managing chronic health conditions?"*  
> — Southern Arizona Social Innovation Track, HackAZ 2026

Banner – University Family Care serves Medicaid and long-term care populations across Arizona. Saguaro Link was built directly to address the constraints they identified:

- ✅ Works within Medicaid/AHCCCS structures
- ✅ Accessible for patients with varying levels of digital literacy (voice, picture, and text modes)
- ✅ Bilingual (English & Spanish) throughout
- ✅ Transportation support built in (ride requests)
- ✅ Incentive system to encourage consistent daily engagement
- ✅ AI-powered care communication between check-ins

---

## 👥 Team

Built at **HackAZ 2026** — University of Arizona  
Repo: [MasonNjos/HackAZ2026](https://github.com/MasonNjos/HackAZ2026)
