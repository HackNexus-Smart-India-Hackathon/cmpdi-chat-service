import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

export const MONGO_URI = process.env.MONGO_URI;
