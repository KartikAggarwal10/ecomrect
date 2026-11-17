import { email_check,cleanText } from "../utils/validators.js";
import { HttpError } from "../utils/HttpError.js";
import { user } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { wrap } from "../middleware/asyncHandler.js";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be set (32+ chars)");
  process.exit(1);
}

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};

const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 12);
export const getUser = wrap(async (req, res) => {
    console.log("came to login");
          const emil = email_check(req.body.emil);
          const psswrd = typeof req.body.psswrd === "string" && req.body.psswrd.length <= 72 ? req.body.psswrd : null;
          if (!emil || !psswrd) throw new HttpError(400, "Email and password are required");
          const existingUser = await user.findOne({ emil });
          const ok = await bcrypt.compare(psswrd, existingUser ? existingUser.psswrd : DUMMY_HASH);
          if (!existingUser || !ok) throw new HttpError(401, "Invalid email or password");
          const token = jwt.sign(
            {
                userId: existingUser._id.toString(),
                email: existingUser.emil,
                isAdmin: existingUser.isdm
            },
            JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.cookie("token", token, { ...cookieOptions, maxAge: 60 * 60 * 1000 });

        res.json({
            success: true,
            user: {
                id: existingUser._id,
                name: existingUser.nme,
                email: existingUser.emil,
                isAdmin: existingUser.isdm
            }
        })});



export const SignUpUser = wrap(async (req, res) => {
    const nme = cleanText(req.body.nme, 60);
      const emil = email_check(req.body.emil);
      const psswrd = req.body.psswrd;
      if (!nme || !emil || typeof psswrd !== "string") throw new HttpError(400, "Valid name, email and password required");
      if (psswrd.length < 8 || psswrd.length > 72) throw new HttpError(400, "Password must be 8-72 characters");
            const existingUser = await user.findOne({ emil });
    
            if (existingUser) {
                return res.status(409).json({
                    error: "User with same email already exists"
                });
            }
    
            const hashedPassword = await bcrypt.hash(psswrd, 12);
    
             const newUser = new user({ nme, user_name: nme, psswrd: hashedPassword, emil, isdm: false }); // was Boolean(isdm)
             await newUser.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });
    
})

export const logout =  wrap( async(req, res) => {

    res.clearCookie("token", cookieOptions);

    res.json({
        success: true,
        message: "Logged out successfully"
    });
})


export const if_me = wrap(async (req, res) => {

    const existingUser = await user.findById(
        req.user.userId
    ).select("-psswrd");

    if (!existingUser) {
        return res.status(404).json({
            error: "User not found"
        });
    }

    res.json({
        success: true,
        user: existingUser
    });
})