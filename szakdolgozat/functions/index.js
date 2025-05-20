require('dotenv').config();

const functions = require('firebase-functions');
const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post('/chat', async (req, res) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: req.body.model,
        messages: req.body.messages
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Hiba a proxyban:', error);
    res.status(500).json({ error: 'Proxy hiba', details: error.toString()});
  }
});

exports.api = functions.https.onRequest(app);