const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://satyamb971_db_user:5WZxFQrnTkw9VMBK@cluster0.rsmrqsh.mongodb.net/";

const checkDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
    console.log("Database name:", mongoose.connection.db.databaseName);
    
    // Direct query se check karo
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections in database:", collections.map(c => c.name));
    
    // Agar categories collection hai to count karo
    if (collections.some(c => c.name === 'categories')) {
      const count = await mongoose.connection.db.collection('categories').countDocuments();
      console.log("✅ Categories collection exists with", count, "documents");
      
      if (count > 0) {
        const sample = await mongoose.connection.db.collection('categories').findOne();
        console.log("Sample data:", JSON.stringify(sample, null, 2).substring(0, 500));
      }
    } else {
      console.log("❌ Categories collection does NOT exist");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkDatabase();