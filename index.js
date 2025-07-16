// index.js  (Psych-Chat backend)

// 1) საერთო პარამეტრები
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { OpenAI } = require('openai');

// 2) OpenAI-ს კლიენტი (.env → OPENAI_API_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 3) შენი Assistant-ის ID (შეადგენს შენივე ID-ს)
const ASSISTANT_ID = 'asst_nZlOLl89ez21FOcMNCejGj47';

// 4) Express-ის აპი
const app = express();
app.use(cors());
app.use(express.json());

// მთავარი გვერდი (ფრონტის HTML)
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ჩატის ენდპოინტი
app.post('/chat', async (req, res) => {
  try {
    /* front-იდან მოდის messages (role / content).  
       Threads API-ს “system” აღარ სჭირდება, მხოლოდ user/assistant. */
    const messages = (req.body.messages || [])
      .filter(m => m.role === 'user')              // ვიტოვებთ მხოლოდ user-ებს
      .map   (m => ({ role: 'user', content: m.content }));

    /* ➊ ვქმნით სესიას (thread) */
    const thread = await openai.beta.threads.create({ messages });

    /* ➋ ვუშვებთ ასისტენტს gpt-4o მოდელზე */
    await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: ASSISTANT_ID,
      model: 'gpt-4o'
    });

    /* ➌ ვიღებთ ბოლოს გამოქვეყნებულ შეხვედრას */
    const { data } = await openai.beta.threads.messages.list(thread.id, {
      limit: 1,
      order: 'desc'
    });
    const reply = data[0].content[0].text.value;

    res.json({ role: 'assistant', content: reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

// 5) ვუსმენ პორტზე
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Psych-Chat backend ready → http://localhost:${PORT}`)
);
