import express from 'express';

const app = express();

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});