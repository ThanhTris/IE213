const { sendError, mapStatusToErrorCode } = require("../utils/apiResponse");

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const safeMessage =
    typeof err.message === "string" && err.message.trim()
      ? err.message
      : "Yêu cầu thất bại";
  const errorMessage = statusCode === 500 ? "Lỗi máy chủ nội bộ" : safeMessage;
  const errorCode = err.errorCode || mapStatusToErrorCode(statusCode);
  const details = Array.isArray(err.details) ? err.details : [];

  // Do not print stack traces to console in production environment here
  return sendError(res, {
    statusCode,
    errorCode,
    message: errorMessage,
    details,
  });
};

module.exports = errorHandler;
