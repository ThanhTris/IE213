import { ethers } from "ethers";
import { API_ROOT } from "../utils/api";
import { pinataHelper, pinFileToPinata } from "../utils/pinata";
import WarrantyNFT from "../contracts/WarrantyNFT.json";

/**
 * Handles the 4-step Hybrid Web3 Minting Process for Warranty NFTs.
 *
 * @param {Object} formData Contains { serialNumber, deviceModel, walletAddress, warrantyMonths }
 * @param {File} imageFile User selected image file, optional
 * @param {string} calculatedExpiryDate Expected expiry date in YYYY-MM-DD
 * @param {Function} onProgress Callback function to update UI step text
 * @returns {Promise<boolean>} True if successful
 */
export async function processWarrantyMinting(formData, imageFile, calculatedExpiryDate, onProgress) {
  let currentWarrantyId = null;

  try {
    // Lấy Token từ localStorage để chứng thực người dùng
    const token = localStorage.getItem("bw_auth_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    onProgress("1/4 Đang lưu nháp...");
    const res1 = await fetch(`${API_ROOT}/warranties`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        serialNumber: formData.serialNumber,
        productCode: formData.deviceModel,
        ownerAddress: formData.walletAddress,
        warrantyMonths: parseInt(formData.warrantyMonths, 10),
      }),
    });
    const data1 = await res1.json().catch(() => ({}));
    if (!res1.ok || data1.success === false) {
      const errorMsg = data1.error?.message || data1.message || "Lỗi tạo nháp bảo hành (Bước 1)";
      throw new Error(errorMsg);
    }

    let idCandidate = data1.data?.id || data1.data?._id || data1.data?.warrantyId || data1.id || data1._id || data1.warrantyId;
    if (idCandidate && typeof idCandidate === 'object' && idCandidate.$oid) {
      currentWarrantyId = idCandidate.$oid;
    } else if (idCandidate) {
      currentWarrantyId = typeof idCandidate === 'string' ? idCandidate : String(idCandidate);
    }

    if (!currentWarrantyId) {
      console.warn("DEBUG: Rất lạ, không tìm thấy _id trong response API Bước 1", data1);
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

    const contractAddress =
      import.meta.env.VITE_CONTRACT_ADDRESS ||
      "0x0000000000000000000000000000000000000000";

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
        } catch (_e) {
          // Xử lý nuốt lỗi khi parser không nhận diện log ERC721
        }
      }
    }

    // 4. GỌI API BƯỚC 2 (PATCH /api/warranties/:id)
    onProgress("4/4 Đang hoàn tất...");
    if (currentWarrantyId) {
      const res2 = await fetch(`${API_ROOT}/warranties/${currentWarrantyId}`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({
          txHash,
          tokenId,
          tokenURI,
          status: "active",
        }),
      });
      const data2 = await res2.json().catch(() => ({}));
      if (!res2.ok || data2.success === false) {
        const errorMsg = data2.error?.message || data2.message || "Lỗi cập nhật trạng thái bảo hành (Bước 4)";
        throw new Error(errorMsg);
      }
    } else {
      console.error("DEBUG: Đã nhảy tới Bước 4 nhưng currentWarrantyId bị trống, nên không gọi PATCH.");
      throw new Error("Mất kết nối với bản nháp bảo hành, không thể hoàn tất (Lỗi _id)");
    }

    return true; // Success
  } catch (err) {
    if (err.message && err.message.includes("user rejected")) {
        throw new Error("Người dùng đã từ chối giao dịch MetaMask.");
    }
    throw err; // Bubble up exact error for UI alert
  }
}
