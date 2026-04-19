export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { chapter } = req.body;

  const prompt = `Generate one fresh CBSE Class 10 Science board exam style question.
Topic: ${chapter === "all" ? "any science topic" : chapter}
Return ONLY JSON:
{
  "title": "Topic",
  "text": "Full question",
  "type": "mcq",
  "options": ["A", "B", "C", "D"],
  "answer": "correct option",
  "explanation": "short explanation"
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
        temperature: 0.8
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    const question = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      title: "Chemistry",
      text: "What is the pH of neutral solution?",
      type: "mcq",
      options: ["0", "7", "14", "Depends"],
      answer: "7",
      explanation: "Neutral solution has pH = 7"
    };

    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ error: "AI generation failed" });
  }
}
