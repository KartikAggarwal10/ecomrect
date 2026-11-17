import mongoose from "mongoose";
const numSchema = new mongoose.Schema({
   nme:String,
   ctgry:[String],
   img:[String],
   count:Number,
   price:Number,
   discount:Number,
   description:String,
   admin_id : String // basically email of product adder
});
export const product = mongoose.model('product', numSchema);