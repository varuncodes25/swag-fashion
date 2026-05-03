const mongoose = require("mongoose");
const Category = require("../models/Category"); // Path sahi karna

const MONGO_URI = "mongodb+srv://satyamb971_db_user:5WZxFQrnTkw9VMBK@cluster0.rsmrqsh.mongodb.net/";

const testAPI = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database:", mongoose.connection.db.databaseName);
    
    // Direct find
    const categories = await Category.find();
    console.log("Categories found:", categories.length);
    console.log("Data:", JSON.stringify(categories, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

testAPI();