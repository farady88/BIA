const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

// Load .env only in development (Render handles env vars automatically)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.FINNHUB_API_KEY;

// Middleware
app.use(cors({
  origin: 'https://fa585.brighton.domains'  // Your frontend domain
}));
app.use(express.static('public')); // if you're hosting the frontend from 'public'

// Routes

// Quote endpoint
app.get('/api/quote', async (req, res) => {
  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Ticker is required' });

  try {
    const response = await axios.get('https://finnhub.io/api/v1/quote', {
      params: {
        symbol: ticker,
        token: API_KEY
      }
    });

    const data = response.data;
    if (!data || data.c === undefined) {
      return res.status(500).json({ error: 'Invalid quote data from API' });
    }

    res.json(data);
  } catch (error) {
    console.error('Quote error:', error.message);
    res.status(500).json({ error: 'Error fetching quote' });
  }
});

// Chart endpoint
app.get('/api/chart', async (req, res) => {
  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Ticker is required' });

  const now = Math.floor(Date.now() / 1000);
  const oneMonthAgo = now - 30 * 24 * 60 * 60;

  try {
    const response = await axios.get('https://finnhub.io/api/v1/stock/candle', {
      params: {
        symbol: ticker,
        resolution: 'D',
        from: oneMonthAgo,
        to: now,
        token: API_KEY
      }
    });

    const data = response.data;
    if (data.s !== 'ok' || !Array.isArray(data.c) || data.c.length === 0) {
      return res.status(500).json({ error: 'Invalid chart data from API' });
    }

    res.json(data);
  } catch (error) {
    console.error('Chart error:', error.message);
    res.status(500).json({ error: 'Error fetching chart data' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
