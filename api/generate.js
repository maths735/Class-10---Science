export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'XAI_API_KEY not configured' });
  }

  const { chapter } = req.body;

  const prompt = `You are a CBSE Class 10 Science expert. Generate ONE fresh board-style question.
Category: ${chapter === "all" ? "any science topic" : chapter}
Return ONLY valid JSON, no extra text:

{
  "title": "short topic name",
  "text": "full question text",
  "type": "mcq",
  "options": ["opt1", "opt2", "opt3", "opt4"],
  "answer": "exact correct answer",
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
    const question = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    res.status(200).json(question || { error: "Failed to generate" });
  } catch (error) {
    res.status(500).json({ error: "AI generation failed" });
  }
}
