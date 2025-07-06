import mongoose from "mongoose";
const numSchema = new mongoose.Schema({
    item:String,
    unt:Number,
    sttus: Boolean,
    ddrss:String
});
const rrSchema = new mongoose.Schema({
    user:String,
    items:[numSchema],
    totprice: Number,
    totcount:Number
})
export const order = mongoose.model('order', rrSchema);