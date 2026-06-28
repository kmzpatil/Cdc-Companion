const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const geminiKeys = (process.env.GEMINI_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
const groqKeys = (process.env.GROQ_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);

async function testGeminiKey(key, index) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
    });
    const status = res.status;
    if (status === 200) {
      console.log(`✅ [Gemini] Key ${index} (..${key.slice(-4)}) is WORKING.`);
    } else {
      console.log(`❌ [Gemini] Key ${index} (..${key.slice(-4)}) FAILED with status ${status}.`);
    }
  } catch (err) {
    console.log(`❌ [Gemini] Key ${index} (..${key.slice(-4)}) FAILED with error ${err.message}.`);
  }
}

async function testGroqKey(key, index) {
  try {
    const res = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: "Hi" }] })
    });
    const status = res.status;
    if (status === 200) {
      console.log(`✅ [Groq] Key ${index} (..${key.slice(-4)}) is WORKING.`);
    } else {
      console.log(`❌ [Groq] Key ${index} (..${key.slice(-4)}) FAILED with status ${status}.`);
    }
  } catch (err) {
    console.log(`❌ [Groq] Key ${index} (..${key.slice(-4)}) FAILED with error ${err.message}.`);
  }
}

async function main() {
  console.log('Testing Gemini Keys...');
  for (let i = 0; i < geminiKeys.length; i++) {
    await testGeminiKey(geminiKeys[i], i);
  }
  
  console.log('\nTesting Groq Keys...');
  for (let i = 0; i < groqKeys.length; i++) {
    await testGroqKey(groqKeys[i], i);
  }
}

main();
