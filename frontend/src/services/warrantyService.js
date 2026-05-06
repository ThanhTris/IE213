import { ethers } from "ethers";
import apiClient from "./apiClient";
import { pinataHelper, pinFileToPinata } from "../utils/pinata";
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
   * Handles the 4-step Hybrid Web3 Minting Process for Warranty NFTs.
   *
   * @returns {{ success: true, serialNumber: string }} — dùng để redirect
   * @throws Error với message tiếng Việt thân thiện (đã parse MetaMask errors)
   */
  processWarrantyMinting: async (formData, imageFile, calculatedExpiryDate, onProgress) => {
    let currentWarrantyId = null;
    const normalizedSerial = formData.serialNumber.trim().toUpperCase();

    try {
      // ── BƯỚC 1: Lưu nháp vào DB ─────────────────────────────────────────
      onProgress("1/4 Đang lưu nháp bảo hành vào hệ thống...");
      const res1 = await apiClient.post("/warranties", {
        serialNumber: normalizedSerial,
        productCode: formData.deviceModel,
        ownerWallet: formData.walletAddress,
        warrantyMonths: parseInt(formData.warrantyMonths, 10),
      });

      currentWarrantyId = res1.data?.id || res1.data?._id;
      if (!currentWarrantyId) {
        throw new Error("Không lấy được ID bản nháp bảo hành từ hệ thống.");
      }

      // ── BƯỚC 2: Upload IPFS (Pinata) ────────────────────────────────────
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
          { trait_type: "Serial Number", value: normalizedSerial },
          { trait_type: "Expiry Date", value: calculatedExpiryDate },
        ],
      };
      const tokenURI = await pinataHelper(metadata);

      // ── BƯỚC 3: Giao dịch Blockchain (MetaMask) ─────────────────────────
      onProgress("3/4 Đang đúc NFT trên blockchain — chờ xác nhận MetaMask...");
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

      onProgress("3/4 Giao dịch đã gửi — đang chờ xác nhận từ mạng...");
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

      // ── BƯỚC 4: Cập nhật DB với kết quả blockchain ──────────────────────
      onProgress("4/4 Đang hoàn tất và lưu kết quả vào hệ thống...");
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
