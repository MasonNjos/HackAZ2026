const express = require('express');
const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const checkInData = req.body;
    
    const prompt = `You are a friendly and encouraging health assistant. The user just submitted their daily health check-in.
Here is the data:
- Mood: ${checkInData.mood || 'Not provided'}
- Activity Details: ${checkInData.activity_done ? checkInData.activity_details || 'Some activity' : 'No activity recorded'}
- Symptoms: ${checkInData.symptoms || 'None reported'}
- Blood Pressure: ${checkInData.systolic ? checkInData.systolic + '/' + checkInData.diastolic : 'Not provided'}
- Blood Sugar: ${checkInData.blood_sugar || 'Not provided'}
- Notes: ${checkInData.notes || 'None'}

Please provide a brief, 2-3 sentence insight or encouraging feedback based on this check-in data. Keep it conversational, empathetic, and direct.`;

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
