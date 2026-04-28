const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/apiResponse");

const getJwtSecret = () => process.env.JWT_SECRET || "dev-jwt-secret";
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || "1d";

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
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() },
  );
};

const authenticate = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization || "");
    if (!token) {
      return sendError(res, {
        statusCode: 401,
        errorCode: "E401_UNAUTHORIZED",
        message: "Thiếu Bearer token",
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    return next();
  } catch (_error) {
    return sendError(res, {
      statusCode: 401,
      errorCode: "E401_UNAUTHORIZED",
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

const optionalAuthenticate = async (req, _res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization || "");
    if (!token) return next();

    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    return next();
  } catch (_error) {
    // Ignore invalid token in optional mode and continue as anonymous.
    return next();
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, {
        statusCode: 403,
        errorCode: "E403_FORBIDDEN",
        message: "Bạn không có quyền thực hiện hành động này",
      });
    }
    return next();
  };
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  generateToken,
};
