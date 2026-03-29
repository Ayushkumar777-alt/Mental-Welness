export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { input } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not set." });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const prompt = `You are a supportive, highly empathetic Wellness AI named 'Mindful Space AI' on a mental wellness web app. Reply conversationally, warmly, and concisely (1 to 2 sentences max) to this human: "${input}"`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('Gemini API Error:', data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const botReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: botReply });

    } catch (error) {
        console.error('Backend Network Error:', error);
        return res.status(500).json({ error: "Network error. Could not connect to the Google Gemini servers." });
    }
}
