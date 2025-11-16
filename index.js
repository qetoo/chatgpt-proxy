const express = require('express');
const fetch = require('node-fetch'); // npm install node-fetch
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Use PORT from Render environment or fallback to 10000
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
  res.send("ChatGPT Proxy is running!");
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { model, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request: messages must be an array" });
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model || "gpt-4",
        messages
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ error: err.message });
  }
});

// Health check (optional)
app.get('/healthz', (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log("Available at your primary URL: ", process.env.RENDER_EXTERNAL_URL);
});
