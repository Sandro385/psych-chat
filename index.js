// index.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

// POST /chat  – ელოდება { messages: [...] } where messages არის ChatGPT ფორმატის მასივი
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',       // სურვილისამებრ შეცვალეთ თქვენთვის საჭირო მოდელით
      messages,
    });

    res.json(completion.choices[0].message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Psych chat backend ready → http://localhost:${PORT}`)
);
