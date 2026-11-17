import mongoose from "mongoose";
const numSchema = new mongoose.Schema({
   nme:String,
   ctgry:String,
   img:String,
   count:Number,
   price:Number,
   discount:Number,
   description:String,
   product_id:String
});
const userSchema = new mongoose.Schema({
   product_id : String,
   count: Number
})
const cartSchema = new mongoose.Schema({
   user: String, // or userId if you want
   items: [userSchema] // array of embedded products
});

export const crt = mongoose.model('cart', cartSchema);