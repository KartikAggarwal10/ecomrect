import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const optionalAuthenticate = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) return next();

    try {
        req.user = jwt.verify(token, JWT_SECRET);
    } catch {
        // Product browsing remains available when an expired cookie is present.
    }

    next();
};

export const authenticate = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Authentication required"
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            error: "Invalid or expired token"
        });
    }
};

export const adminOnly = (req, res, next) => {

    if (!req.user?.isAdmin) {
        return res.status(403).json({
            success: false,
            error: "Admin access required"
        });
    }

    next();
};