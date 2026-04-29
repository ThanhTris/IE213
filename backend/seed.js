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

async function seedDirect() {
  try {
    console.log("==================================================");
    console.log("🚀 BẮT ĐẦU KỊCH BẢN NẠP DỮ LIỆU TRỰC TIẾP (DIRECT SEED)");
    console.log("==================================================");

    if (!MONGO_URI) {
      console.error("❌ LỖI: Chưa có MONGODB_URL trong file .env");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log("📡 Đã kết nối thành công tới MongoDB.");

    const dbDir = path.join(__dirname, "src", "database");

    // Danh sách các bảng cần nạp theo thứ tự ưu tiên
    const seedTasks = [
      {
        name: "Người dùng (Users)",
        model: User,
        file: "users.json",
        key: "walletAddress"
      },
      {
        name: "Sản phẩm (Products)",
        model: Product,
        file: "product.json",
        key: "productCode"
      },
      {
        name: "Phiếu bảo hành (Warranties)",
        model: Warranty,
        file: "warranties.json",
        key: "serialNumber"
      },
      {
        name: "Nhật ký sửa chữa (Repair Logs)",
        model: RepairLog,
        file: "repair_log.json",
        key: "_id"
      },
      {
        name: "Lịch sử chuyển nhượng (Transfers)",
        model: TransferHistory,
        file: "transfer_history.json",
        key: "_id"
      }
    ];

    for (const task of seedTasks) {
      console.log(`\n📦 Đang xử lý: ${task.name}...`);
      const filePath = path.join(dbDir, task.file);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`   ⚠️ Bỏ qua: Không tìm thấy file ${task.file}`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      console.log(`   - Tìm thấy ${data.length} bản ghi.`);

      let successCount = 0;
      for (const item of data) {
        try {
          // Sử dụng findOneAndUpdate với upsert để không tạo trùng lặp
          // Chúng ta khớp theo 'key' định danh của mỗi bảng
          const filter = {};
          filter[task.key] = item[task.key];

          await task.model.findOneAndUpdate(filter, item, {
            upsert: true,
            new: true,
            runValidators: false // Tắt validator vì data đã được export từ DB xịn
          });
          successCount++;
        } catch (err) {
          console.error(`   ❌ Lỗi bản ghi ${item[task.key]}:`, err.message);
        }
      }
      console.log(`   ✅ Hoàn tất: ${successCount}/${data.length} bản ghi.`);
    }

    console.log("\n==================================================");
    console.log("🎉 SEED HOÀN TẤT: DỮ LIỆU ĐÃ ĐƯỢC ĐỒNG BỘ TRỰC TIẾP");
    console.log("==================================================");
    
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Lỗi hệ thống:", error.message);
    process.exit(1);
  }
}

seedDirect();
