import mongoose from "mongoose";
const numSchema = new mongoose.Schema({
   nme:String,
   ctgry:String,
   img:String,
   count:Number,
   price:Number,
   discount:Number
});
const cartSchema = new mongoose.Schema({
   user: String, // or userId if you want
   items: [numSchema] // array of embedded products
});

export const crt = mongoose.model('cart', cartSchema);