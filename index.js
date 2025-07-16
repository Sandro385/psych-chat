// index.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');          // ★ დამატებულია – HTML-ს გასაწოდებლად
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

// ფესვური URL – HTML-ფაილის მიწოდება
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ჩატის ბოლქვი
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',      // სურვილისამებრ შეცვალეთ თქვენთვის საჭირო მოდელით
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
