const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

console.log('✅ AI Routes file loaded');

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in server environment');
  return new GoogleGenAI({ apiKey });
}

router.post('/analyze-manual', async (req, res) => {
  try {
    const checkInData = req.body;
    const { language } = req.body;
    const prompt = `You are a calm, approachable health assistant — knowledgeable but not clinical. Respond in 2-3 sentences, conversational but professional. No filler phrases like "Great job!". Always acknowledge the health-related details.
    
    IMPORTANT: Respond in the language specified: ${language === 'es' ? 'Spanish' : 'English'}.
User's check-in:
- Mood: ${checkInData.mood || 'not mentioned'}
- Activity: ${checkInData.activity_done ? checkInData.activity_details || 'some activity' : 'no activity today'}
- Symptoms: ${checkInData.symptoms || 'none'}
- Blood Pressure: ${checkInData.systolic ? checkInData.systolic + '/' + checkInData.diastolic : 'not logged'}
- Blood Sugar: ${checkInData.blood_sugar || 'not logged'}
- Notes: ${checkInData.notes || 'none'}`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: prompt,
    });

    const rawText = typeof response.text === 'function' ? await response.text() : response.text;
    res.json({ insight: rawText });
  } catch (error) {
    console.error('Manual Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze data' });
  }
});

router.post('/analyze-voice', async (req, res) => {
  try {
    const { transcript, language } = req.body;
    const prompt = `You are a friendly health assistant. The user just finished a voice check-in. Respond naturally in 2-3 sentences to their voice transcript: "${transcript}". Address any health details they mentioned with empathy and a practical observation.
    
    IMPORTANT: Respond in the language specified: ${language === 'es' ? 'Spanish' : 'English'}.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: prompt,
    });

    const rawText = typeof response.text === 'function' ? await response.text() : response.text;
    res.json({ insight: rawText });
  } catch (error) {
    console.error('Voice Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze transcript' });
  }
});

router.post('/parse', async (req, res) => {
  try {
    const { transcript, language } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'No transcript provided' });
    }

    const isSpanish = language === 'es';

    const prompt = `### System:
You are a medical data extraction bot. Extract health metrics into JSON.
The input transcript is in ${isSpanish ? 'Spanish' : 'English'}.

CRITICAL RULES:
- mood: Must be one of [Great, Good, Okay, Not great, Poor]. IMPORTANT: Even if the user speaks in Spanish, you MUST output one of these exact English strings (e.g., "Great" for "Excelente", "Okay" for "Más o menos").
- glucose: Must be a pure number (e.g., 105). If not mentioned, use 0.
- systolic/diastolic: Must be pure numbers. If not mentioned, use 0.
- booleans: true or false.
- Output ONLY raw JSON. No markdown, no backticks, no explanation.

### Examples:
${isSpanish ? `Input: "Me siento regular. Mi azúcar estaba en 115 hoy."
Output: {"mood": "Okay", "hasActivity": false, "activityDetails": "", "hasSymptoms": false, "symptomsText": "", "systolic": 0, "diastolic": 0, "glucose": 115, "notes": ""}

Input: "Mi presión es 130 sobre 85 y mi glucosa es 90. Me siento excelente."
Output: {"mood": "Great", "hasActivity": false, "activityDetails": "", "hasSymptoms": false, "symptomsText": "", "systolic": 130, "diastolic": 85, "glucose": 90, "notes": ""}` : `Input: "I feel okay. My sugar was 115 today."
Output: {"mood": "Okay", "hasActivity": false, "activityDetails": "", "hasSymptoms": false, "symptomsText": "", "systolic": 0, "diastolic": 0, "glucose": 115, "notes": ""}

Input: "My pressure is 130 over 85 and my glucose is 90. I'm feeling great."
Output: {"mood": "Great", "hasActivity": false, "activityDetails": "", "hasSymptoms": false, "symptomsText": "", "systolic": 130, "diastolic": 85, "glucose": 90, "notes": ""}`}

### Structure:
{
  "mood": "string",
  "hasActivity": boolean,
  "activityDetails": "string",
  "hasSymptoms": boolean,
  "symptomsText": "string",
  "systolic": number,
  "diastolic": number,
  "glucose": number,
  "notes": "string"
}

### User Transcript to Parse:
"${transcript}"`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0,
      },
    });

    const rawText = typeof response.text === 'function' ? await response.text() : response.text;
    console.log("🤖 Raw AI Extraction Response:", rawText);

    let parsedData = {};
    if (rawText) {
      try {
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.error('Failed to parse AI JSON output, trying regex:', parseErr);
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        }
      }
    } else {
      throw new Error('AI returned an empty response');
    }

    res.json(parsedData);
  } catch (error) {
    console.error('AI Parse Error:', error);
    res.status(500).json({ error: 'Failed to parse transcript', details: error.message });
  }
});

module.exports = router;