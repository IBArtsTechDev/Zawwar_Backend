import jwt from "jsonwebtoken";
import getEnv from "../config/envReader.js";

// const generateToken = (payload) => {
//   return jwt.sign(payload, getEnv.JWT_SECRET, {
//     expiresIn: '200hr',
//   });
// };

const generateAccessToken = (payload) => {
  return jwt.sign(payload, getEnv.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, getEnv.JWT_SECRET, {
    expiresIn: '30d',
  });
};


const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  // Check header exists
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing",
    });
  }

  // Format: Bearer TOKEN
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      success: false,
      message: "Invalid token format",
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, getEnv.JWT_SECRET); 
  
    if(!decoded || !decoded.userId) { 
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid, please login again",
    });
  }
};


const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
}



export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyAdmin
};
