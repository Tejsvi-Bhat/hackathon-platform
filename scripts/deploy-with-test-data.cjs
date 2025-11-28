const hre = require("hardhat");
const { ethers } = require("hardhat");

// Test data
const ORGANIZER_ADDRESS = "0x720f3a2cbdd2782481a9e93029ee11e753741935";
const JUDGE_ADDRESS = "0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13";
const PARTICIPANT_ADDRESS = "0xb8f43fd2025aebfbfdba5b754245777caca1d725";
const HACKERCOIN = ethers.utils.parseUnits("1", 6); // 1 HC = 1,000,000 wei

async function main() {
  console.log("🚀 Deploying HackerCoinPlatform...");
  
  // Deploy the contract
  const HackerCoinPlatform = await hre.ethers.getContractFactory("HackerCoinPlatform");
  const platform = await HackerCoinPlatform.deploy();
  await platform.deployed();

  console.log(`✅ HackerCoinPlatform deployed to: ${platform.address}`);

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Create test hackathons
  console.log("\n🏆 Creating test hackathons...");

  const now = Math.floor(Date.now() / 1000);
  const oneDay = 24 * 60 * 60;
  const oneWeek = 7 * oneDay;

  const hackathons = [
    {
      name: "DeFi Innovation Challenge",
      description: "Build the next generation of DeFi protocols",
      prizePool: ethers.utils.parseEther("0.01"), // 0.01 ETH
      registrationDeadline: now + oneDay,
      startDate: now + 2 * oneDay,
      endDate: now + oneWeek,
    },
    {
      name: "NFT Marketplace Sprint",
      description: "Create innovative NFT trading platforms",
      prizePool: ethers.utils.parseEther("0.015"), // 0.015 ETH
      registrationDeadline: now + 2 * oneDay,
      startDate: now + 3 * oneDay,
      endDate: now + oneWeek + oneDay,
    },
    {
      name: "Web3 Gaming Hackathon",
      description: "Develop blockchain-based gaming experiences",
      prizePool: ethers.utils.parseEther("0.02"), // 0.02 ETH
      registrationDeadline: now + oneDay,
      startDate: now + oneDay,
      endDate: now + oneWeek,
    }
  ];

  // Create hackathons (need to impersonate organizer or use deployer)
  for (let i = 0; i < hackathons.length; i++) {
    const h = hackathons[i];
    
    console.log(`\n📝 Creating hackathon ${i + 1}: ${h.name}`);
    
    // Create prizes array - contract expects Prize[] with title, amount in HC, and position
    const prizeAmountInHC = ethers.utils.formatUnits(h.prizePool, 18); // Convert from ETH to HC (1 HC = 1e6 wei)
    const prizeAmountHC = Math.floor(parseFloat(prizeAmountInHC) * 1000000); // Convert to HC units
    
    const prizes = [
      {
        title: "First Place",
        amount: prizeAmountHC, // Amount in HC
        position: 1
      }
    ];
    
    // Calculate required payment: (prizeAmount * HACKERCOIN) + (judges.length * JUDGE_BASE_FEE)
    const totalPrizePoolWei = ethers.BigNumber.from(prizeAmountHC).mul(HACKERCOIN);
    const judgesFeeWei = HACKERCOIN; // 1 HC per judge
    const totalPaymentWei = totalPrizePoolWei.add(judgesFeeWei);
    
    console.log(`Prize amount: ${prizeAmountHC} HC`);
    console.log(`Total payment required: ${ethers.utils.formatEther(totalPaymentWei)} ETH`);
    
    const tx = await platform.createHackathon(
      h.name,
      h.description,
      [JUDGE_ADDRESS], // judges array
      prizes, // prizes array
      h.registrationDeadline,
      h.startDate,
      h.endDate,
      { value: totalPaymentWei }
    );
    
    await tx.wait();
    console.log(`✅ Created hackathon ${i + 1} with ID: ${i + 1}`);
  }

  // Verify judge assignments
  console.log("\n👨‍⚖️ Verifying judge assignments...");
  for (let i = 1; i <= hackathons.length; i++) {
    const isJudge = await platform.isJudge(i, JUDGE_ADDRESS);
    console.log(`Hackathon ${i}: Judge ${JUDGE_ADDRESS} assigned: ${isJudge}`);
  }

  // Create test projects
  console.log("\n🚧 Creating test projects...");
  
  const projects = [
    {
      hackathonId: 1,
      name: "DeFi Yield Optimizer",
      description: "Automated yield farming strategy optimizer",
      githubUrl: "https://github.com/test/defi-optimizer",
      demoUrl: "https://defi-optimizer-demo.com",
    },
    {
      hackathonId: 1,
      name: "Cross-Chain Bridge",
      description: "Secure asset bridge between networks",
      githubUrl: "https://github.com/test/cross-chain-bridge",
      demoUrl: "https://bridge-demo.com",
    },
    {
      hackathonId: 2,
      name: "Creator-First NFT Platform",
      description: "NFT marketplace with creator royalties",
      githubUrl: "https://github.com/test/nft-platform",
      demoUrl: "https://nft-platform-demo.com",
    },
    {
      hackathonId: 3,
      name: "Blockchain RPG Game",
      description: "On-chain role-playing game",
      githubUrl: "https://github.com/test/blockchain-rpg",
      demoUrl: "https://rpg-demo.com",
    }
  ];

  // Impersonate the participant to submit projects
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [PARTICIPANT_ADDRESS],
  });
  
  // Fund the participant account for gas and submission fees
  await hre.network.provider.send("hardhat_setBalance", [
    PARTICIPANT_ADDRESS,
    "0x1000000000000000000", // 1 ETH
  ]);

  const participant = await ethers.getSigner(PARTICIPANT_ADDRESS);
  
  for (const project of projects) {
    console.log(`\n📋 Submitting project: ${project.name}`);
    
    try {
      const tx = await platform.connect(participant).submitProject(
        project.hackathonId,
        project.name,
        project.description,
        project.githubUrl,
        project.demoUrl,
        { value: HACKERCOIN } // 1 HC submission fee
      );
      
      await tx.wait();
      console.log(`✅ Submitted project: ${project.name} to hackathon ${project.hackathonId}`);
    } catch (error) {
      console.log(`❌ Failed to submit ${project.name}:`, error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress: platform.address,
    network: hre.network.name,
    deployer: deployer.address,
    organizer: ORGANIZER_ADDRESS,
    judge: JUDGE_ADDRESS,
    participant: PARTICIPANT_ADDRESS,
    hackathonCount: hackathons.length,
    deploymentTime: new Date().toISOString()
  };

  console.log("\n✅ Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Save to file for frontend use
  const fs = require('fs');
  fs.writeFileSync(
    './lib/contract-deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📁 Deployment info saved to lib/contract-deployment.json");
  
  return platform.address;
}

main()
  .then((address) => {
    console.log(`\n🎉 Setup complete! Contract address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });