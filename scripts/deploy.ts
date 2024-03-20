import { ethers } from "hardhat";

async function main() {

  const UsdtTest = await ethers.deployContract("Usdt");
  await UsdtTest.waitForDeployment();
  console.log(`usdt deployed to ${UsdtTest.target}`);

  const genesis = await ethers.deployContract("GenesisTest",[UsdtTest.target]);
  await genesis.waitForDeployment();
  console.log(`genesis deployed to ${genesis.target}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


//CONTRATO VERDADEIRO

// import { ethers } from "hardhat";

// async function main() {

//   const UsdtTest = await ethers.deployContract("Usdt");
//   await UsdtTest.waitForDeployment();
//   console.log(`usdt deployed to ${UsdtTest.target}`);

//   const genesis = await ethers.deployContract("Genesis",[UsdtTest.target]);
//   await genesis.waitForDeployment();
//   console.log(`genesis deployed to ${genesis.target}`);

// }

// // We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });