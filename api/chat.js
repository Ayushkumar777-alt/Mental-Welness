export default async function handler(req, res) {
    // Allow only POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Parse body safely
        const { input } = req.body || {};

        if (!input) {
            return res.status(400).json({ error: "Input is required" });
        }

        // Get API key from environment
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "GEMINI_API_KEY environment variable is not set.",
            });
        }

        // Gemini API URL
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        // Prompt
        const prompt = `You are a supportive, empathetic Wellness AI named "Mindful Space AI". Reply warmly and briefly (1–2 sentences max) to this user: "${input}"`;

        // Call Gemini API
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        const data = await response.json();

        // Handle Gemini errors
        if (!response.ok || data.error) {
            console.error("Gemini API Error:", data);
            return res.status(500).json({
                error: data?.error?.message || "Gemini API failed",
            });
        }

        // Extract reply safely
        const botReply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I'm here for you. Can you tell me more?";

        return res.status(200).json({ reply: botReply });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
}