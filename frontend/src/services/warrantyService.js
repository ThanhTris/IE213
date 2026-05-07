import { ethers } from "ethers";
import apiClient from "./apiClient";
import { parseMetaMaskError } from "../utils/web3";
import WarrantyNFT from "../../../contracts/WarrantyNFT.json";

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
   * Handles the 3-step Hybrid Web3 Minting Process for Warranty NFTs.
   *
   * @returns {{ success: true, serialNumber: string }} — dùng để redirect
   * @throws Error với message tiếng Việt thân thiện (đã parse MetaMask errors)
   */
  processWarrantyMinting: async (formData, imageFile, calculatedExpiryDate, onProgress) => {
    let currentWarrantyId = null;
    const normalizedSerial = formData.serialNumber.trim().toUpperCase();

    try {
      // ── BƯỚC 1: Lưu nháp và Upload IPFS (Backend tự xử lý) ─────────────────────────────────────────
      onProgress("1/3 Đang lưu nháp bảo hành và tải dữ liệu lên IPFS...");
      
      const payload = new FormData();
      payload.append("serialNumber", normalizedSerial);
      payload.append("productCode", formData.deviceModel);
      payload.append("ownerWallet", formData.walletAddress);
      payload.append("warrantyMonths", parseInt(formData.warrantyMonths, 10));
      if (imageFile) {
        payload.append("image", imageFile);
      }

      const res1 = await apiClient.post("/warranties", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      currentWarrantyId = res1.data?.id || res1.data?._id;
      if (!currentWarrantyId) {
        throw new Error("Không lấy được ID bản nháp bảo hành từ hệ thống.");
      }

      const tokenURI = res1.data?.tokenURI;
      if (!tokenURI) {
        throw new Error("Hệ thống không trả về tokenURI. Vui lòng kiểm tra lại cấu hình IPFS ở backend.");
      }

      // ── BƯỚC 2: Giao dịch Blockchain (MetaMask) ─────────────────────────
      onProgress("2/3 Đang đúc NFT trên blockchain — chờ xác nhận MetaMask...");
      if (!window.ethereum) {
        throw new Error("MetaMask chưa được cài đặt. Vui lòng cài đặt để tiếp tục!");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contractAddress =
        import.meta.env.VITE_CONTRACT_ADDRESS ||
        "0x0000000000000000000000000000000000000000";
      const contract = new ethers.Contract(contractAddress, WarrantyNFT, signer);

      const serialHash = ethers.id(normalizedSerial);
      const expiryTimestamp = Math.floor(
        new Date(calculatedExpiryDate).getTime() / 1000
      );

      const tx = await contract.mintWarranty(
        formData.walletAddress,
        tokenURI,
        serialHash,
        expiryTimestamp
      );

      onProgress("2/3 Giao dịch đã gửi — đang chờ xác nhận từ mạng...");
      const receipt = await tx.wait();
      const txHash = receipt.hash;

      // Lấy tokenId từ event Transfer
      let tokenId = "1";
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed && parsed.name === "Transfer") {
              tokenId = parsed.args.tokenId.toString();
            }
          } catch (_e) {
            // log không phải Transfer event — bỏ qua
          }
        }
      }

      // ── BƯỚC 3: Cập nhật bằng chứng lên Backend ───────────────────────
      onProgress("3/3 Đang xác thực thông tin với hệ thống trung tâm...");
      await apiClient.patch(`/warranties/${currentWarrantyId}`, {
        txHash,
        tokenId,
        tokenURI,
        status: true,
      });

      // Trả về serialNumber để FE redirect
      return { success: true, serialNumber: normalizedSerial };

    } catch (err) {
      // Parse lỗi MetaMask → thông báo tiếng Việt thân thiện
      const friendlyMessage = parseMetaMaskError(err);
      throw new Error(friendlyMessage);
    }
  },
};
