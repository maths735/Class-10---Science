// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chapter } = req.body;
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on Vercel' });
  }

  const prompt = `You are an expert CBSE Class 10 Science teacher.
Generate ONE fresh, original board exam style question.
Category: ${chapter === "all" ? "any Class 10 Science topic" : chapter}

Return ONLY valid JSON in this exact format, no extra text:

{
  "title": "Short topic name",
  "text": "Full question text",
  "type": "mcq",
  "options": ["option 1", "option 2", "option 3", "option 4"],
  "answer": "exact correct answer",
  "explanation": "short clear explanation"
}`;

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 600
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const question = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!question) {
      throw new Error("Failed to parse AI response");
    }

    res.status(200).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI generation failed. Please try again." });
  }
}
