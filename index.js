// index.js  – Psych-Chat backend  (სრული ფაილი, გადააკოპირე მოულოდნელი შეცვლის გარეშე)

require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ← ჩასვი შენი ასისტენტის ID
const ASSISTANT_ID = "asst_nZlOLl89ez21FOcMNCejGj47";

const app = express();
app.use(cors());
app.use(express.json());

// მთავარი HTML
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ჩატი
app.post("/chat", async (req, res) => {
  try {
    /** front-დან მოდის [{role , content}, …] */
    let { messages = [] } = req.body;

    // თუ პირველი ელემენტი system-ია – წავიღოთ run.instructions-ში
    let runInstructions = "";
    if (messages[0] && messages[0].role === "system") {
      runInstructions = messages[0].content;
      messages = messages.slice(1);           // array-დან ამოვიღეთ
    }

    /* ➊ ვქმნით thread-ს მხოლოდ user/assistant შეტყობინებებით */
    const thread = await openai.beta.threads.create({ messages });

    /* ➋ ვუშვებთ ასისტენტს */
    await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: ASSISTANT_ID,
      model: "gpt-4o",
      instructions: runInstructions,          // system prompt-ი აქ
      response_format: { type: "text" }       // ციტაციების ამოღება
    });

    /* ➌ ვიღებთ ბოლო პასუხს */
    const { data } = await openai.beta.threads.messages.list(thread.id, {
      limit : 1,
      order : "desc",
    });

    const reply = data[0]?.content[0]?.text?.value || "…";

    res.json({ role: "assistant", content: reply });
  } catch (err) {
    console.error("OpenAI error →", err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Psych-Chat backend ready → http://localhost:${PORT}`)
);
