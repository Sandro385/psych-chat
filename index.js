// index.js  (Psych-Chat backend)

// 1) საერთო პარამეტრები
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { OpenAI } = require('openai');

// 2) OpenAI-ს კლიენტი (ვკითხულობთ .env-დან)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 3) შენი Assistant-ის ID (ყურადღებით!  ► ჩასვი შენივე ID)
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
    /* ► front-იდან მოდის messages (array-ში role / content) */
    const { messages } = req.body;

    /* ➊ ვქმნით სესიას (thread) */
    const thread = await openai.beta.threads.create({
      messages,                        // initial user messages
    });

    /* ➋ ვუშვებთ ჩვენს ასისტენტს gpt-4o მოდელზე */
    const run = await openai.beta.threads.runs.createAndPoll(
      thread.id,
      { assistant_id: ASSISTANT_ID, model: 'gpt-4o' }
    );

    /* ➌ ვიღებთ საბოლოო მესიჯს */
    const threadMessages = await openai.beta.threads.messages.list(thread.id, {
      limit: 1,
      order: 'desc',
    });

    const reply = threadMessages.data[0].content[0].text.value;

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
