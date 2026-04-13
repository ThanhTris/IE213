export async function pinataHelper(metadata) {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  
  // Fallback nếu quên cấu hình JWT
  if (!jwt) {
    console.warn("VITE_PINATA_JWT is missing, using mock IPFS upload.");
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomHash = "Qm" + Array.from({ length: 44 }, () => Math.random().toString(36)[2] || "0").join("");
        resolve(`ipfs://${randomHash}`);
      }, 1500);
    });
  }

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: metadata.name || "WarrantyMetadata.json"
        }
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Pinata upload failed: ${err.error?.details || res.statusText}`);
    }

    const data = await res.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
}

export async function pinFileToPinata(file) {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  
  if (!jwt) {
    console.warn("VITE_PINATA_JWT is missing, using mock IPFS upload.");
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomHash = "Qm" + Array.from({ length: 44 }, () => Math.random().toString(36)[2] || "0").join("");
        resolve(`ipfs://${randomHash}`);
      }, 1500);
    });
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: file.name || "warranty_image.png",
      })
    );

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Pinata image upload failed: ${err.error?.details || res.statusText}`);
    }

    const data = await res.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading image to Pinata:", error);
    throw error;
  }
}
