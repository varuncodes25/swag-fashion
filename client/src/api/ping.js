export default async function handler(req, res) {
  try {
    await fetch("https://your-backend.onrender.com/api/health");
    console.log("Ping successful at:", new Date().toISOString());
    res.status(200).json({ ok: true, time: new Date().toISOString() });
  } catch (error) {
    console.error("Ping failed at:", new Date().toISOString(), error);
    res.status(500).json({ error: "Ping failed" });
  }
}
