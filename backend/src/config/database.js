const mongoose = require("mongoose");

const connectDatabase = async () => {
  const mongoUrl = process.env.MONGODB_URL;

  if (!mongoUrl) {
    throw new Error("MONGODB_URL is not defined");
  }

  const conn = await mongoose.connect(mongoUrl);
  console.log(`MongoDB Connected: ${conn.connection.host}`);

  return conn;
};

module.exports = {
  connectDatabase,
};
