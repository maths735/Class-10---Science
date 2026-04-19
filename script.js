let score = 0;
let attempted = 0;

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

    displayQuestion(q);
  } catch (e) {
    alert("Backend not responding. Please wait a moment and try again.");
  }
}

function displayQuestion(q) {
  document.getElementById("qTitle").textContent = q.title || "Question";
  document.getElementById("questionText").textContent = q.text;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  if (q.type === "mcq" && q.options) {
    q.options.forEach(opt => {
      const div = document.createElement("div");
      div.textContent = opt;
      div.onclick = () => checkAnswer(opt, q.answer);
      optionsDiv.appendChild(div);
    });
  } else {
    document.getElementById("inputArea").style.display = "block";
  }
}

function checkAnswer(selected, correct) {
  attempted++;
  document.getElementById("attempted").textContent = attempted;
  const isCorrect = String(selected).trim().toLowerCase() === String(correct).trim().toLowerCase();
  if (isCorrect) score++;
  document.getElementById("score").textContent = score;

  showResult(isCorrect, correct);
}

function showResult(isCorrect, correctAnswer) {
  const resultDiv = document.getElementById("result");
  resultDiv.style.display = "block";
  resultDiv.className = `result ${isCorrect ? 'correct' : 'incorrect'}`;
  resultDiv.innerHTML = isCorrect ? 
    "<strong>Correct!</strong>" : 
    `<strong>Incorrect</strong><br>Correct Answer: ${correctAnswer}`;
}

document.getElementById("generateBtn").onclick = generateQuestion;
document.getElementById("submitAnswer").onclick = () => {
  const ans = document.getElementById("userAnswer").value.trim();
  if (ans) checkAnswer(ans, currentQuestion.answer);
};

document.getElementById("nextBtn").onclick = generateQuestion;

window.onload = generateQuestion;
