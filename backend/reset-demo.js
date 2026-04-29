const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Import Models
const Product = require("./src/models/ProductModel");
const User = require("./src/models/UserModel");
const Warranty = require("./src/models/WarrantyModel");
const RepairLog = require("./src/models/RepairLogModel");
const TransferHistory = require("./src/models/TranferHistoryModel");

const MONGO_URI = process.env.MONGODB_URL;

async function resetAndSeedDemo() {
  try {
    console.log("==================================================");
    console.log("🔄 BẮT ĐẦU RESET DATABASE DEMO");
    console.log("==================================================");

    if (!MONGO_URI || !MONGO_URI.includes("demo")) {
      console.error("❌ LỖI: MONGODB_URL không trỏ vào database demo!");
      console.error("Để bảo vệ DB gốc, script này yêu cầu MONGODB_URL phải chứa chữ 'demo'.");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log("📡 Đã kết nối thành công tới MongoDB Demo.");

    // Xóa toàn bộ dữ liệu hiện có
    console.log("\n🗑️ Đang xóa dữ liệu cũ trong DB Demo...");
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Warranty.deleteMany({}),
      RepairLog.deleteMany({}),
      TransferHistory.deleteMany({})
    ]);
    console.log("✅ Đã xóa sạch dữ liệu cũ.");

    // Bắt đầu nạp lại dữ liệu từ JSON
    const dbDir = path.join(__dirname, "src", "database");

    const seedTasks = [
      { name: "Người dùng (Users)", model: User, file: "users.json" },
      { name: "Sản phẩm (Products)", model: Product, file: "product.json" },
      { name: "Phiếu bảo hành (Warranties)", model: Warranty, file: "warranties.json" },
      { name: "Nhật ký sửa chữa (Repair Logs)", model: RepairLog, file: "repair_log.json" },
      { name: "Lịch sử chuyển nhượng (Transfers)", model: TransferHistory, file: "transfer_history.json" }
    ];

    for (const task of seedTasks) {
      console.log(`\n📦 Đang nạp lại: ${task.name}...`);
      const filePath = path.join(dbDir, task.file);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`   ⚠️ Bỏ qua: Không tìm thấy file ${task.file}`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      
      // Chèn hàng loạt (nhanh hơn nhiều so với update từng dòng)
      if (data.length > 0) {
        await task.model.insertMany(data, { runValidators: false });
      }
      
      console.log(`   ✅ Hoàn tất: nạp ${data.length} bản ghi.`);
    }

    console.log("\n==================================================");
    console.log("🎉 RESET VÀ SEED DATABASE DEMO THÀNH CÔNG");
    console.log("==================================================");
    
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Lỗi hệ thống:", error.message);
    process.exit(1);
  }
}

resetAndSeedDemo();
