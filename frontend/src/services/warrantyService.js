import { ethers } from "ethers";
import apiClient from "./apiClient";
import { pinataHelper, pinFileToPinata } from "../utils/pinata";
import WarrantyNFT from "../contracts/WarrantyNFT.json";

export const warrantyService = {
  /**
   * Get all warranties (Admin only)
   */
  getAllWarranties: async (params) => {
    return apiClient.get("/warranties", { params });
  },

  /**
   * Count warranties by wallet address (Admin only)
   */
  countWarrantiesByWallet: async (walletAddress) => {
    return apiClient.get(`/warranties/count/${walletAddress}`);
  },

  /**
   * Get all warranties of a specific user (Admin only)
   */
  getWarrantiesByUser: async (walletAddress) => {
    return apiClient.get(`/warranties/user/${walletAddress}`);
  },

  /**
   * Get warranty stats for current user
   */
  getMyStats: async () => {
    return apiClient.get("/warranties/stats/me");
  },

  /**
   * Get current user's warranties
   */
  getMyWarranties: async () => {
    return apiClient.get("/warranties/my-warranties");
  },

  /**
   * Get warranty statistics (Admin only)
   */
  getStats: async () => {
    return apiClient.get("/warranties/stats");
  },

  /**
   * Publicly verify a warranty by serial number (Public)
   */
  verifyWarranty: async (serialNumber) => {
    return apiClient.get(`/warranties/verify/${encodeURIComponent(serialNumber)}`);
  },

  /**
   * Update warranty status (Admin only)
   */
  updateStatus: async (id, status) => {
    return apiClient.patch(`/warranties/${id}/status`, { status });
  },

  /**
   * Handles the 4-step Hybrid Web3 Minting Process for Warranty NFTs.
   */
  processWarrantyMinting: async (formData, imageFile, calculatedExpiryDate, onProgress) => {
    let currentWarrantyId = null;

    try {
      onProgress("1/4 Đang lưu nháp...");
      const res1 = await apiClient.post("/warranties", {
        serialNumber: formData.serialNumber,
        productCode: formData.deviceModel,
        ownerWallet: formData.walletAddress, // Cập nhật từ ownerAddress sang ownerWallet để khớp backend mới
        warrantyMonths: parseInt(formData.warrantyMonths, 10),
      });

      // apiClient đã trả về data (response.data) nhờ interceptor
      currentWarrantyId = res1.data?.id || res1.data?._id;

      if (!currentWarrantyId) {
        throw new Error("Không lấy được ID bản nháp bảo hành");
      }

      // 2. UPLOAD IPFS (Pinata)
      onProgress("2/4 Đang tải lên IPFS...");
      let imageHashUrl = "ipfs://Qmauto-generated-dummy-link";
      if (imageFile) {
        onProgress("2/4 Đang tải ảnh thiết bị lên IPFS...");
        imageHashUrl = await pinFileToPinata(imageFile);
      }

      onProgress("2/4 Đang tải siêu dữ liệu (Metadata) lên IPFS...");
      const metadata = {
        name: `Warranty NFT - ${formData.deviceModel}`,
        description: "Official E-Warranty NFT",
        image: imageHashUrl,
        attributes: [
          { trait_type: "Serial Number", value: formData.serialNumber },
          { trait_type: "Expiry Date", value: calculatedExpiryDate },
        ],
      };
      const tokenURI = await pinataHelper(metadata);

      // 3. GIAO DỊCH BLOCKCHAIN (MetaMask)
      onProgress("3/4 Đang đúc NFT...");
      if (!window.ethereum) throw new Error("MetaMask không được tìm thấy. Vui lòng cài đặt!");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
      const contract = new ethers.Contract(contractAddress, WarrantyNFT, signer);

      const serialHash = ethers.id(formData.serialNumber);
      const expiryTimestamp = Math.floor(new Date(calculatedExpiryDate).getTime() / 1000);

      const tx = await contract.mintWarranty(formData.walletAddress, tokenURI, serialHash, expiryTimestamp);
      const receipt = await tx.wait();
      const txHash = receipt.hash;

      let tokenId = "1"; // Fallback
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed && parsed.name === "Transfer") {
              tokenId = parsed.args.tokenId.toString();
            }
          } catch (_e) { }
        }
      }

      // 4. GỌI API BƯỚC 2 (PATCH /api/warranties/:id)
      onProgress("4/4 Đang hoàn tất...");
      await apiClient.patch(`/warranties/${currentWarrantyId}`, {
        txHash,
        tokenId,
        tokenURI,
        status: true, // Boolean theo DB mới
      });

      return true;
    } catch (err) {
      if (err.message && err.message.includes("user rejected")) {
        throw new Error("Người dùng đã từ chối giao dịch MetaMask.");
      }
      throw err;
    }
  }
};
