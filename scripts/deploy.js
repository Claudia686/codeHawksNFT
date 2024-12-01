const hre = require("hardhat");

async function main() {
  // Setup account
  const [owner] = await ethers.getSigners()
  const name = "CodeHawksNFT"
  const symbol = "CH"

  // Deploy contract
  const CodeHawksNFT = await ethers.getContractFactory("CodeHawksNFT")
  codeHawksNFT = await CodeHawksNFT.deploy(name, symbol)
  await codeHawksNFT.waitForDeployment()
  console.log(`codeHawksNFT contract deployed at: ${await codeHawksNFT.getAddress()}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});