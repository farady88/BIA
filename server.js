const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

fetch("https://bia-jppx.onrender.com")
  .then(response => response.json())
  .then(data => {
    console.log(data); // use this to update the HTML
  })
  .catch(error => console.error("Error fetching stock data:", error));


const app = express();
const PORT = process.env.PORT || 3000;

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

app.use(cors()); // allow requests from frontend

// Route for stock quote
app.get('/api/quote', async (req, res) => {
  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Ticker required' });

  try {
    const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: { symbol: ticker, token: FINNHUB_API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching quote:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock quote' });
  }
});

// Route for historical chart data (past 30 days, daily resolution)
app.get('/api/chart', async (req, res) => {
  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Ticker required' });

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

    // Return only data if valid
    if (response.data.s === 'ok') {
      res.json(response.data);
    } else {
      res.status(400).json({ error: 'No chart data available for this ticker' });
    }
  } catch (error) {
    console.error('Error fetching chart data:', error.message);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
