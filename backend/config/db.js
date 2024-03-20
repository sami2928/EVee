const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.bold);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`.red.underline.bold);
  }
};

module.exports = connectDB;
