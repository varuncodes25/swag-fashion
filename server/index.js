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
const allowedOrigins = [
  "https://swag-fashion.vercel.app", // Production
  "https://swag-fashion-6hu3-git-main-varuns-projects-30000ad4.vercel.app",
  "https://swag-fashion-6hu3-47ggloldf-varuns-projects-30000ad4.vercel.app",
  "https://swag-fashion-2ett.vercel.app",
  "https://swag-fashion-2ett-git-main-varuns-projects-30000ad4.vercel.app",
  "https://swag-fashion-2ett-8w5nzfcp4-varuns-projects-30000ad4.vercel.app"
];

// Configure CORS
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🌐 Request Origin:", origin);
      const isVercelPreview = /^https:\/\/swag-fashion.*\.vercel\.app$/.test(origin);
      if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        console.error("❌ CORS Blocked:", origin);
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
console.log("🌩️ Cloudinary Config:");
console.log("CLOUD_NAME:", process.env.CLOUD_NAME);
console.log("CLOUD_API_KEY:", process.env.CLOUD_API_KEY);
console.log("CLOUD_API_SECRET:", process.env.CLOUD_API_SECRET);

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
