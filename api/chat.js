// Serverless proxy: keeps your Anthropic API key on the server.
// Env vars (Vercel > Project > Settings > Environment Variables):
//   ANTHROPIC_API_KEY  (required)
//   APP_PASSCODE       (recommended: stops strangers using your key)
//   ANTHROPIC_MODEL    (optional, defaults to claude-sonnet-5)
module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }
  const pass = process.env.APP_PASSCODE;
  if (pass && req.headers["x-app-passcode"] !== pass) { res.status(401).json({ error: "Passcode required" }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "ANTHROPIC_API_KEY is not set" }); return; }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const prompt = body && typeof body.prompt === "string" ? body.prompt : "";
  if (!prompt || prompt.length > 60000) { res.status(400).json({ error: "Bad prompt" }); return; }
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (r.status === 429) { res.status(429).json({ error: "Rate limited" }); return; }
    if (!r.ok) { const t = await r.text(); res.status(502).json({ error: "Upstream error", detail: t.slice(0, 300) }); return; }
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    res.status(200).json({ text });
  } catch (e) {
    res.status(502).json({ error: "Could not reach Anthropic" });
  }
};
