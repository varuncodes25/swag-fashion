export default async function handler(req, res) {
  try {
    // 👇 यहां अपने Render backend का सही URL डाल
    const response = await fetch("https://your-backend.onrender.com/api/health");

    // मान लो backend JSON return करता है
    const data = await response.json();

    console.log("Ping sent at:", new Date().toISOString());

    res.status(200).json({
      ok: true,
      time: new Date().toISOString(),
      backend: data
    });
  } catch (error) {
    console.error("Ping failed:", error);
    res.status(500).json({ error: "Ping failed", details: error.message });
  }
}
