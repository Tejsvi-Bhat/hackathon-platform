const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("🚀 Deploying HackerCoinPlatform to Sepolia...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Deploy the contract
  const HackerCoinPlatform = await ethers.getContractFactory("HackerCoinPlatform");
  const contract = await HackerCoinPlatform.deploy();
  await contract.deployed();

  console.log("✅ HackerCoinPlatform deployed to:", contract.address);
  console.log("📄 Transaction hash:", contract.deployTransaction.hash);

  // Test hackathon data
  const hackathons = [
    {
      name: "DeFi Innovation Challenge",
      description: "Build the next generation of DeFi protocols",
      prizePool: ethers.utils.parseUnits("10000", 18), // 10000 HC
      startTime: Math.floor(Date.now() / 1000),
      endTime: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      judgeAddress: "0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13"
    },
    {
      name: "NFT Marketplace Sprint",
      description: "Create innovative NFT marketplace features",
      prizePool: ethers.utils.parseUnits("15000", 18), // 15000 HC
      startTime: Math.floor(Date.now() / 1000),
      endTime: Math.floor(Date.now() / 1000) + 45 * 24 * 60 * 60, // 45 days
      judgeAddress: "0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13"
    },
    {
      name: "Web3 Gaming Hackathon",
      description: "Develop blockchain-based gaming experiences",
      prizePool: ethers.utils.parseUnits("20000", 18), // 20000 HC
      startTime: Math.floor(Date.now() / 1000),
      endTime: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60, // 60 days
      judgeAddress: "0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13"
    }
  ];

  console.log("\n🏆 Creating hackathons...");

  for (let i = 0; i < hackathons.length; i++) {
    const hackathon = hackathons[i];
    console.log(`\n📝 Creating hackathon ${i + 1}: ${hackathon.name}`);
    
    try {
      const fee = await contract.calculateCreationFee(hackathon.prizePool);
      console.log(`Prize: ${ethers.utils.formatUnits(hackathon.prizePool, 18)} HC`);
      console.log(`Fee: ${ethers.utils.formatEther(fee)} ETH`);

      const tx = await contract.createHackathon(
        hackathon.name,
        hackathon.description,
        hackathon.prizePool,
        hackathon.startTime,
        hackathon.endTime,
        hackathon.judgeAddress,
        { value: fee }
      );

      const receipt = await tx.wait();
      const hackathonId = receipt.events.find(e => e.event === 'HackathonCreated').args.hackathonId;
      console.log(`✅ Created hackathon ${hackathonId.toString()}`);
      console.log(`📄 Transaction: https://sepolia.etherscan.io/tx/${tx.hash}`);
      
    } catch (error) {
      console.error(`❌ Failed to create hackathon ${i + 1}:`, error.message);
    }
  }

  console.log("\n👨‍⚖️ Verifying judge assignments...");
  for (let i = 1; i <= hackathons.length; i++) {
    try {
      const isJudge = await contract.isJudge(i, "0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13");
      console.log(`Hackathon ${i}: Judge assigned: ${isJudge}`);
    } catch (error) {
      console.log(`Hackathon ${i}: Could not verify judge assignment`);
    }
  }

  console.log("\n🎉 Deployment complete!");
  console.log("📋 Contract details:");
  console.log(`   Address: ${contract.address}`);
  console.log(`   Network: Sepolia`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log("\n💡 Next steps:");
  console.log("1. Update your .env file with the new contract address:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contract.address}`);
  console.log("2. Update your frontend configuration");
  console.log("3. Verify the contract on Etherscan (optional)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });