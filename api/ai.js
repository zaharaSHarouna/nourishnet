// Serverless function (Vercel). Keeps the Anthropic API key on the
// server — the browser only ever talks to this endpoint, never to
// api.anthropic.com directly.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Demo mode: no key configured. Respond clearly instead of failing
    // silently, so the app's "AI unavailable" fallback UI kicks in.
    res.status(200).json({ text: null, demo: true });
    return;
  }

  const { system, message } = req.body || {};
  if (!message) {
    res.status(400).json({ error: "Missing message" });
    return;
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!upstream.ok) {
      res.status(200).json({ text: null });
      return;
    }

    const data = await upstream.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    res.status(200).json({ text: text || null });
  } catch (err) {
    console.error("AI proxy error", err);
    res.status(200).json({ text: null });
  }
}
