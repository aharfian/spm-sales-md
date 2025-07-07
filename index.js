// index.js

import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

const GAS_URL = process.env.GAS_WEBAPP_URL;
const SECRET = process.env.SECRET_TOKEN;

if (!GAS_URL || !SECRET) {
  console.error('❌ GAS_WEBAPP_URL atau SECRET_TOKEN belum diset!');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'SPM Middleware is running.' });
});

// ✅ Proxy GET request ke GAS (dengan encoding parameter yang benar)
app.get('/proxy', async (req, res) => {
  try {
    const queryParams = new URLSearchParams(req.query);
    queryParams.set('token', SECRET);

    const fullUrl = `${GAS_URL}?${queryParams.toString()}`;
    const response = await fetch(fullUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal proxy GET',
      error: error.message,
    });
  }
});

// ✅ Proxy POST request ke GAS
app.post('/proxy', async (req, res) => {
  try {
    const response = await fetch(`${GAS_URL}?token=${SECRET}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal proxy POST',
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Middleware running on port ${PORT}`);
});
