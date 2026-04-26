const express = require('express');
const router = express.Router();

router.post('/analyze-manual', async (req, res) => {
  try {
    const checkInData = req.body;
    let prompt = `You are a calm, approachable health assistant — knowledgeable but not clinical. Respond in 2-3 sentences, conversational but professional. No filler phrases like "Great job!". Always acknowledge the health-related details.
User's check-in:
- Mood: ${checkInData.mood || 'not mentioned'}
- Activity: ${checkInData.activity_done ? checkInData.activity_details || 'some activity' : 'no activity today'}
- Symptoms: ${checkInData.symptoms || 'none'}
- Blood Pressure: ${checkInData.systolic ? checkInData.systolic + '/' + checkInData.diastolic : 'not logged'}
- Blood Sugar: ${checkInData.blood_sugar || 'not logged'}
- Notes: ${checkInData.notes || 'none'}`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1:8b',
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();
    res.json({ insight: data.response });
  } catch (error) {
    console.error('Manual Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze data' });
  }
});

router.post('/analyze-voice', async (req, res) => {
  try {
    const { transcript } = req.body;
    let prompt = `You are a friendly health assistant. The user just finished a voice check-in. Respond naturally in 2-3 sentences to their voice transcript: "${transcript}". Address any health details they mentioned with empathy and a practical observation.`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1:8b',
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();
    res.json({ insight: data.response });
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
You are a highly accurate medical data extractor. Your task is to extract health vitals from a spoken transcript into JSON.
CRITICAL: 
- Look for "sugar", "glucose", or "mg/dL" for the "glucose" field.
- Look for numbers like "120 over 80" for "systolic" and "diastolic".
- ONLY output the JSON object. No preamble.

### Structure:
{
  "mood": "one of: Great, Good, Okay, Not great, Poor",
  "hasActivity": boolean,
  "activityDetails": "string",
  "hasSymptoms": boolean,
  "symptomsText": "string",
  "systolic": "number only",
  "diastolic": "number only",
  "glucose": "number only",
  "notes": "string"
}

### User Transcript:
"${transcript}"`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1:8b',
        prompt: prompt,
        format: 'json',
        stream: false,
        options: { 
          temperature: 0,
          stop: ["###"] 
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("🤖 Raw AI Extraction Response:", data.response);

    let parsedData = {};
    try {
      // Clean the response in case there's markdown or extra text
      const cleanJson = data.response.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('Failed to parse AI JSON output:', parseErr);
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
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
