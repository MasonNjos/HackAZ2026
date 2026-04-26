const express = require('express');
const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const checkInData = req.body;

    let prompt = `You are a calm, approachable health assistant — knowledgeable but not clinical. Respond in 2-3 sentences, conversational but professional. No bullet points, no lists, no filler phrases like "Great job!" or "That's wonderful!". Always acknowledge the health-related details in the check-in. `;

    if (checkInData.transcript) {
      prompt += `The user said: "${checkInData.transcript}". Respond naturally to what they said, making sure to address any health details they mentioned. Keep it brief and grounded. `;
    } else {
      prompt += `The user just submitted their daily check-in:
- Mood: ${checkInData.mood || 'not mentioned'}
- Activity: ${checkInData.activity_done ? checkInData.activity_details || 'some activity' : 'no activity today'}
- Symptoms: ${checkInData.symptoms || 'none'}
- Blood Pressure: ${checkInData.systolic ? checkInData.systolic + '/' + checkInData.diastolic : 'not logged'}
- Blood Sugar: ${checkInData.blood_sugar || 'not logged'}
- Notes: ${checkInData.notes || 'none'}
Write a brief, natural response that directly addresses their vitals and symptoms. Don't repeat the data back to them — just react to it meaningfully and offer one practical observation or gentle suggestion if relevant.`;
    }

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json({ insight: data.response });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze check-in data' });
  }
});

module.exports = router;
