/**
 * Pinata IPFS Utility
 * Cung cấp 2 functions:
 *  - uploadFileToPinata: Upload file (Buffer) lên Pinata, trả về CID
 *  - uploadJSONToPinata: Upload JSON metadata lên Pinata, trả về CID
 */

const PINATA_BASE_URL = "https://api.pinata.cloud";

/**
 * Upload một file (Buffer) lên Pinata IPFS.
 * @param {Buffer} buffer - Nội dung file dạng Buffer
 * @param {string} filename - Tên file (vd: "image.jpg")
 * @param {string} mimetype - MIME type (vd: "image/jpeg")
 * @returns {Promise<string>} CID của file trên IPFS
 */
const uploadFileToPinata = async (buffer, filename, mimetype) => {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT chưa được cấu hình trong .env");

  // Dùng native FormData (Node 18+) hoặc fallback sang form-data package
  let FormDataClass;
  try {
    // Node 18+ có global FormData
    FormDataClass = globalThis.FormData;
    if (!FormDataClass) throw new Error("no global FormData");
  } catch {
    FormDataClass = require("form-data");
  }

  const formData = new FormDataClass();

  // Tạo Blob từ buffer để attach vào FormData
  const blob = new Blob([buffer], { type: mimetype });
  formData.append("file", blob, filename);
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: filename }),
  );
  formData.append(
    "pinataOptions",
    JSON.stringify({ cidVersion: 1 }),
  );

  const response = await fetch(`${PINATA_BASE_URL}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Pinata uploadFile thất bại (${response.status}): ${errText}`);
  }

  const result = await response.json();
  return result.IpfsHash;
};

/**
 * Upload một JSON object lên Pinata IPFS.
 * @param {object} jsonData - Dữ liệu JSON cần upload
 * @param {string} name - Tên file metadata (vd: "warranty_SN001.json")
 * @returns {Promise<string>} CID của file JSON trên IPFS
 */
const uploadJSONToPinata = async (jsonData, name) => {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT chưa được cấu hình trong .env");

  const response = await fetch(`${PINATA_BASE_URL}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      pinataContent: jsonData,
      pinataMetadata: { name },
      pinataOptions: { cidVersion: 1 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Pinata uploadJSON thất bại (${response.status}): ${errText}`);
  }

  const result = await response.json();
  return result.IpfsHash;
};

module.exports = { uploadFileToPinata, uploadJSONToPinata };
