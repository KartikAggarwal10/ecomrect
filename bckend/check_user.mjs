import mongoose from "mongoose";
import bcrypt from "bcryptjs";

await mongoose.connect("mongodb://localhost:27017/ecommerce");
const col = mongoose.connection.collection("users");

// Show current state
const hash = await bcrypt.hash("hello_world", 12);
const result = await col.insertOne({
  nme: "kartik goat",
  user_name: "kartik goat",
  psswrd: hash,
  emil: "kartikaggarwal@agg.com",
  isdm: true,
});
console.log("Inserted correct user:", result.insertedId);
// Verify
const doc = await col.findOne({ emil: "kartik@agg.com" });
const ok = await bcrypt.compare("hello_world", doc.psswrd);
console.log("Login test (should be true):", ok);
console.log("isAdmin:", doc.isdm);
await mongoose.disconnect();
console.log("Done.");