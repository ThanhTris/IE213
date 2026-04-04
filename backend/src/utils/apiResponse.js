const sendSuccess = (
  res,
  { statusCode = 200, data = null, message = "Thành công" } = {},
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const mapStatusToErrorCode = (statusCode) => {
  switch (statusCode) {
    case 400:
      return "E400_VALIDATION";
    case 401:
      return "E401_UNAUTHORIZED";
    case 403:
      return "E403_FORBIDDEN";
    case 404:
      return "E404_NOT_FOUND";
    case 409:
      return "E409_DUPLICATE";
    default:
      return "E500_INTERNAL";
  }
};

const sendError = (
  res,
  {
    statusCode = 500,
    errorCode,
    message,
    details = [],
    // Backward compatibility for older callers using `error`.
    error,
  } = {},
) => {
  const resolvedCode = errorCode || mapStatusToErrorCode(statusCode);
  const resolvedMessage = message || error || "Lỗi nội bộ máy chủ";

  return res.status(statusCode).json({
    success: false,
    error: {
      code: resolvedCode,
      message: resolvedMessage,
      details: Array.isArray(details) ? details : [],
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
  mapStatusToErrorCode,
};
