const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// @route   POST /api/chat
// @desc    Send a message to the bot and save to history
// @access  Public
router.post('/', async (req, res) => {
    try {
        // Parse body safely
        const { input, userId } = req.body || {};

        if (!input) {
            return res.status(400).json({ error: "Input is required" });
        }

        // Get API key from environment
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "GROQ_API_KEY environment variable is not set.",
            });
        }

        // Groq API URL
        const url = "https://api.groq.com/openai/v1/chat/completions";

        // Prompt
        const systemPrompt = `You are a supportive, empathetic Wellness AI named "Mindful Space AI". Reply warmly and briefly (1–2 sentences max).`;

        // Call Groq API
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: input }
                ],
                max_tokens: 100
            }),
        });

        const data = await response.json();

        // Handle Groq errors
        if (!response.ok || data.error) {
            console.error("Groq API Error:", data);
            return res.status(500).json({
                error: data?.error?.message || "Groq API failed",
            });
        }

        // Extract reply safely
        const botReply =
            data?.choices?.[0]?.message?.content ||
            "I'm here for you. Can you tell me more?";

        // Save to database if userId is provided
        if (userId) {
            try {
                const newChat = new Chat({
                    userId,
                    userMessage: input,
                    botReply: botReply
                });
                await newChat.save();
            } catch (dbError) {
                console.error("Error saving chat to database:", dbError);
                // We don't fail the request here, just log the error
            }
        }

        return res.status(200).json({ reply: botReply });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
});

// @route   GET /api/chat/:userId
// @desc    Get chat history for a user
// @access  Public
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const chats = await Chat.find({ userId }).sort({ createdAt: 1 });
        
        return res.status(200).json(chats);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
});

module.exports = router;