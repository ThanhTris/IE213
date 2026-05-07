const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EWarranty Smart Contract", function () {
  let EWarranty;
  let ewarranty;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Lấy các tài khoản giả lập từ Hardhat Network
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract trước mỗi test case
    EWarranty = await ethers.getContractFactory("EWarranty");
    ewarranty = await EWarranty.deploy();
  });

  describe("Deployment", function () {
    it("Nên thiết lập đúng Owner là người deploy", async function () {
      expect(await ewarranty.owner()).to.equal(owner.address);
    });

    it("Nên có tên và ký hiệu chính xác", async function () {
      expect(await ewarranty.name()).to.equal("Electronic Warranty");
      expect(await ewarranty.symbol()).to.equal("EWAR");
    });
  });

  describe("Minting Warranty", function () {
    const mockTokenURI = "ipfs://QmExample123";
    const mockSerialHash = ethers.encodeBytes32String("SN123456");
    const mockExpiryDate = Math.floor(Date.now() / 1000) + 31536000; // 1 năm sau

    it("Admin (Owner) nên đúc được bảo hành mới", async function () {
      await expect(ewarranty.mintWarranty(addr1.address, mockTokenURI, mockSerialHash, mockExpiryDate))
        .to.emit(ewarranty, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, 1);

      expect(await ewarranty.ownerOf(1)).to.equal(addr1.address);
      expect(await ewarranty.tokenURI(1)).to.equal(mockTokenURI);
      
      const data = await ewarranty.warranties(1);
      expect(data.serialHash).to.equal(mockSerialHash);
      expect(data.expiryDate).to.equal(mockExpiryDate);
      expect(data.isActive).to.be.true;
    });

    it("Người lạ KHÔNG ĐƯỢC phép đúc bảo hành", async function () {
      await expect(
        ewarranty.connect(addr1).mintWarranty(addr2.address, mockTokenURI, mockSerialHash, mockExpiryDate)
      ).to.be.revertedWithCustomError(ewarranty, "OwnableUnauthorizedAccount");
    });

    it("Token ID nên tự động tăng sau mỗi lần đúc", async function () {
      await ewarranty.mintWarranty(addr1.address, "uri1", mockSerialHash, mockExpiryDate);
      await ewarranty.mintWarranty(addr2.address, "uri2", mockSerialHash, mockExpiryDate);

      expect(await ewarranty.ownerOf(1)).to.equal(addr1.address);
      expect(await ewarranty.ownerOf(2)).to.equal(addr2.address);
    });
  });

  describe("Warranty Data Integrity", function () {
    it("Dữ liệu bảo hành trên chuỗi phải khớp với dữ liệu đã nhập", async function () {
      const serialHash = ethers.keccak256(ethers.toUtf8Bytes("SERIAL_NUMBER_001"));
      const expiry = 1735689600; // 01/01/2025

      await ewarranty.mintWarranty(addr1.address, "uri", serialHash, expiry);
      const data = await ewarranty.warranties(1);

      expect(data.serialHash).to.equal(serialHash);
      expect(data.expiryDate).to.equal(expiry);
    });
  });
});
