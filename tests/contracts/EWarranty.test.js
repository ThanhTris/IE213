const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EWarranty", function () {
  let eWarranty;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const EWarranty = await ethers.getContractFactory("EWarranty");
    eWarranty = await EWarranty.deploy();
    await eWarranty.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await eWarranty.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await eWarranty.name()).to.equal("Electronic Warranty");
      expect(await eWarranty.symbol()).to.equal("EWAR");
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint a new warranty", async function () {
      const serialHash = ethers.id("SN-12345");
      const expiryDate = Math.floor(Date.now() / 1000) + 31536000; // 1 year
      const tokenURI = "ipfs://mock-uri";

      await expect(eWarranty.mintWarranty(user1.address, tokenURI, serialHash, expiryDate))
        .to.emit(eWarranty, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, 1);

      expect(await eWarranty.ownerOf(1)).to.equal(user1.address);
      expect(await eWarranty.tokenURI(1)).to.equal(tokenURI);

      const warrantyData = await eWarranty.warranties(1);
      expect(warrantyData.serialHash).to.equal(serialHash);
      expect(warrantyData.expiryDate).to.equal(expiryDate);
      expect(warrantyData.isActive).to.be.true;
    });

    it("Should NOT allow non-owner to mint", async function () {
      const serialHash = ethers.id("SN-12345");
      const expiryDate = Math.floor(Date.now() / 1000) + 31536000;

      await expect(
        eWarranty.connect(user1).mintWarranty(user2.address, "ipfs://test", serialHash, expiryDate)
      ).to.be.revertedWithCustomError(eWarranty, "OwnableUnauthorizedAccount").withArgs(user1.address);
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      const serialHash = ethers.id("SN-TRANSFER");
      const expiryDate = Math.floor(Date.now() / 1000) + 31536000;
      await eWarranty.mintWarranty(user1.address, "ipfs://test", serialHash, expiryDate);
    });

    it("Should allow NFT owner to transfer it to another address", async function () {
      await expect(eWarranty.connect(user1).transferFrom(user1.address, user2.address, 1))
        .to.emit(eWarranty, "Transfer")
        .withArgs(user1.address, user2.address, 1);

      expect(await eWarranty.ownerOf(1)).to.equal(user2.address);
    });
  });
});
