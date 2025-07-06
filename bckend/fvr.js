import mongoose from "mongoose";
const numSchema = new mongoose.Schema({
   nme:String,
   ctgry:String,
   img:String,
   price:Number,
   discount:Number
});
const fvrSchema = new mongoose.Schema({
   user: String,
   items: [numSchema]
});

export const fvr = mongoose.model('fvr', fvrSchema);