const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Product = require("./src/models/ProductModel");
const Warranty = require("./src/models/WarrantyModel");
const RepairLog = require("./src/models/RepairLogModel");
const TransferHistory = require("./src/models/TranferHistoryModel");
const User = require("./src/models/UserModel");

const MONGO_URI = process.env.MONGODB_URL;

async function exportData() {
  try {
    console.log("🚀 Đang kết nối MongoDB để xuất dữ liệu...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Kết nối thành công.");

    const dbPath = path.join(__dirname, "src", "database");
    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

    const collections = [
      { model: Product, fileName: "product.json" },
      { model: Warranty, fileName: "warranties.json" },
      { model: RepairLog, fileName: "repair_log.json" },
      { model: TransferHistory, fileName: "transfer_history.json" },
      { model: User, fileName: "users.json" }
    ];

    for (const item of collections) {
      console.log(`📦 Đang xuất dữ liệu từ: ${item.model.modelName}...`);
      const data = await item.model.find({}).lean();
      
      // Chuyển đổi _id thành dạng JSON-safe ($oid) nếu cần, 
      // nhưng ở đây chúng ta sẽ lưu thẳng để dễ đọc/ghi lại qua Mongoose
      fs.writeFileSync(
        path.join(dbPath, item.fileName),
        JSON.stringify(data, null, 2),
        "utf8"
      );
      console.log(`   ✅ Đã lưu ${data.length} records vào ${item.fileName}`);
    }

    console.log("\n✨ HOÀN TẤT: Dữ liệu đã được đồng bộ vào thư mục src/database/");
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Lỗi xuất dữ liệu:", error.message);
    process.exit(1);
  }
}

exportData();
