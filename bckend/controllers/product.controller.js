import { wrap } from "../middleware/asyncHandler.js";
import { fvr } from "../models/fvr.js";
import { crt } from "../models/crt.js";
import { order } from "../models/order.js";
import { product } from "../models/product.js";
import { HttpError } from "../utils/HttpError.js";
import { oid,num,str, email_check } from "../utils/validators.js";
import { cleanText } from "../utils/validators.js";
export const update_product =  wrap(async (req, res) => {
// const {  _id,dis,stk,prec ,desc } = req.body;
console.log("came")
const _id = oid(req.body._id);
const discount = num(req.body.dis);
const stock = num(req.body.stk);
const price = num(req.body.prec);
const description = str(req.body.desc);
const prod = await product.findOne({_id : _id});
const nm = req.user.email;
if(!prod) throw new HttpError(404, "Product not found");
if(nm !== prod.admin_id) throw new HttpError(404, "admin not the owner of this product");
    if (!nm) return res.status(400).json({ error: "nm is required" });
    let upd ={};
    if(discount!==0) upd.discount = discount
    if(stock!==0) upd.count = stock
    if(price!==0) upd.price = price
    if(description !== undefined) upd.description = description
 const updated = await product.findOneAndUpdate(
  { _id}, // filter
  { $set: upd } // returns the updated document
);

res.status(200).json({success : true});
});



export const see_products = wrap(async (req, res) => {
  const requestedLimit = Number.parseInt(req.sanitizedQuery?.limit ?? req.query.limit, 10);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 10)
    : 10;
  const requestedPage = Number.parseInt(req.sanitizedQuery?.page ?? req.query.page, 10);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const search = typeof req.sanitizedQuery.search === "string" ? req.sanitizedQuery.search.trim() : "";
  const category = typeof req.sanitizedQuery.category === "string" ? req.sanitizedQuery.category.trim() : "";
  const sort = req.sanitizedQuery.sort === "priceAsc" || req.sanitizedQuery.sort === "priceDesc"
    ? req.sanitizedQuery.sort
    : "interest";

  let interestCategories = [];
  if (req.user?.email) {
    const [favorites, cart, orders] = await Promise.all([
      fvr.findOne({ user: req.user.email }).select("items").lean(),
      crt.findOne({ user: req.user.email }).select("items.product_id").lean(),
      order.findOne({ user: req.user.email }).select("items.product_id").lean(),
    ]);

    const productIds = [
      ...(favorites?.items || []),
      ...(cart?.items || []).map((item) => item.product_id),
      ...(orders?.items || []).map((item) => item.product_id),
    ].filter(Boolean);

    const interactedProducts = await product
      .find({ _id: { $in: productIds } })
      .select("ctgry")
      .lean();

    interestCategories = [
      ...new Set(
        interactedProducts.flatMap((item) =>
          Array.isArray(item.ctgry) ? item.ctgry : [item.ctgry]
        ).filter(Boolean)
      ),
    ];
  }

  const match = {};
  if (search) match.nme = { $regex: search, $options: "i" };
  if (category) match.ctgry = category;

  const categoryValues = {
    $cond: [{ $isArray: "$ctgry" }, "$ctgry", ["$ctgry"]],
  };
  const pipeline = [
    { $match: match },
    { $set: { categoryValues } },
    {
      $set: {
        interestScore: {
          $size: { $setIntersection: ["$categoryValues", interestCategories] },
        },
      },
    },
  ];

  if (sort === "priceAsc") pipeline.push({ $sort: { price: 1, _id: 1 } });
  else if (sort === "priceDesc") pipeline.push({ $sort: { price: -1, _id: 1 } });
  else pipeline.push({ $sort: { interestScore: -1, _id: 1 } });

  pipeline.push(
    { $skip: (page - 1) * limit },
    { $limit: limit + 1 },
    { $unset: ["categoryValues", "interestScore"] }
  );

  const results = await product.aggregate(pipeline);
  const hasMore = results.length > limit;
  const products = hasMore ? results.slice(0, limit) : results;

  res.json({ products, page, limit, hasMore, interests: interestCategories });
});


export const upload_product = wrap(async (req, res) => {
  const nme = cleanText(req.body.nme, 120);
const ctgry = cleanText(req.body.ctgry, 50);
const count = num(req.body.count, { min: 0, max: 1e6, int: true });
const price = num(req.body.price, { min: 0, max: 1e7 });
const discount = num(req.body.discount ?? 0, { min: 0, max: 100 });
const description = req.body.description === undefined ? "" : cleanText(req.body.description, 2000);
if (!nme || count === null || price === null || discount === null || description === null) {
  (req.files || []).forEach((f) => fs.unlink(f.path, () => {}));
  throw new HttpError(400, "Invalid input");
}
const images = (req.files || []).map((f) => `/uploads/${f.filename}`);
const newProduct = await new product({
  nme, ctgry, count, price, discount, img: images[0], description, admin_id: req.user.userId,
}).save(); // if schema `img` is an array, use `images`
res.status(201).json(newProduct);
})
async function uploadToCloudinary(file) {
  const fd = new FormData();
  // Turn buffer into a Blob that FormData can send
  const blob = new Blob([file.buffer], { type: file.mimetype });
  fd.append("file", blob, file.originalname);
  
  // NOTE: Replace 'your_unsigned_preset' with your Cloudinary upload preset name
  fd.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default");
  const res = await fetch(
    "https://api.cloudinary.com/v1_1/da2gzc7uc/image/upload",
    {
      method: "POST",
      body: fd,
    }
  );
  const data = await res.json();
  if (!res.ok) {
    console.log(res.status + " " + data.error?.message)
    throw new HttpError(res.status, data.error?.message || "Cloudinary upload failed");
  }
  // Cloudinary returns the HTTPS URL in `secure_url`
  return data.secure_url;
}


export const add_product = wrap(async (req, res) => {
  const nme = cleanText(req.body.nme, 120);
  let rawCategories = req.body.ctgry;
  if (typeof rawCategories === "string") {
    try {
      rawCategories = JSON.parse(rawCategories);
    } catch {
      rawCategories = rawCategories.split(",");
    }
  }
  const ctgry = Array.isArray(rawCategories)
    ? [...new Set(rawCategories.map((category) => cleanText(category, 50)).filter(Boolean))]
    : [];
  const count = num(req.body.count, { min: 0, max: 1e6, int: true });
  const price = num(req.body.price, { min: 0, max: 1e7 });
  const discount = num(req.body.discount ?? 0, { min: 0, max: 100 });
  const description = req.body.description === undefined ? "" : cleanText(req.body.description, 2000);
  if (!nme || !ctgry.length || count === null || price === null || discount === null || description === null) {
    throw new HttpError(400, "Invalid input");
  }
  if (!req.files?.length || req.files.length > 5) {
    throw new HttpError(400, "Upload between 1 and 5 images");
  }
  const imageUrls = await Promise.all(req.files.map((file) => uploadToCloudinary(file)));
  const newProduct = await new product({
    nme,
    ctgry,
    count,
    price,
    discount,
    img: imageUrls, // Store the Cloudinary URLs directly!
    description,
    admin_id: req.user.email || req.user.userId,
  }).save();
  res.status(201).json(newProduct);
});


export const see_particular_product =  wrap(async (req, res) => {
    const id = oid(req.params);
    if(!id) throw new HttpError(401,"no product id given")

    const rest = await product.findOne({_id : id})
    if(!rest) throw new HttpError(401,"no product found.")
    return res.json({success : true ,  result : rest})
})



export const add_product_mcp = wrap(async(req,res) => {
        const {name,description,price,category,stock,images} = req.body;
        const pro = new product({nme : name,ctgry :category ,img : images[0] ,count : stock,price,discount : 0,description})
        await pro.save()
        return res.json({success : true})
})


export const see_products_mcp = wrap(async (req, res) => {
        const {limit = 20,category,search,min_price,max_price,in_stock_only = "true"} = req.sanitizedQuery;
        const filter = {};

        // Category
        if (category) {
            filter.ctgry = category;
        }

        // Search product name
        if (search) {
            filter.nme = {
                $regex: search,
                $options: "i"
            };
        }

        // Price range
        if (min_price !== undefined || max_price !== undefined) {
            filter.price = {};

            if (min_price !== undefined) {
                filter.price.$gte = Number(min_price);
            }

            if (max_price !== undefined) {
                filter.price.$lte = Number(max_price);
            }
        }

        // Only products that are in stock
        if (in_stock_only === "true") {
            filter.count = {
                $gt: 0
            };
        }

        const products = await product
            .find(filter)
            .limit(Number(limit));

        res.status(200).json(products);

})


export const see_products_to_admin_by_by_him = wrap(
  async(req,res) => {
    const user = email_check(req.user.email)
    console.log("user" + user)
    const products= await product.find({admin_id : user})
    console.log("products : " + products)
    res.status(200).json({produts : products})
  }
)