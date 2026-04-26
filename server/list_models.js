require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found.");
    return;
  }
  
  // Since @google/generative-ai does not natively export a listModels method in the client constructor intuitively,
  // we can use the native fetch API to hit the endpoint directly.
  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
    const response = await fetch(url);
    const data = await response.json();
    const models = data.models.map(m => m.name).filter(m => m.includes('gemini'));
    console.log("Available Gemini models:", models);
  } catch (e) {
    console.error(e);
  }
}

listModels();
