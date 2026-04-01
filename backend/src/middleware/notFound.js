const { sendError } = require("../utils/apiResponse");

const notFound = (req, res, _next) => {
  return sendError(res, {
    statusCode: 404,
    errorCode: "E404_NOT_FOUND",
    message: "Không tìm thấy đường dẫn",
  });
};

module.exports = notFound;
