const { sendError } = require("../utils/apiResponse");

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const safeMessage =
    typeof err.message === "string" && err.message.trim()
      ? err.message
      : "Request failed";
  const errorMessage =
    statusCode === 500 ? "Internal Server Error" : safeMessage;

  console.error(err.stack || err);
  return sendError(res, {
    statusCode,
    error: errorMessage,
  });
};

module.exports = errorHandler;
