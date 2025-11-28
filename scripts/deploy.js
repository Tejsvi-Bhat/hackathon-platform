import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Deploying HackerCoinPlatform contract...");

  const HackerCoinPlatform = await hre.ethers.getContractFactory("HackerCoinPlatform");
  const hackerCoinPlatform = await HackerCoinPlatform.deploy();

  await hackerCoinPlatform.deployed();

  console.log("HackerCoinPlatform deployed to:", hackerCoinPlatform.address);

  // Save contract address and ABI
  const contractData = {
    address: hackerCoinPlatform.address,
    abi: JSON.parse(hackerCoinPlatform.interface.format('json'))
  };

  const contractsDir = path.join(__dirname, "..", "lib", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "HackerCoinPlatform.json"),
    JSON.stringify(contractData, null, 2)
  );

  console.log("Contract data saved to lib/contracts/HackerCoinPlatform.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
