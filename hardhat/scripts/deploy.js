const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { WST_TOKEN_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  const exchangeContract = await ethers.getContractFactory("Exchange");
  const deployedContract = await exchangeContract.deploy(
    WST_TOKEN_CONTRACT_ADDRESS
  );
  await deployedContract.deployed();

  console.log("Address:", deployedContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
