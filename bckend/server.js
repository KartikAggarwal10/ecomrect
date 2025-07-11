import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { user } from "./user.js";
import { product } from "./product.js";
import { crt } from "./crt.js";
import { fvr } from "./fvr.js";
import { order } from "./order.js";
import { Types } from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
import multer from "multer";
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Connection Error:", err));
app.use('/uploads', express.static('uploads'));

// store files in 'uploads/' folder with original file names
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.get("/api/user", async (req, res) => {
    
 const us = await user.find();
 res.json(us);
});
 app.post("/api/user", async (req, res) => {
const { nme, psswrd, emil, isdm } = req.body;

    if (!nme) return res.status(400).json({ error: "nm is required" });
  
   const newFruit = new user({nme, psswrd, emil, isdm });
      await newFruit.save();
      res.status(201).json(newFruit);
 });
 app.get("/api/crt", async (req, res) => {
 const us = await crt.find();
 res.json(us);
});
app.post("/api/crt", upload.none(),async (req, res) => {
  const { user, nme, ctgry, count, price, discount, img } = req.body;

  const item = { nme, ctgry, count, price, discount, img };

  let u = await crt.findOne({ user });

  if (u) {
    u.items.push(item);
    await u.save();
    return res.status(201).json(u);
  } else {
    const x = new crt({ user, items: [item] });
    await x.save();
    return res.status(201).json(x);
  }
});
app.get("/orders",async(req,res)=>{
  const x = await order.find();
  res.json(x);
})
app.post("/api/rdr", upload.none(),async (req, res) => {
  const { user,item,unt,sttus,price,count,itemid,ddrss} = req.body;
console.log("Item:", item);

console.log("Item ID:", itemid);

  const prod = {item,
    unt:Number(unt),
    sttus,ddrss};

  let u = await order.findOne({ user });

  if (u) {
    u.items.push(prod);
   const totalPrice = Number(price);
const totalCount = Number(count);
console.log("Price:", totalPrice);
console.log("Count:", totalCount);
u.totprice += totalPrice;
u.totcount += totalCount;

    await u.save();
     const result = await crt.updateOne(
      { user },
      { $pull: { items: { _id:new Types.ObjectId(itemid) } } }
    );
    return res.status(201).json(u);
  } else {
    const x = new order({ user, items: [prod],totprice:Number(price),totcount:Number(count) });
    await x.save();
     const result = await crt.updateOne(
      { user },
      { $pull: { items: { _id: new Types.ObjectId(itemid) } } }
    );
    return res.status(201).json(x);
  }
});
app.post("/api/ordersdmin",upload.none(),async(req,res)=>{
  const{user,itemid,sttus} = req.body;
  const x = await order.updateOne(
    {user,"items._id":itemid},
    {$set:{"items.$.sttus":sttus==="true"}}
  )
  res.json({ success: true, x });
})
 app.get("/api/fvr", async (req, res) => {
  const x = await fvr.find();
  res.json(x);
 })
app.post("/api/fvr", upload.none(),async (req, res) => {
  const { user, nme, ctgry,  price, discount, img } = req.body;
  const item = { nme, ctgry,  price, discount, img };
  let u = await fvr.findOne({ user });
  if (u) {
    u.items.push(item);
    await u.save();
    return res.status(201).json(u);
  } else {
    const x = new fvr({ user, items: [item] });
    await x.save();
    return res.status(201).json(x);
  }
});
 app.post("/api/upprod", async (req, res) => {
const {  nm,dis,stk,prec  } = req.body;
    if (!nm) return res.status(400).json({ error: "nm is required" });
    let upd ={};
    if(dis!==0) upd.discount = dis
    if(stk!==0) upd.count = stk
    if(prec!==0) upd.price = prec
 const updated = await product.findOneAndUpdate(
  { nme: nm }, // filter
  { $set: upd }, // update
  {  new: true } // returns the updated document
);

res.status(200).json(updated);
 });
 app.get("/api/product", async (req, res) => {
    
 const us = await product.find();
 res.json(us);
});
app.post("/api/product", upload.single("img"), async (req, res) => {
  const { nme, ctgry, count, price, discount } = req.body;
  const imgPath = req.file ? req.file.path : "";

  if (!nme) return res.status(400).json({ error: "nme is required" });
  const newProduct = new product({
    nme,
    ctgry,
    count,
    price,
    discount,
    img: imgPath, // store image path in MongoDB
  });

  await newProduct.save();
  res.status(201).json(newProduct);
});
app.post("/api/crtrem", upload.none(), async (req, res) => {
  const {user, itemId } = req.body;

   try{
    const result = await crt.updateOne(
      { user },
      { $pull: { items: { _id: itemId } } }
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
})
app.post("/api/fvrrem", upload.none() ,  async(req,res)=>{
  const{user,id} = req.body;
  const result = await fvr.updateOne(
    {user},
    {  $pull :{items:{_id:id}}}
  );
    res.json({success: true,result})
})
app.post("/api/crtupd", upload.none(), async (req, res) => {
  const { user, itemId, newCount } = req.body;

  try {
    const result = await crt.updateOne(
      { user, "items._id": itemId },
      { $set: { "items.$.count": Number(newCount) } }
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/',async(req,res)=>{
    res.send("everthing ok:");
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
