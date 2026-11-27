// routes/promptLab.js — POST /api/prompt-lab
// Integrates with an LLM API and returns a timestamped, terminal-formatted response.
// Session history storage shown with a simple in-memory map; swap for MongoDB/Postgres/Redis in production.

const express = require('express');
const router = express.Router();

const sessionHistory = new Map(); // sessionId -> [{prompt, response, ts}]

router.post('/', async (req, res) => {
  try {
    const { prompt, sessionId = 'anonymous' } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ status: 'ERROR', message: 'PROMPT_REQUIRED' });
    }
    if (prompt.length > 2000) {
      return res.status(400).json({ status: 'ERROR', message: 'PROMPT_TOO_LONG' });
    }

    // Example call to Anthropic's Messages API:
    //
    // const response = await fetch('https://api.anthropic.com/v1/messages', {
    //   method: 'POST',
    //   headers: {
    //     'content-type': 'application/json',
    //     'x-api-key': process.env.ANTHROPIC_API_KEY,
    //     'anthropic-version': '2023-06-01'
    //   },
    //   body: JSON.stringify({
    //     model: 'claude-sonnet-4-6',
    //     max_tokens: 400,
    //     messages: [{ role: 'user', content: prompt }]
    //   })
    // });
    // const data = await response.json();
    // const answer = data.content?.[0]?.text || 'NO_RESPONSE';

    const answer = `SYSTEM :: received prompt (${prompt.length} chars). Connect an LLM API key to enable live responses.`;

    const entry = { prompt, response: answer, ts: new Date().toISOString() };
    const history = sessionHistory.get(sessionId) || [];
    history.push(entry);
    sessionHistory.set(sessionId, history.slice(-50)); // cap history length

    return res.status(200).json({ status: 'SUCCESS', ...entry });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'ERROR', message: 'INTERNAL_SYSTEM_FAULT' });
  }
});

router.get('/history/:sessionId', (req, res) => {
  const history = sessionHistory.get(req.params.sessionId) || [];
  res.json({ status: 'SUCCESS', history });
});

module.exports = router;
