const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/apiResponse");

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

const extractBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) return null;
  return authorizationHeader.slice(7).trim();
};

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: String(user._id),
      walletAddress: user.walletAddress,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
};

const authenticate = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization || "");
    if (!token) {
      return sendError(res, {
        statusCode: 401,
        errorCode: "E401_UNAUTHORIZED",
        message: "Missing Bearer token",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (_error) {
    return sendError(res, {
      statusCode: 401,
      errorCode: "E401_UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, {
        statusCode: 403,
        errorCode: "E403_FORBIDDEN",
        message: "You do not have permission to perform this action",
      });
    }
    return next();
  };
};

module.exports = {
  authenticate,
  authorize,
  generateToken,
};
