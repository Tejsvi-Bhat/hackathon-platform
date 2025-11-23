import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Deploying HackathonPlatform contract...");

  const HackathonPlatform = await hre.ethers.getContractFactory("HackathonPlatform");
  const hackathonPlatform = await HackathonPlatform.deploy();

  await hackathonPlatform.deployed();

  console.log("HackathonPlatform deployed to:", hackathonPlatform.address);

  // Save contract address and ABI
  const contractData = {
    address: hackathonPlatform.address,
    abi: JSON.parse(hackathonPlatform.interface.format('json'))
  };

  const contractsDir = path.join(__dirname, "..", "lib", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "HackathonPlatform.json"),
    JSON.stringify(contractData, null, 2)
  );

  console.log("Contract data saved to lib/contracts/HackathonPlatform.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
