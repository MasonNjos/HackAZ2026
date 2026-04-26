const { GoogleGenerativeAI } = require('@google/generative-ai');
const { pool } = require('../db/pool');

// Initialize Google AI Studio client with API Key
const apiKey = process.env.GEMINI_API_KEY;
let genAI;
let model;

try {
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
        }
    });
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
  if (!model) {
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

    // 3. Construct the Prompt
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
    
    Output strictly in this JSON format:
    {
      "flagged": true/false,
      "reason": "Brief explanation of the concerning trend if flagged, otherwise empty string"
    }
    `;

    // 4. Call Google AI Studio
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    const analysis = JSON.parse(responseText);

    // 5. Save the Alert if flagged
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
