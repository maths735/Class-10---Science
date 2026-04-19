document.getElementById("generateBtn").onclick = async () => {
  try {
    const res = await fetch('/api/generate', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapter: "all" })
    });

    const q = await res.json();

    if (q.error) {
      document.getElementById("question").innerHTML = "<strong>Error:</strong> " + q.error;
      return;
    }

    document.getElementById("question").innerHTML = `<strong>${q.title}</strong><br>${q.text}`;

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";
    if (q.options) {
      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.style.margin = "5px";
        btn.onclick = () => alert(opt === q.answer ? "Correct!" : "Incorrect. Answer is " + q.answer);
        optionsDiv.appendChild(btn);
      });
    }
  } catch (e) {
    document.getElementById("question").innerHTML = "Backend connection failed. Please redeploy.";
  }
};
