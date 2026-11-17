import { fvr } from "../models/fvr.js";
import { product } from "../models/product.js";
import { HttpError } from "../utils/HttpError.js";
import { wrap } from "../middleware/asyncHandler.js";
import { email_check, oid } from "../utils/validators.js";

export const get_favourite = wrap( async (req, res) => {
const user = email_check(req.user.email);
if (!user) throw new HttpError(400, "Invalid user");

const favorite = await fvr.findOne({ user }).lean();
if (!favorite) return res.json({ user, items: [] });

const productIds = favorite.items.map((item) => oid(item)).filter(Boolean);
const products = await product.find({ _id: { $in: productIds } }).lean();

res.json({ user, items: products });
});

export const add_to_favourite = wrap(async (req, res) => {
const product_id = oid(req.body.product_id);
if (!product_id) throw new HttpError(400, "Invalid product_id");

const doc = await fvr.findOneAndUpdate(
  { user: req.user.email },
  { $addToSet: { items: product_id } },
  { upsert: true, new: true }
);

res.status(201).json(doc);
});

export const remove_from_favourite = wrap(async(req,res)=>{
const id = oid(req.body.id);
const user = email_check(req.user.email);
if (!id || !user) throw new HttpError(400, "Invalid favorite");

const result = await fvr.updateOne(
  { user },
  { $pull: { items: id } }
);

res.json({ success: true, result });
});