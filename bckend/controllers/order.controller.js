import { HttpError } from "../utils/HttpError.js";
import { cleanAddress } from "../utils/validators.js";
import { oid, num } from "../utils/validators.js";
import { product } from "../models/product.js";
import { order } from "../models/order.js";
import { crt } from "../models/crt.js";
import { wrap } from "../middleware/asyncHandler.js";
import { email_check } from "../utils/validators.js";
export async function buildOrderLines(rawItems, rawAddress) {
  if (!Array.isArray(rawItems) || !rawItems.length || rawItems.length > 50) throw new HttpError(400, "Invalid items");
  const address = cleanAddress(rawAddress);
  if (!address) throw new HttpError(400, "Valid shipping address required");
  const lines = []; let totprice = 0, totcount = 0;
  for (const raw of rawItems) {
    const pid = oid(raw?.product_id);
    const qty = num(raw?.quantity, { min: 1, max: 100, int: true });
    if (!pid || qty === null) throw new HttpError(400, "Invalid product_id or quantity");
    const p = await product.findById(pid).lean();
    if (!p) throw new HttpError(404, "Product not found");
    if (p.count < qty) throw new HttpError(409, `Insufficient stock for ${p.nme}`);
    const linePrice = Math.round(p.price * (1 - (p.discount || 0) / 100) * qty * 100) / 100; // discount = percent
    lines.push({ item: p.nme, unt: qty, sttus: false, ddrss: address, product_id: String(p._id), price: linePrice });
    totprice += linePrice; totcount += qty;
  }
  return { lines, totprice: Math.round(totprice * 100) / 100, totcount };
}

export async function commitOrder(userEmail, { lines, totprice, totcount }) {
  const reserved = [];
  try {
    for (const l of lines) {
      const r = await product.updateOne({ _id: l.product_id, count: { $gte: l.unt } }, { $inc: { count: -l.unt } });
      if (!r.modifiedCount) throw new HttpError(409, `Insufficient stock for ${l.item}`);
      reserved.push(l);
    }
    let doc = await order.findOne({ user: userEmail });
    if (doc) { doc.items.push(...lines); doc.totprice += totprice; doc.totcount += totcount; }
    else doc = new order({ user: userEmail, items: lines, totprice, totcount });
    await doc.save();
    await crt.updateOne({ user: userEmail }, { $pull: { items: { product_id: { $in: lines.map((l) => l.product_id) } } } });
    return doc;
  } catch (err) {
    for (const l of reserved) await product.updateOne({ _id: l.product_id }, { $inc: { count: l.unt } });
    throw err;
  }
}


export const get_orders = wrap(async(req,res) => {
  console.log("came with " + req.user.email);
    const email = email_check(req.user.email);
    const x = await order.findOne({user : email})
    console.log(x)
    return res.json(x)
})

export const add_order = wrap( async (req, res) => {
  const built = await buildOrderLines(
    [{ product_id: req.body.product_id, quantity: req.body.quantity }], req.body.ddrss);
  res.status(201).json(await commitOrder(req.user.email, built));
})

export const order_for_admin = wrap(async (req, res) => {
  const admin_id = email_check(req.user.email);

  const products = await product.find({ admin_id });

  const products_id = products.map(pro => pro._id.toString());

  let orders = await order.find({
    "items.product_id": { $in: products_id }
  }).lean();

  orders = orders.map(user => ({
    ...user,
    items: user.items.filter(item =>
      products_id.includes(item.product_id)
    )
  }));

  console.log("orders:", orders);

  res.status(200).json(orders);
});

export const admin_update_order = wrap(async(req,res)=>{
  //const{itemid,sttus} = req.body;
  const itemid = req.body.itemid;
  const sttus = req.body.sttus;
  const user  = req.body.user;
  console.log("itemid : " + itemid + " " + sttus + " " +user);
  const x = await order.updateOne(
    {user,"items.product_id":itemid},
    {$set:{"items.$.sttus":sttus===true}}
  )
  res.json({ success: true, x });
})


export const order_for_mcp =  wrap(async (req, res) => {
  const built = await buildOrderLines(req.body.items, req.body.shipping_address);
  res.status(201).json({ success: true, order: await commitOrder(req.user.email, built) });
});


export const get_orders_for_mcp = wrap(
    async(req,res) => {
      const {id,user} = req.params;
      const result = await order.findOne({user, "items._id" : id});
      return res.json({success : true , result : result})
    }
  )


  export const get_all_orders = wrap (async (req, res) => {
          const { user_id, limit, offset, status } = req.sanitizedQuery;
  
          const filter = {
              user: user_id
          };
  
          if (status !== undefined) {
              filter["items.sttus"] = status;
          }
  
          const orders = await order
              .find(filter)
              .skip(Number(offset) || 0)
              .limit(Number(limit) || 10);
  
          return res.json({
              success: true,
              result: orders
          })})



export const change_order_by_admin_mcp = wrap(async(req,res) => {
  try {
    const{order_id,user_id} = req.params;
    const{status} = req.body
    await order.updateOne({user : user_id,"items._id" : order_id},{"items.$.sttus" : status});
    return res.json({success : true})
  } 
  catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch products"
        });
  }
})