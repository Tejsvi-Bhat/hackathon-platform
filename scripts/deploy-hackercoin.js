import hre from "hardhat";

async function main() {
  console.log("Deploying HackerCoinPlatform...");

  const HackerCoinPlatform = await hre.ethers.getContractFactory("HackerCoinPlatform");
  const platform = await HackerCoinPlatform.deploy();

  await platform.deployed();
  const address = platform.address;

  console.log("");
  console.log(" Contract deployed to:", address);
  console.log("");
  console.log(" Network:", hre.network.name);
  console.log(" Contract Address:", address);
  console.log("");
  console.log(" HackerCoin Economy:");
  console.log("- 1 HC = 0.000001 ETH");
  console.log("- Create Hackathon: 100 HC + prizes + judge fees");
  console.log("- Submit Project: 1 HC");
  console.log("");
  console.log(" Next Step - Add to .env.local:");
  console.log("NEXT_PUBLIC_CONTRACT_ADDRESS=" + address);
  console.log("");
  console.log(" View on Etherscan:");
  console.log("https://sepolia.etherscan.io/address/" + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
