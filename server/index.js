// Import express and other dependencies
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { readdirSync } = require("fs");
const { connectDb } = require("./db/connection");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const port = process.env.PORT || 5000;

// Define allowed origins


app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🔍 Incoming Origin:", origin);

      const allowedOrigins = [
        "http://localhost:5173",
        "https://swag-fashion-bcah.vercel.app",
        "https://swag-fashion-bcah-git-main-varuns-projects-30000ad4.vercel.app",
        "https://swag-fashion-bcah-h7gx3z3wg-varuns-projects-30000ad4.vercel.app"
      ];

      // Optional: allow all *.vercel.app previews
      const isVercelPreview =
        origin && /^https:\/\/swag-fashion.*\.vercel\.app$/.test(origin);

      if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        console.error("❌ BLOCKED BY CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Connect to MongoDB
connectDb();

// Debug logs for cloud credentials


// Health check route
app.get("/", (req, res) => {
  res.send(`<center><h1>✅ Server Running on PORT : ${port}</h1></center>`);
});

// Load all route files from ./routes folder
readdirSync("./routes").forEach((route) => {
  app.use("/api", require(`./routes/${route}`));
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
