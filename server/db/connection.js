const mongoose = require("mongoose");
const { logger } = require("../utils/logger");

const connectDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB connected → ${connection.connection.host}`, {
      type: "db_connected",
    });
  } catch (error) {
    logger.error("MongoDB connection failed", {
      type: "db_connect_error",
      message: error.message,
      stack: error.stack,
    });
  }
};

module.exports = { connectDb };
