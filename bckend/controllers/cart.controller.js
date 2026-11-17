import { wrap } from "../middleware/asyncHandler.js";
import { crt } from "../models/crt.js";
import { oid,num } from "../utils/validators.js";
import { product } from "../models/product.js";
import { HttpError } from "../utils/HttpError.js";
import { email_check } from "../utils/validators.js";

export const find_cart_by_id = wrap( async (req, res) => {
  const cart = await crt.findOne({ user: req.user.email }).lean();
if (!cart) return res.json({ user: req.user.email, items: [] });
const ids = cart.items.map((i) => oid(String(i.product_id))).filter(Boolean);
const products = await product.find({ _id: { $in: ids } }).lean();
const byId = new Map(products.map((p) => [String(p._id), p]));
const items = cart.items.map((i) => { const p = byId.get(String(i.product_id)); return p ? { ...p, cartCount: i.count } : null; })
  .filter(Boolean);
res.json({ ...cart, items })
 })

export const add_to_cart = wrap(async (req, res) => {
  const product_id = oid(req.body.product_id);          // fix 1: no braces
  if (!product_id) throw new HttpError(400, "Invalid product_id");

  if (!(await product.exists({ _id: product_id }))) {
    throw new HttpError(404, "Product not found");
  }
  console.log(typeof product_id)
  const user = email_check(req.user.email);
  if (!user) throw new HttpError(401, "Invalid user");

  const cartItem = { product_id, count: 1 };            // fix 2: renamed, no shadowing

  let cart = await crt.findOne({ user });
  if (!cart) {
    cart = new crt({ user, items: [cartItem] });        // fix 3: array
  } else {
    const existing = cart.items.find((i) => String(i.product_id) === product_id);
    if (existing) {
      existing.count = Math.min(existing.count + 1, 99); // increase count, cap at 99
    } else {
      cart.items.push(cartItem);
    }
  }

  await cart.save();
  return res.status(201).json(cart);
});
export const remove_from_cart = wrap(async (req, res) => {

  // 1. Validate request body
  if (!req.body || typeof req.body !== "object") {
    throw new HttpError(400, "Request body is required");
  }

  // 2. Get itemId correctly
  const itemId = oid(req.body.itemId);

  if (!itemId) {
    throw new HttpError(400, "Valid itemId is required");
  }

  // 3. Validate authenticated user
  if (!req.user || typeof req.user.email !== "string") {
    throw new HttpError(401, "Authentication required");
  }

  const user = email_check(req.user.email);

  if (!user) {
    throw new HttpError(401, "Invalid authenticated user");
  }

  // 4. Check whether cart exists
  const cart = await crt.findOne({ user }).lean();

  if (!cart) {
    throw new HttpError(404, "Cart not found");
  }

  // 5. Validate cart items
  if (!Array.isArray(cart.items)) {
    throw new HttpError(500, "Invalid cart data");
  }

  // 6. Check whether product exists in cart
  const itemExists = cart.items.some(
    item => item.product_id === itemId
  );

  if (!itemExists) {
    throw new HttpError(404, "Item is not in the cart");
  }

  // 7. Remove item
  const result = await crt.updateOne(
    { user },
    {
      $pull: {
        items: {
          product_id: itemId
        }
      }
    }
  );

  // 8. Verify update
  if (result.modifiedCount !== 1) {
    throw new HttpError(500, "Failed to remove item from cart");
  }

  res.json({
    success: true,
    message: "Item removed from cart"
  });
});

export const update_cart = wrap(async (req, res) => {
  console.log("hello" + req.body + " " + typeof req.body)
  const itemId = oid(req.body.itemId);
const newCount = num(req.body.newCount, { min: 1, max: 99, int: true });
if (!itemId || newCount === null) throw new HttpError(400, "Invalid input");
  const user = req.user.email;
  try {
    const result = await crt.updateOne(
      { user, "items.product_id": itemId },
      { $set: { "items.$.count": Number(newCount) } }
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
})