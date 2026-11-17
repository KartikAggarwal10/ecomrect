import "dotenv/config";
import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce")
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => {
    console.error("DB Connection Error:", error);
    process.exit(1);
  });