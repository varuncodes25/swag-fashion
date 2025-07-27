// import express
const express = require("express");

// initialize express
const app = express();
const dotenv = require("dotenv");
dotenv.config();

// port number
const port = process.env.PORT || 5000;
const cors = require("cors");
const { readdirSync } = require("fs");
const { connectDb } = require("./db/connection");

// handling connection erros
const allowedOrigins = [
  "https://swag-fashion-6hu3-git-main-varuns-projects-30000ad4.vercel.app",
  "https://swag-fashion-6hu3-47ggloldf-varuns-projects-30000ad4.vercel.app",
  "https://swag-fashion.vercel.app", // Production
  "swag-fashion-2ett.vercel.app",
  "swag-fashion-2ett-git-main-varuns-projects-30000ad4.vercel.app",
  "swag-fashion-2ett-8w5nzfcp4-varuns-projects-30000ad4.vercel.app"

];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
// app.options("*", cors()); // optional: handle preflight

console.log(process.env.CLIENT_URL)
connectDb();

console.log(process.env.CLOUD_NAME,
  process.env.CLOUD_API_KEY,
  process.env.CLOUD_API_SECRET,
)
// GET,PUT,POST,DELETE
app.get("/", (req, res) => {
  res.send(`<center><h1>Server Running on PORT : ${port} </h1></center>`);
});

// dynamically include routes
readdirSync("./routes").map((route) =>
  app.use("/api", require(`./routes/${route}`))
);

// listen to port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
