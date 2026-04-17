/**
 * Multer Middleware Configuration
 * Dùng memoryStorage để giữ file trong RAM (buffer),
 * sau đó upload thẳng lên Pinata IPFS mà không cần lưu disk.
 */

const multer = require("multer");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_MB = 10;

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${ALLOWED_MIME_TYPES.join(", ")}`,
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

/**
 * Middleware upload 1 file ảnh (field name: "image"), optional.
 * Nếu không có file thì vẫn tiếp tục xử lý bình thường.
 */
const uploadSingleImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        errorCode: "E400_MULTER",
        message: `Lỗi upload file: ${err.message}`,
      });
    }
    if (err) {
      return res.status(400).json({
        success: false,
        errorCode: "E400_FILE_TYPE",
        message: err.message,
      });
    }
    return next();
  });
};

module.exports = { uploadSingleImage };
