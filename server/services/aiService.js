const { GoogleGenAI } = require('@google/genai');
const { pool } = require('../db/pool');

// Initialize Google AI Studio client with API Key
const apiKey = process.env.GEMINI_API_KEY;
let ai;

try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("⚠️ GEMINI_API_KEY is not set in server/.env");
  }
} catch (e) {
  console.warn("⚠️ Failed to initialize Google AI Studio", e.message);
}

/**
 * Analyzes a patient's recent check-ins for negative health trends.
 * If flagged, inserts a record into the patient_alerts table.
 *
 * @param {number} userId
 */
async function analyzePatientData(userId) {
  if (!ai) {
    console.log("Gemini AI is not configured. Skipping analysis.");
    return;
  }

  try {
    // 1. Fetch the last 14 days of check-ins
    const checkinsRes = await pool.query(
      `SELECT checkin_date, blood_sugar, insulin_taken, symptoms, mood 
       FROM daily_checkins 
       WHERE user_id = $1 
       ORDER BY checkin_date DESC 
       LIMIT 14`,
      [userId]
    );

    if (checkinsRes.rows.length < 2) {
      // Not enough data to determine a trend
      return;
    }

    // 2. Fetch patient profile details
    const patientRes = await pool.query(
      `SELECT diseases, weight_lbs, date_of_birth FROM patients WHERE user_id = $1`,
      [userId]
    );
    const patientInfo = patientRes.rows[0] || {};

    // 3. Construct the prompt
    const prompt = `
    You are an expert medical AI assistant. Analyze the following patient data to determine if there are negative health trends that require immediate medical attention.

    Patient Profile:
    - Known Diseases: ${patientInfo.diseases ? patientInfo.diseases.join(', ') : 'None listed'}

    Recent Daily Check-ins (ordered from newest to oldest):
${JSON.stringify(checkinsRes.rows, null, 2)}

    Instructions:
    - Look for concerning patterns, especially regarding blood sugar (consistent hyperglycemia > 180, severe hypoglycemia < 70) and worsening symptoms.
    - If the trends are normal or stable, flagged should be false.
    - If the trends indicate a negative health trajectory or immediate risk, flagged should be true.

    Output strictly in this JSON format with no extra text or markdown:
    {
      "flagged": true/false,
      "reason": "Brief explanation of the concerning trend if flagged, otherwise empty string"
    }
    `;

    // 4. Call Google AI Studio
    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    // Parse the JSON response
    const responseText = response.text;
    const analysis = JSON.parse(responseText);

    // 5. Save the alert if flagged
    if (analysis.flagged) {
      console.log(`🚩 AI Flagged Patient ${userId}:`, analysis.reason);
      await pool.query(
        `INSERT INTO patient_alerts (user_id, alert_reason) VALUES ($1, $2)`,
        [userId, analysis.reason]
      );
    } else {
      console.log(`✅ AI Analysis clear for Patient ${userId}`);
    }
  } catch (error) {
    console.error("Error analyzing patient data with Gemini:", error);
  }
}

module.exports = {
  analyzePatientData
};