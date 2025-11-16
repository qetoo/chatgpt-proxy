import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
  res.send("ChatGPT Proxy is running!");
});

// Health check
app.get('/healthz', (req, res) => {
  res.send("OK");
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request: messages must be an array" });
    }

    console.log("[DEBUG] Received request:", messages);

    // Call OpenAI API using gpt-3.5-turbo (free tier)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[DEBUG] OpenAI API error:", text);
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    console.log("[DEBUG] OpenAI API response:", data);

    res.json(data);

  } catch (err) {
    console.error("[DEBUG] Error in /chat:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log("Available at your primary URL:", process.env.RENDER_EXTERNAL_URL);
});
