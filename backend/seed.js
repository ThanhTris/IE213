const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// CONFIGURATION
const API_URL = "http://localhost:5000/api";
const IMAGE_DIR = path.resolve(__dirname, "src/database"); // Nơi chứa ảnh mẫu (ID1.jpg, ...)

const ADMIN_WALLET = "0x1234567890123456789012345678901234567890";
const TECHNICIAN_WALLET = "0x9876543210987654321098765432109876543210";
const CUSTOMER_WALLETS = [
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123"
];

let adminToken = "";
let techToken = "";
let customerTokens = {};

async function login(walletAddress) {
  try {
    const res = await axios.post(`${API_URL}/users/auth`, { walletAddress });
    return res.data.data.accessToken;
  } catch (error) {
    console.error(`[ERROR] Login failed for ${walletAddress}:`, error.message);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSeed() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║          E-WARRANTY SEED DATA SCRIPT v2.0           ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // 1. LOGIN
  console.log("[INFO] Đảm bảo các wallets đã login (upsert vào DB)...");
  adminToken = await login(ADMIN_WALLET);
  techToken = await login(TECHNICIAN_WALLET);
  for (const wallet of CUSTOMER_WALLETS) {
    customerTokens[wallet] = await login(wallet);
  }
  console.log("[OK] Tất cả wallets đã sẵn sàng.\n");

  // 2. SEED PRODUCTS (50 items)
  console.log("BƯỚC 2: SEED 50 SẢN PHẨM...");
  const products = [];
  for (let i = 1; i <= 50; i++) {
    const productCode = `PROD${String(i).padStart(3, "0")}`;
    const formData = new FormData();
    formData.append("productCode", productCode);
    formData.append("productName", `Sản phẩm mẫu #${i}`);
    formData.append("brand", i % 2 === 0 ? "Apple" : "Samsung");
    formData.append("color", i % 3 === 0 ? "Midnight Bloom" : "Space Gray");
    formData.append("config", "8GB RAM, 256GB SSD");
    formData.append("description", "Mô tả sản phẩm mẫu được tạo tự động bởi seed script.");
    formData.append("price", 10000000 + i * 500000);
    formData.append("warrantyMonths", i % 2 === 0 ? 12 : 24);

    const imgName = `ID${(i % 5) + 1}.jpg`;
    const imgPath = path.join(IMAGE_DIR, imgName);
    if (fs.existsSync(imgPath)) {
      formData.append("image", fs.createReadStream(imgPath));
    }

    try {
      const res = await axios.post(`${API_URL}/products`, formData, {
        headers: { 
          ...formData.getHeaders(),
          Authorization: `Bearer ${adminToken}` 
        }
      });
      products.push(res.data.data);
      process.stdout.write(".");
    } catch (error) {
      console.error(`\n[ERROR] Failed to seed product ${productCode}:`, error.response?.data?.message || error.message);
    }
    await sleep(600);
  }
  console.log("\n[OK] Hoàn tất seed sản phẩm.\n");

  // 3. SEED WARRANTIES (30 items)
  console.log("BƯỚC 3: SEED 30 PHIẾU BẢO HÀNH (PRE-MINT)...");
  const warranties = [];
  for (let i = 1; i <= 30; i++) {
    const product = products[i % products.length];
    const customer = CUSTOMER_WALLETS[i % CUSTOMER_WALLETS.length];
    const serialNumber = `SN-${Date.now()}-${String(i).padStart(3, "0")}`;

    const formData = new FormData();
    formData.append("serialNumber", serialNumber);
    formData.append("productCode", product.productCode);
    formData.append("ownerWallet", customer);

    try {
      const res = await axios.post(`${API_URL}/warranties`, formData, {
        headers: { 
          ...formData.getHeaders(),
          Authorization: `Bearer ${adminToken}` 
        }
      });
      warranties.push(res.data.data);
      process.stdout.write(".");
    } catch (error) {
      console.error(`\n[ERROR] Failed to seed warranty ${serialNumber}:`, error.response?.data?.message || error.message);
    }
    await sleep(600);
  }
  console.log("\n[OK] Hoàn tất seed bảo hành.\n");

  // 4. MINT WARRANTIES (Simulate Blockchain Events)
  console.log("BƯỚC 4: CẬP NHẬT MINT INFO (PATCH)...");
  for (let i = 0; i < warranties.length; i++) {
    const warranty = warranties[i];
    if (i % 2 !== 0) continue;

    const tokenId = (1000 + i).toString();
    const txHash = `0x${require("crypto").randomBytes(32).toString("hex")}`;

    try {
      await axios.patch(`${API_URL}/warranties/${warranty._id}`, {
        tokenId,
        txHash
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      process.stdout.write("+");
    } catch (error) {
      console.error(`\n[ERROR] Failed to update mint for ${warranty.serialNumber}`);
    }
    await sleep(600);
  }
  console.log("\n[OK] Đã mint một số bảo hành mẫu.\n");

  // 5. SEED REPAIR LOGS (20 items)
  console.log("BƯỚC 5: SEED 20 LỊCH SỬ SỬA CHỮA...");
  for (let i = 1; i <= 20; i++) {
    const warranty = warranties[i % warranties.length];
    try {
      await axios.post(`${API_URL}/repair-logs`, {
        serialNumber: warranty.serialNumber,
        repairContent: `Bảo trì định kỳ lần #${i}: Kiểm tra phần cứng và cập nhật firmware.`,
        isWarrantyCovered: i % 2 === 0,
        status: "done",
        cost: i % 4 === 0 ? 500000 : 0
      }, {
        headers: { Authorization: `Bearer ${techToken}` }
      });
      process.stdout.write(".");
    } catch (error) {
      console.error(`\n[ERROR] RepairLog failed:`, error.response?.data?.message || error.message);
    }
    await sleep(600);
  }
  console.log("\n[OK] Hoàn tất seed lịch sử sửa chữa.\n");

  console.log("============================================================");
  console.log("HOÀN TẤT SEED DỮ LIỆU. HỆ THỐNG ĐÃ SẴN SÀNG.");
  console.log("============================================================");
}

runSeed();
