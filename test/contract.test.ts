import { expect } from "chai";
import { ethers } from "hardhat";
import { CreditCertificate as CreditCertificate } from "../typechain-types";

describe("CreditCertificate", function () {
  let admin: any;
  let receiver: any;
  let contract: CreditCertificate;

  /* This is a function that runs before each test case. */
  beforeEach(async function () {
    // getting admin address
    [admin, receiver] = await ethers.getSigners();

    const CreditCertificate = await ethers.getContractFactory(
      "CreditCertificate"
    );
    contract = await CreditCertificate.deploy();
    await contract.deployed();
  });

  /* This is a test case. */
  describe("Lock and Mint", function () {
    /* This is a test case to check for lock funds. */
    it("Should lock funds", async function () {
      const lockedAmount = ethers.BigNumber.from("100000000000000000000");
      const tokenUri = "example";
      await contract.lockFunds(lockedAmount, tokenUri, { value: lockedAmount });
      const lockedData = await contract.locked(admin.address);
      expect(lockedData.amount).to.equal(lockedAmount);
    });

    /* This is a test case to check NFT mint after funds lock. */
    it("Should mint NFT", async function () {
      const lockedAmount = ethers.BigNumber.from("100000000000000000000");
      const tokenUri = "example";
      await contract.lockFunds(lockedAmount, tokenUri, { value: lockedAmount });
      expect(await contract.balanceOf(admin.address)).to.equal(1);
    });

    /* This is a test case to check if NFT is transferring or not. */
    it("Should not able to transfer NFT", async function () {
      const lockedAmount = ethers.BigNumber.from("100000000000000000000");
      const tokenUri = "example";
      await contract.lockFunds(lockedAmount, tokenUri, { value: lockedAmount });
      const lockedData = await contract.locked(admin.address);
      expect(
        await contract.transferFrom(
          admin.address,
          receiver.address,
          lockedData.tokenId
        )
      ).to.be.revertedWith("Not allowed to transfer certificate");
    });

    /* This is a test case to check unlocking of funds and bur certificate. */
    it("Should unlock funds and burn NFT", async function () {
      const lockedAmount = ethers.BigNumber.from("100000000000000000000");
      const tokenUri = "example";
      await contract.lockFunds(lockedAmount, tokenUri, { value: lockedAmount });
      let lockedData = await contract.locked(admin.address);
      expect(lockedData.amount).to.equal(lockedAmount);
      expect(await contract.balanceOf(admin.address)).to.equal(1);
      await contract.unLock(admin.address);
      lockedData = await contract.locked(admin.address);
      expect(lockedData.amount).to.equal(0);
    });
  });
});
