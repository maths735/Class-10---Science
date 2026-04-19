// script.js
let score = 0;
let attempted = 0;
let currentQuestion = null;

async function generateQuestion(selectedChapter) {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapter: selectedChapter })
    });

    if (!res.ok) {
      throw new Error('Backend returned error');
    }

    const q = await res.json();

    if (q.error) {
      throw new Error(q.error);
    }

    currentQuestion = q;
    return q;
  } catch (e) {
    console.error(e);
    alert('Error: ' + e.message + '\n\nMake sure the backend is deployed correctly on Vercel.');
    return null;
  }
}

function displayQuestion(q) {
  document.getElementById("qTitle").textContent = q.title || "Science Question";
  document.getElementById("questionText").textContent = q.text;

  const optionsDiv = document.getElementById("options");
  const inputArea = document.getElementById("inputArea");

  optionsDiv.innerHTML = "";
  inputArea.style.display = "none";
  document.getElementById("result").style.display = "none";
  document.getElementById("nextBtn").style.display = "none";

  if (q.type === "mcq" && Array.isArray(q.options)) {
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

  const isCorrect = String(selected).trim().toLowerCase() === 
                   String(currentQuestion.answer).trim().toLowerCase();

  if (isCorrect) score++;

  showResult(isCorrect);
}

document.getElementById("submitAnswer").onclick = () => {
  const ans = document.getElementById("userAnswer").value.trim();
  if (!ans) return alert("Please enter your answer");
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
document.getElementById("generateBtn").onclick = async () => {
  const selected = document.getElementById("chapter").value;
  const question = await generateQuestion(selected);
  if (question) displayQuestion(question);
};

document.getElementById("nextBtn").onclick = () => {
  document.getElementById("generateBtn").click();
};

// Load first question
window.onload = () => {
  document.getElementById("generateBtn").click();
};
