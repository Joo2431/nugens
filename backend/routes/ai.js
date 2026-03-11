const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Product-specific system prompts for Gen-E Mini
const SYSTEM_PROMPTS = {
  'nugens': `You are the NuGens AI assistant. You help users navigate the complete NuGens ecosystem including Gen-E (career planning), HyperX (learning), DigiHub (marketing & jobs), and Units (production studio). Answer any question related to the NuGens platform, career advice, subscriptions, or how to get the most from the ecosystem.`,

  'gen-e': `You are Gen-E Mini, the AI career assistant inside Gen-E. You ONLY answer questions about career planning, resume building, job searching, skill gaps, interview preparation, and career development. Do NOT answer questions about HyperX courses, DigiHub marketing tools, or Units production services. If asked about those platforms, politely redirect the user to the correct product.`,

  'hyperx': `You are HyperX Mini, the AI learning assistant inside HyperX. You ONLY answer questions about courses, learning paths, career skill development, certifications, and educational content on HyperX. You can recommend specific HyperX courses for career goals. Do NOT answer questions about Gen-E resume tools, DigiHub marketing, or Units production. Redirect users to those products if needed.`,

  'digihub': `You are DigiHub Mini, the AI marketing assistant inside DigiHub. You ONLY answer questions about marketing strategies, running ads, social media growth, content planning, the DigiHub job board, talent marketplace, and business community features. Do NOT answer questions about Gen-E career tools, HyperX courses, or Units production. Redirect users accordingly.`,

  'units': `You are Units Mini, the AI production assistant inside Units. You ONLY answer questions about booking photo/video shoots, video editing services, brand content creation, production scheduling, and visual content for businesses. Do NOT answer questions about Gen-E, HyperX courses, or DigiHub marketing tools. Redirect users to those products if they ask.`
};

// POST /api/ai/chat
router.post('/chat', authenticate, async (req, res) => {
  const { product_id = 'nugens', messages, message } = req.body;
  const userId = req.user.userId;

  if (!SYSTEM_PROMPTS[product_id]) {
    return res.status(400).json({ success: false, message: 'Invalid product_id' });
  }

  try {
    // Build message history
    let chatMessages = [];
    if (messages && Array.isArray(messages)) {
      chatMessages = messages.slice(-10); // Keep last 10 for context
    } else if (message) {
      chatMessages = [{ role: 'user', content: message }];
    } else {
      return res.status(400).json({ success: false, message: 'No message provided' });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: SYSTEM_PROMPTS[product_id],
      messages: chatMessages
    });

    const aiContent = response.content[0].text;

    // Save to DB
    const userMsg = chatMessages[chatMessages.length - 1];
    await pool.query(
      `INSERT INTO ai_conversations (user_id, product_id, role, content, tokens_used)
       VALUES ($1,$2,'user',$3,0), ($1,$2,'assistant',$4,$5)`,
      [userId, product_id, userMsg.content, aiContent, response.usage?.output_tokens || 0]
    );

    res.json({
      success: true,
      message: aiContent,
      usage: response.usage
    });

  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ success: false, message: 'AI service unavailable' });
  }
});

// GET /api/ai/history/:productId
router.get('/history/:productId', authenticate, async (req, res) => {
  const { productId } = req.params;
  const { limit = 50 } = req.query;
  try {
    const result = await pool.query(
      `SELECT role, content, created_at FROM ai_conversations
       WHERE user_id = $1 AND product_id = $2
       ORDER BY created_at ASC LIMIT $3`,
      [req.user.userId, productId, parseInt(limit)]
    );
    res.json({ success: true, history: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load history' });
  }
});

module.exports = router;
