const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

router.post('/analyze-manual', async (req, res) => {
  try {
    const checkInData = req.body;

    let prompt = `only respnd with what ai model you are specifically which version you are `;

    if (checkInData.transcript) {
      prompt += `The user said: "${checkInData.transcript}". Respond naturally to what they said, making sure to address any health details they mentioned. Keep it brief and grounded. `;
    } else {
      prompt += `The user just submitted their daily check-in:
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
        model: 'llama3.2',
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing in server environment');
    }

    const ai = new GoogleGenAI({ apiKey });

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

module.exports = router;
