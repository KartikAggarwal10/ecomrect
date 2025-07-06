import mongoose from "mongoose";
const numSchema = new mongoose.Schema({
  nme:String,
  psswrd:String,
  emil:String,
  isdm:Boolean
});
export const user = mongoose.model('user', numSchema);