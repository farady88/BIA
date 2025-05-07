// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// Allow requests from your frontend domain
app.use(cors({
  origin: 'https://fa585.brighton.domains'
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// GET /api/quote?ticker=AAPL
app.get('/api/quote', async (req, res) => {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker is required' });
  }

  try {
    const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: {
        symbol: ticker,
        token: FINNHUB_API_KEY
      }
    });

    if (!response.data || response.data.c === 0) {
      return res.status(404).json({ error: 'No data found for ticker' });
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching quote:', error.message);
    res.status(500).json({ error: 'Failed to fetch quote data' });
  }
});

// GET /api/chart?ticker=AAPL
app.get('/api/chart', async (req, res) => {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker is required' });
  }

  const now = Math.floor(Date.now() / 1000);
  const oneMonthAgo = now - (60 * 60 * 24 * 30); // 30 days ago

  try {
    const response = await axios.get(`https://finnhub.io/api/v1/stock/candle`, {
      params: {
        symbol: ticker,
        resolution: 'D',
        from: oneMonthAgo,
        to: now,
        token: FINNHUB_API_KEY
      }
    });

    if (response.data.s !== 'ok') {
      return res.status(404).json({ error: 'No chart data found for ticker' });
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching chart:', error.message);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
