const { sendError } = require("../utils/apiResponse");

const notFound = (req, res, _next) => {
  return sendError(res, {
    statusCode: 404,
    error: "Route not found",
  });
};

module.exports = notFound;
