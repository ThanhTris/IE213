const sendSuccess = (
  res,
  { statusCode = 200, data = null, message = "Success" } = {},
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const sendError = (
  res,
  { statusCode = 500, data = null, error = "Internal Server Error" } = {},
) => {
  return res.status(statusCode).json({
    success: false,
    data,
    error,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
