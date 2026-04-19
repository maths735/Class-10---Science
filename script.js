let score = 0;
let attempted = 0;
let currentQuestion = null;
let apiKey = localStorage.getItem("scienceApiKey") || "";

const topics = {
  physics: ["Electricity", "Light Reflection and Refraction", "Magnetic Effects of Electric Current"],
  chemistry: ["Chemical Reactions and Equations", "Acids Bases and Salts", "Metals and Non-metals"],
  biology: ["Life Processes", "Control and Coordination", "How do Organisms Reproduce", "Heredity and Evolution"]
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Local fallback questions (many per topic)
const localQuestions = {
  physics: {
    Electricity: [
      {text: "What is the SI unit of electric current?", options: ["Volt", "Ohm", "Ampere", "Watt"], answer: "Ampere", expl: "Electric current is measured in Ampere."},
      {text: "According to Ohm's law, current is directly proportional to", options: ["Resistance", "Voltage", "Power", "Charge"], answer: "Voltage", expl: "I = V / R"},
      {text: "In a series combination, the total resistance is", options: ["Sum of individual resistances", "Reciprocal of sum", "Product", "Average"], answer: "Sum of individual resistances", expl: "R_total = R1 + R2 + R3 ..."}
    ],
    "Light Reflection and Refraction": [
      {text: "Angle of incidence is equal to angle of reflection. This is", options: ["Law of refraction", "Law of reflection", "Snell's law", "None"], answer: "Law of reflection", expl: "This holds for plane mirrors."}
    ]
    // Add more as needed - the structure is ready for expansion
  },
  chemistry: {
    "Acids Bases and Salts": [
      {text: "pH of a neutral solution is", options: ["0", "7", "14", "Depends on temperature"], answer: "7", expl: "At 25 degree Celsius."}
    ]
  },
  biology: {
    "Life Processes": [
      {text: "The process by which green plants prepare their own food is called", options: ["Respiration", "Photosynthesis", "Digestion", "Excretion"], answer: "Photosynthesis", expl: "It occurs in chloroplasts."}
    ]
  }
};

async function generateAIQuestion(category, topic) {
  if (!apiKey) return null;

  const prompt = `You are an expert CBSE Class 10 Science teacher. 
Generate ONE unique, board-exam style question on the topic "${topic}" under ${category.toUpperCase()}.
The question should be suitable for 1 to 5 marks.
Return ONLY a valid JSON object with these exact keys:
{
  "title": "short topic name",
  "text": "full question text including marks if needed",
  "type": "mcq or numerical",
  "options": ["opt1", "opt2", "opt3", "opt4"] if mcq else null,
  "answer": "exact correct answer",
  "explanation": "clear explanation"
}
Make sure the question is different from common textbook ones. Do not add any extra text outside the JSON.`;

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
        temperature: 0.8,
        max_tokens: 600
      })
    });

    if (!response.ok) throw new Error("API error");

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Extract JSON safely
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn("AI generation failed, using local fallback");
  }
  return null;
}

function getLocalQuestion(category, topic) {
  const catQs = localQuestions[category] || localQuestions.physics;
  const topicQs = catQs[topic] || Object.values(catQs)[0] || [];
  
  if (topicQs.length === 0) {
    return {
      title: topic,
      text: "Explain the importance of " + topic + " in daily life.",
      type: "numerical",
      answer: "Open ended - key points expected",
      explanation: "This tests conceptual understanding."
    };
  }
  
  return topicQs[getRandomInt(0, topicQs.length - 1)];
}

async function generateQuestion(selectedChapter) {
  let category = selectedChapter === "all" 
    ? ["physics", "chemistry", "biology"][getRandomInt(0, 2)] 
    : selectedChapter;

  let topicList = topics[category];
  let topic = topicList[getRandomInt(0, topicList.length - 1)];

  // Try real AI first
  let q = await generateAIQuestion(category, topic);

  if (!q) {
    // Fallback to local
    q = getLocalQuestion(category, topic);
  }

  q.marks = [1, 2, 3, 5][getRandomInt(0, 3)];
  q.text = `(${q.marks} marks) ${q.text || q.question || ""}`;
  q.title = q.title || topic;

  currentQuestion = q;
  return q;
}

function displayQuestion(q) {
  document.getElementById("qTitle").textContent = q.title;
  document.getElementById("questionText").textContent = q.text;

  const optionsDiv = document.getElementById("options");
  const inputArea = document.getElementById("inputArea");

  optionsDiv.innerHTML = "";
  inputArea.style.display = "none";
  document.getElementById("result").style.display = "none";
  document.getElementById("nextBtn").style.display = "none";

  if (q.type === "mcq" && q.options && Array.isArray(q.options)) {
    q.options.forEach(opt => {
      const div = document.createElement("div");
      div.className = "option";
      div.textContent = opt;
      div.onclick = () => checkAnswer(opt);
      optionsDiv.appendChild(div);
    });
  } else {
    inputArea.style.display = "block";
    document.getElementById("userAnswer").value = "";
    document.getElementById("userAnswer").focus();
  }
}

function checkAnswer(selected) {
  attempted++;
  document.getElementById("attempted").textContent = attempted;

  const correct = String(currentQuestion.answer || "").trim().toLowerCase();
  const user = String(selected).trim().toLowerCase();
  const isCorrect = correct === user;

  if (isCorrect) score++;

  showResult(isCorrect);
}

document.getElementById("submitAnswer").onclick = () => {
  const ans = document.getElementById("userAnswer").value.trim();
  if (!ans) return alert("Enter your answer");
  checkAnswer(ans);
};

function showResult(isCorrect) {
  const resultDiv = document.getElementById("result");
  resultDiv.style.display = "block";
  resultDiv.className = `result ${isCorrect ? "correct" : "incorrect"}`;
  
  resultDiv.innerHTML = `
    <strong>${isCorrect ? "Correct" : "Incorrect"}</strong><br><br>
    ${!isCorrect ? `<strong>Correct Answer:</strong> ${currentQuestion.answer}<br><br>` : ''}
    <strong>Explanation:</strong><br>
    ${currentQuestion.explanation || "No explanation available."}
  `;

  document.getElementById("score").textContent = score;
  document.getElementById("nextBtn").style.display = "inline-block";
}

// Event listeners
document.getElementById("saveKey").onclick = () => {
  const keyInput = document.getElementById("apiKey").value.trim();
  if (keyInput) {
    apiKey = keyInput;
    localStorage.setItem("scienceApiKey", apiKey);
    alert("API key saved. Refresh the page if needed.");
  }
};

document.getElementById("generateBtn").onclick = async () => {
  const selected = document.getElementById("chapter").value;
  const question = await generateQuestion(selected);
  displayQuestion(question);
};

document.getElementById("nextBtn").onclick = () => {
  document.getElementById("generateBtn").click();
};

// Load saved key and first question
window.onload = () => {
  document.getElementById("apiKey").value = apiKey;
  document.getElementById("generateBtn").click();
};
