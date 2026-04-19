export default async function handler(req, res) {
  res.status(200).json({
    title: "Test Question",
    text: "What is the chemical formula of water?",
    type: "mcq",
    options: ["H2O", "CO2", "NaCl", "O2"],
    answer: "H2O",
    explanation: "Water is H2O."
  });
}
