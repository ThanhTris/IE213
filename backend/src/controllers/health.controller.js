const { sendSuccess } = require("../utils/apiResponse");

const getHealthStatus = (req, res) => {
  return sendSuccess(res, {
    data: { status: "OK" },
    message: "Server is running",
  });
};

module.exports = {
  getHealthStatus,
};
