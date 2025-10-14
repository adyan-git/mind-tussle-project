// src/middleware/auth.js
import { verifyAccessToken } from "../utils/token.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
// src/middleware/auth.js

export const verifyToken = (req, res, next) => {
  console.log("verifyToken placeholder called");
  next(); // allow requests to continue
};


export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
