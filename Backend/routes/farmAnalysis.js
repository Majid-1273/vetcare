// routes/farmAnalysis.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifyToken } = require('../middlewares/auth');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.post('/', verifyToken, async (req, res) => {
  const { text } = req.body;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a farm analyzer assistant. 
You provide helpful information and advice about farming, agriculture, crop management, livestock care,
farm equipment, soil health, and other farming-related topics. 
Respond with practical, accurate information that would be useful to farmers. 
If the user query is general, then provide a general answer. 
If the user query is specific, then provide a specific answer.`,
          },
          {
            role: 'user',
            content: `You are a farm analyzer assistant.
Your job is to help farmers and their workers to get 
information about farming, agriculture, crop management, 
livestock care, farm equipment, soil health, and
other farming-related topics. They will ask you questions and
you have to respond to them in a way that is helpful and informative.
If the user query is general, then provide a general answer. 
If the user query is specific, then provide a specific answer.
Here is the user query: ${text}`,
          },
        ],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const reply = response.data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: 'Invalid response from OpenAI API' });
    }

    res.json({ response: reply });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({
      error: 'Something went wrong with OpenAI API',
      details: error.message,
    });
  }
});

module.exports = router;
