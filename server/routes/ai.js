const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in server environment');
  return new GoogleGenAI({ apiKey });
}

router.post('/analyze-manual', async (req, res) => {
  try {
    const checkInData = req.body;
    const prompt = `You are a calm, approachable health assistant — knowledgeable but not clinical. Respond in 2-3 sentences, conversational but professional. No filler phrases like "Great job!". Always acknowledge the health-related details.
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

    res.json({ insight: response.text });
  } catch (error) {
    console.error('Manual Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze data' });
  }
});

router.post('/analyze-voice', async (req, res) => {
  try {
    const { transcript } = req.body;
    const prompt = `You are a friendly health assistant. The user just finished a voice check-in. Respond naturally in 2-3 sentences to their voice transcript: "${transcript}". Address any health details they mentioned with empathy and a practical observation.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: prompt,
    });

    res.json({ insight: response.text });
  } catch (error) {
    console.error('Voice Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze transcript' });
  }
});

router.post('/parse', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'No transcript provided' });
    }

    const prompt = `### System:
You are a medical data extraction bot. Extract health metrics into JSON.
CRITICAL RULES:
- mood: Must be one of [Great, Good, Okay, Not great, Poor]
- glucose: Must be a pure number (e.g., 105). If not mentioned, use 0.
- systolic/diastolic: Must be pure numbers. If not mentioned, use 0.
- booleans: true or false.
- Output ONLY raw JSON. No markdown, no backticks, no explanation.

### Examples:
Input: "I feel okay. My sugar was 115 today."
Output: {"mood": "Okay", "hasActivity": false, "activityDetails": "", "hasSymptoms": false, "symptomsText": "", "systolic": 0, "diastolic": 0, "glucose": 115, "notes": ""}

Input: "My pressure is 130 over 85 and my glucose is 90. I'm feeling great."
Output: {"mood": "Great", "hasActivity": false, "activityDetails": "", "hasSymptoms": false, "symptomsText": "", "systolic": 130, "diastolic": 85, "glucose": 90, "notes": ""}

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

    console.log("🤖 Raw AI Extraction Response:", response.text);

    let parsedData = {};
    try {
      const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('Failed to parse AI JSON output:', parseErr);
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    }

    res.json(parsedData);
  } catch (error) {
    console.error('AI Parse Error:', error);
    res.status(500).json({ error: 'Failed to parse transcript' });
  }
});

module.exports = router;