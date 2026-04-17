const mongoose = require("mongoose");
const path = require("path");

// Load Environment
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const Product = require("./src/models/ProductModel");
const Warranty = require("./src/models/WarrantyModel");
const RepairLog = require("./src/models/RepairLogModel");
const TransferHistory = require("./src/models/TranferHistoryModel");
const User = require("./src/models/UserModel");

const MONGO_URI = process.env.MONGODB_URL || "mongodb://localhost:27017/e-warranty";

async function verify() {
  console.log("--- BẮT ĐẦU KIỂM TRA DỮ LIỆU ---");
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Kết nối MongoDB thành công.");

    const productCount = await Product.countDocuments();
    const warrantyCount = await Warranty.countDocuments();
    const mintedWarrantyCount = await Warranty.countDocuments({ tokenId: { $ne: null } });
    const repairCount = await RepairLog.countDocuments();
    const transferCount = await TransferHistory.countDocuments();
    const userCount = await User.countDocuments();

    console.log("\nTHỐNG KÊ CHI TIẾT:");
    console.table({
      "Sản phẩm (Products)": productCount,
      "Phiếu bảo hành (Warranties)": warrantyCount,
      "Trong đó đã Mint": mintedWarrantyCount,
      "Lịch sử sửa chữa (RepairLogs)": repairCount,
      "Lịch sử chuyển nhượng (Transfers)": transferCount,
      "Người dùng (Users)": userCount
    });

    // Kiểm tra tính đồng bộ
    console.log("\nKIỂM TRA TÍNH ĐỒNG BỘ:");
    if (mintedWarrantyCount > transferCount) {
      console.warn("⚠️ Số lượng bản ghi 'mint' trong TransferHistory ít hơn số bảo hành đã mint!");
    } else {
      console.log("✅ Dữ liệu TransferHistory có vẻ đầy đủ.");
    }

    await mongoose.connection.close();
    console.log("\n--- HOÀN TẤT ---");
  } catch (error) {
    console.error("[ERROR]", error.message);
  }
}

verify();
