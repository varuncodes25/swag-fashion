const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { readdirSync } = require("fs");
const { connectDb } = require("./db/connection");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://swag-fashion-bcah.vercel.app",
        "https://swagfashion.in",
        "https://www.swagfashion.in",
      ];
      const isVercelPreview = origin && /^https:\/\/swag-fashion.*\.vercel\.app$/.test(origin);

      if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Connect to MongoDB
connectDb();

// Health check
app.get("/", (req, res) => {
  res.send(`<center><h1>✅ Server Running on PORT: ${port}</h1></center>`);
});

// Load routes dynamically
readdirSync("./routes").forEach((route) => {
  app.use("/api", require(`./routes/${route}`));
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).send({ message: "Route not found" });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on PORT: ${port}`);
});
