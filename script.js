let score = 0;
let attempted = 0;
let currentQuestion = null;

const questionBank = {
  physics: [
    {title: "Electricity", text: "What is the SI unit of electric current?", type: "mcq", options: ["Volt", "Ampere", "Ohm", "Watt"], answer: "Ampere", explanation: "Electric current is measured in Ampere (A)."},
    {title: "Light", text: "If angle of incidence is 45°, what is angle of reflection?", type: "numerical", answer: "45", explanation: "According to law of reflection, angle of incidence = angle of reflection."}
  ],
  chemistry: [
    {title: "Acids & Bases", text: "What is the pH of a neutral solution?", type: "numerical", answer: "7", explanation: "Neutral solution has pH = 7 at 25°C."},
    {title: "Chemical Reactions", text: "What type of reaction is CaO + H2O → Ca(OH)2?", type: "mcq", options: ["Combination", "Decomposition", "Displacement", "Double displacement"], answer: "Combination", explanation: "Two substances combine to form one product."}
  ],
  biology: [
    {title: "Life Processes", text: "Where does digestion of starch start in humans?", type: "mcq", options: ["Stomach", "Mouth", "Small intestine", "Large intestine"], answer: "Mouth", explanation: "Salivary amylase in saliva starts starch digestion."}
  ]
};

function getRandomQuestion(chapter) {
  let category = chapter === "all" ? 
    ["physics", "chemistry", "biology"][Math.floor(Math.random()*3)] : chapter;

  const questions = questionBank[category] || questionBank.physics;
  return questions[Math.floor(Math.random() * questions.length)];
}

function displayQuestion(q) {
  currentQuestion = q;
  document.getElementById("qTitle").textContent = q.title;
  document.getElementById("questionText").textContent = `(${q.marks || 2} marks) ${q.text}`;

  const optionsDiv = document.getElementById("options");
  const inputArea = document.getElementById("inputArea");

  optionsDiv.innerHTML = "";
  inputArea.style.display = "none";

  if (q.type === "mcq") {
    q.options.forEach(opt => {
      const div = document.createElement("div");
      div.textContent = opt;
      div.onclick = () => checkAnswer(opt);
      optionsDiv.appendChild(div);
    });
  } else {
    inputArea.style.display = "block";
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
    `<strong>Incorrect</strong><br>Correct Answer: ${currentQuestion.answer}<br><br><strong>Explanation:</strong> ${currentQuestion.explanation}`;
}

document.getElementById("generateBtn").onclick = () => {
  const chapter = document.getElementById("chapter").value;
  const q = getRandomQuestion(chapter);
  displayQuestion(q);
};

document.getElementById("submitAnswer").onclick = () => {
  const ans = document.getElementById("userAnswer").value.trim();
  if (ans) checkAnswer(ans);
};

document.getElementById("nextBtn").onclick = () => {
  document.getElementById("generateBtn").click();
};

// Start with first question
window.onload = () => {
  document.getElementById("generateBtn").click();
};
