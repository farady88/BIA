// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const FINNHUB_API_KEY = "d0d0omhr01qm2sk78b30d0d0omhr01qm2sk78b3g";

app.get("/stock/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: {
        symbol,
        token: FINNHUB_API_KEY,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching stock data" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
