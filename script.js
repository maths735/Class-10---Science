let score = 0;
let attempted = 0;
let currentQuestion = null;

async function generateQuestion() {
  const chapter = document.getElementById("chapter").value;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapter })
    });

    const q = await res.json();

    if (q.error) {
      alert("Error: " + q.error);
      return;
    }

    currentQuestion = q;
    displayQuestion(q);
  } catch (e) {
    alert("Cannot connect to backend. Please redeploy the project.");
  }
}

function displayQuestion(q) {
  document.getElementById("qTitle").textContent = q.title || "Question";
  document.getElementById("questionText").textContent = q.text;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  document.getElementById("inputArea").style.display = "none";

  if (q.type === "mcq" && q.options) {
    q.options.forEach(opt => {
      const div = document.createElement("div");
      div.textContent = opt;
      div.onclick = () => checkAnswer(opt);
      optionsDiv.appendChild(div);
    });
  } else {
    document.getElementById("inputArea").style.display = "block";
  }
}

function checkAnswer(selected) {
  attempted++;
  document.getElementById("attempted").textContent = attempted;

  const isCorrect = String(selected).trim().toLowerCase() === String(currentQuestion.answer).trim().toLowerCase();

  if (isCorrect) score++;
  document.getElementById("score").textContent = score;

  showResult(isCorrect);
}

function showResult(isCorrect) {
  const resultDiv = document.getElementById("result");
  resultDiv.style.display = "block";
  resultDiv.className = `result ${isCorrect ? 'correct' : 'incorrect'}`;
  resultDiv.innerHTML = isCorrect ? 
    "<strong>Correct!</strong>" : 
    `<strong>Incorrect</strong><br>Correct Answer: ${currentQuestion.answer}<br><br><strong>Explanation:</strong> ${currentQuestion.explanation || ''}`;
}

document.getElementById("generateBtn").onclick = generateQuestion;
document.getElementById("submitAnswer").onclick = () => {
  const ans = document.getElementById("userAnswer").value.trim();
  if (ans) checkAnswer(ans);
};

document.getElementById("nextBtn").onclick = generateQuestion;

window.onload = generateQuestion;
