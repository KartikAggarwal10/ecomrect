import mongoose from "mongoose";
const numSchema = new mongoose.Schema({
   nme:String,
   ctgry:String,
   img:String,
   count:Number,
   price:Number,
   discount:Number
});
export const product = mongoose.model('product', numSchema);