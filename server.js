const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

app.use(cors()); // Allow requests from frontend

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running and connected.');
});

// Route: get stock quote (current price, % change, etc.)
app.get('/api/quote', async (req, res) => {
  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Ticker is required' });

  try {
    const response = await axios.get('https://finnhub.io/api/v1/quote', {
      params: { symbol: ticker, token: FINNHUB_API_KEY }
    });

    if (!response.data || typeof response.data.c !== 'number') {
      return res.status(500).json({ error: 'Invalid quote data from API' });
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching quote:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock quote' });
  }
});

// Route: get historical chart data (past 30 days)
app.get('/api/chart', async (req, res) => {
  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Ticker is required' });

  const now = Math.floor(Date.now() / 1000); // UNIX time now
  const oneMonthAgo = now - (60 * 60 * 24 * 30); // 30 days ago

  try {
    const url = `https://finnhub.io/api/v1/stock/candle`;
    const response = await axios.get(url, {
      params: {
        symbol: ticker,
        resolution: 'D',
        from: oneMonthAgo,
        to: now,
        token: FINNHUB_API_KEY
      }
    });

    // Ensure valid response
    if (
      response.data.s !== 'ok' ||
      !Array.isArray(response.data.t) ||
      !Array.isArray(response.data.c) ||
      response.data.t.length === 0
    ) {
      console.error('Invalid chart data from API:', response.data);
      return res.status(500).json({ error: 'Invalid chart data from API' });
    }

    res.json({
      t: response.data.t,
      c: response.data.c
    });
  } catch (error) {
    console.error('Error fetching chart:', error.message);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
