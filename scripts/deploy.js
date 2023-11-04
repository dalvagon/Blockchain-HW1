const hre = require("hardhat");

async function main() {
  const accounts = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", accounts[0].address);
  const productStoreContract = await hre.ethers.deployContract("ProductStore");
  const deployedContract = await productStoreContract.waitForDeployment();

  deployedContract.getAddress().then((address) => {
    console.log("Contract deployed to:", address);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
