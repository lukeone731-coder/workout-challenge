export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { workoutName, existingWorkouts } = req.body;
  if (!workoutName) return res.status(400).json({ error: "Missing workoutName" });

  const list = existingWorkouts.map(w => `${w.name}: 1pt per ${w.threshold} ${w.unit} (${w.type})`).join("\n");
  const prompt = `You are helping design a workout challenge point system. Existing workouts:\n${list}\n\nPoint philosophy:\n- Running 5 min = 1 pt (gold standard cardio)\n- Burpees 10 reps = 1 pt (high intensity)\n- Pushups 25 reps = 1 pt\n- Points are decimals rounded to nearest tenth\n\nNew workout to add: "${workoutName}"\n\nRespond ONLY with a raw JSON object (no markdown, no backticks, no explanation):\n{"type":"reps","threshold":20,"unit":"reps","icon":"🏊","rationale":"One sentence reason"}\nor\n{"type":"time","threshold":10,"unit":"min","icon":"🏊","rationale":"One sentence reason"}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.map(c => c.text || "").join("").replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    res.status(200).json(parsed);
  } catch (e) {
    console.error("AI suggest error:", e);
    res.status(500).json({ error: "Failed to get suggestion" });
  }
}
