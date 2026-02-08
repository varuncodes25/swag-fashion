const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin"); // adjust path if needed

// DB connection
mongoose.connect("mongodb+srv://varuntare2:WqXPAnmVOLHauosC@cluster0.8hdzpwx.mongodb.net/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedAdmin = async () => {
  try {
    // check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "satyam70288" });

    if (existingAdmin) {
      console.log("❌ Admin already exists");
      process.exit();
    }

    // hash password
    const hashedPassword = await bcrypt.hash("satyam123", 10);

    // create admin
    await Admin.create({
      username: "satyam70288",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Seeder error:", error);
    process.exit(1);
  }
};

seedAdmin();
