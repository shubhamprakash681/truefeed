import mongoose from "mongoose";

interface ConnectionObject {
  isConnected?: number;
}

const connection: ConnectionObject = {};

const connectDB = async (): Promise<void> => {
  if (connection.isConnected) {
    console.log("Database already connected");
    return;
  }

  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI || "");

    connection.isConnected = dbConnection.connections[0].readyState;

    console.log("Database connection successful");
  } catch (error) {
    console.log("Database connection failed", error);

    process.exit();
  }
};

export default connectDB;
