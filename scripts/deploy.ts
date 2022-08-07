import { ethers } from "hardhat";

async function main() {
  const CreditCertificate = await ethers.getContractFactory(
    "CreditCertificate"
  );
  const contract = await CreditCertificate.deploy();
  await contract.deployed();

  console.log("contract deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
