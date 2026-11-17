import mongoose from "mongoose";
const numSchema = new mongoose.Schema({
   nme:String,
   ctgry:String,
   img:String,
   price:Number,
   discount:Number,
   description:String,
   product_id:String
});
const fvrSchema = new mongoose.Schema({
   user: String,
   items: [String]
});

export const fvr = mongoose.model('fvr', fvrSchema);