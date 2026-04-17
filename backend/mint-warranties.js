const axios = require("axios");

// CONFIGURATION
const API_URL = "http://localhost:5000/api";
const ADMIN_WALLET = "0x1234567890123456789012345678901234567890";

async function login(walletAddress) {
  try {
    const res = await axios.post(`${API_URL}/users/auth`, { walletAddress });
    return res.data.data.accessToken;
  } catch (error) {
    console.error(`[ERROR] Login failed:`, error.message);
    return null;
  }
}

async function mintAll() {
  console.log("--- BẮT ĐẦU MINT HÀNG LOẠT ---");
  const token = await login(ADMIN_WALLET);
  if (!token) return;

  try {
    // 1. Lấy danh sách bảo hành chưa mint
    const res = await axios.get(`${API_URL}/warranties`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const unminted = res.data.data.filter(w => !w.tokenId);
    console.log(`Tìm thấy ${unminted.length} bảo hành chưa có TokenID.`);

    for (const warranty of unminted) {
      const tokenId = (Date.now() % 1000000).toString();
      const txHash = `0x${require("crypto").randomBytes(32).toString("hex")}`;

      process.stdout.write(`Minting ${warranty.serialNumber}... `);
      await axios.patch(`${API_URL}/warranties/${warranty._id}`, {
        tokenId,
        txHash
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("DONE");
      await new Promise(r => setTimeout(r, 100));
    }
    console.log("--- HOÀN TẤT ---");
  } catch (error) {
    console.error("[ERROR]", error.response?.data?.message || error.message);
  }
}

mintAll();
