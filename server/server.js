// server.js — BLIK portfolio backend (reference implementation)
// Stack: Node.js + Express. Swap MongoDB/Postgres/Supabase in the routes as needed.

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const contactRoute = require('./routes/contact');
const promptLabRoute = require('./routes/promptLab');
const projectsRoute = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 4000;

// --- Security & parsing middleware ---
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '100kb' }));

// --- Rate limiting (applies to all /api routes) ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'ERROR', message: 'RATE_LIMIT_EXCEEDED :: too many requests, try again later.' }
});
app.use('/api', apiLimiter);

// --- Routes ---
app.use('/api/contact', contactRoute);
app.use('/api/prompt-lab', promptLabRoute);
app.use('/api/projects', projectsRoute);

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'SYSTEM_ONLINE', level: 12, xp: 5850, timestamp: new Date().toISOString() });
});

// --- 404 handler (terminal-styled) ---
app.use((req, res) => {
  res.status(404).json({ status: 'ERROR', message: `404 :: route not found -> ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`BLIK@SYSTEM:~$ server online :: http://localhost:${PORT}`);
});
