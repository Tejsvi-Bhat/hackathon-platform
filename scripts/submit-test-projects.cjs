const { ethers } = require("hardhat");
const readline = require('readline');
const { execSync } = require('child_process');
require('dotenv').config();

// Function to ask for user input
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function createProjectsInDatabase(participantAddress, projects) {
  console.log("\n💾 Creating projects in database using psql...");
  
  const databaseUrl = process.env.DATABASE_URL;
  
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    console.log(`📝 Creating project: ${project.name}`);
    
    try {
      // Insert project into database
      const insertProjectSql = `
        INSERT INTO projects (name, description, repository_url, demo_url, hackathon_id, created_at, updated_at) 
        VALUES ('${project.name}', '${project.description}', '${project.repositoryUrl}', '${project.demoUrl}', ${project.hackathonId}, NOW(), NOW()) 
        RETURNING id;
      `;
      
      const result = execSync(`psql "${databaseUrl}" -c "${insertProjectSql}" -t`, { encoding: 'utf-8' });
      const projectId = result.trim();
      console.log(`✅ Created project with DB ID: ${projectId}`);
      
      // Add participant as project member with blockchain address
      const insertMemberSql = `
        INSERT INTO project_members (project_id, member_address, role, created_at, updated_at) 
        VALUES (${projectId}, '${participantAddress}', 'owner', NOW(), NOW());
      `;
      
      execSync(`psql "${databaseUrl}" -c "${insertMemberSql}"`, { encoding: 'utf-8' });
      console.log(`👤 Added participant ${participantAddress} as project owner`);
      
      // Store the database ID for contract submission
      project.dbId = parseInt(projectId);
      
    } catch (error) {
      console.error(`❌ Failed to create project ${project.name}:`, error.message);
      throw error;
    }
  }
}

async function main() {
  console.log("🚧 Creating test projects in blockchain mode...");
  console.log("📝 This will create projects in DB first, then submit to contract\n");
  
  // Contract details
  const CONTRACT_ADDRESS = "0x176D598796508296b0d514CbC775AD65977fc9Cc";
  
  // Interactive input for participant details
  const participantAddress = await askQuestion("Enter participant wallet address (default: 0xb8f43fd2025aebfbfdba5b754245777caca1d725): ");
  const finalParticipantAddress = participantAddress.trim() || "0xb8f43fd2025aebfbfdba5b754245777caca1d725";
  
  const participantPrivateKey = await askQuestion("Enter participant private key (or press Enter to use deployer key): ");
  
  let signer;
  if (participantPrivateKey.trim()) {
    // Use participant's private key
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    signer = new ethers.Wallet(participantPrivateKey.trim(), provider);
    console.log("✅ Using participant wallet:", signer.address);
    
    // Verify the address matches
    if (signer.address.toLowerCase() !== finalParticipantAddress.toLowerCase()) {
      console.log("⚠️  Warning: Private key doesn't match the provided address!");
      console.log("Private key address:", signer.address);
      console.log("Provided address:", finalParticipantAddress);
      
      const proceed = await askQuestion("Continue anyway? (y/N): ");
      if (proceed.toLowerCase() !== 'y') {
        console.log("❌ Cancelled by user");
        process.exit(0);
      }
    }
  } else {
    // Use deployer key as fallback
    const [deployer] = await ethers.getSigners();
    signer = deployer;
    console.log("✅ Using deployer wallet as participant:", signer.address);
    // Update the participant address to match the signer
    finalParticipantAddress = signer.address;
  }
  
  // Check wallet balance
  const balance = await signer.getBalance();
  console.log("💰 Wallet balance:", ethers.utils.formatEther(balance), "ETH");
  
  if (balance.eq(0)) {
    console.log("❌ Error: Wallet has no ETH for gas fees!");
    console.log("Please add some Sepolia ETH to:", signer.address);
    process.exit(1);
  }
  
  // Get contract instance
  const HackerCoinPlatform = await ethers.getContractFactory("HackerCoinPlatform");
  const contract = HackerCoinPlatform.attach(CONTRACT_ADDRESS).connect(signer);
  
  // Test projects data
  const projects = [
    {
      hackathonId: 1, // DeFi Innovation Challenge
      name: "DeFiLend Protocol",
      description: "A decentralized lending platform with dynamic interest rates",
      repositoryUrl: "https://github.com/participant/defilend",
      demoUrl: "https://defilend-demo.vercel.app"
    },
    {
      hackathonId: 1, // DeFi Innovation Challenge  
      name: "YieldFarm Pro",
      description: "Advanced yield farming strategies with automated rebalancing",
      repositoryUrl: "https://github.com/participant/yieldfarm-pro",
      demoUrl: "https://yieldfarm-pro.netlify.app"
    },
    {
      hackathonId: 2, // NFT Marketplace Sprint
      name: "MetaMarket",
      description: "Cross-chain NFT marketplace with fractional ownership",
      repositoryUrl: "https://github.com/participant/metamarket",
      demoUrl: "https://metamarket-demo.vercel.app"
    },
    {
      hackathonId: 3, // Web3 Gaming Hackathon
      name: "CryptoQuest",
      description: "RPG game with NFT characters and blockchain-based economies",
      repositoryUrl: "https://github.com/participant/cryptoquest",
      demoUrl: "https://cryptoquest-game.vercel.app"
    }
  ];

  // Step 1: Create projects in database first
  await createProjectsInDatabase(signer.address, projects);

  console.log("\n🔗 Submitting projects to smart contract...");
  
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    console.log(`\n🚀 Submitting project ${i + 1}: ${project.name}`);
    console.log(`   Hackathon ID: ${project.hackathonId}`);
    console.log(`   Description: ${project.description}`);
    
    try {
      // Calculate submission fee (1 HC = 1,000,000 wei)
      const submissionFee = ethers.BigNumber.from("1000000"); // 1 HC in wei
      
      const tx = await contract.submitProject(
        project.hackathonId,
        project.name,
        project.description,
        project.repositoryUrl,
        project.demoUrl,
        { value: submissionFee } // Include submission fee
      );
      
      const receipt = await tx.wait();
      console.log(`✅ Project submitted to contract!`);
      console.log(`📄 Transaction: https://sepolia.etherscan.io/tx/${tx.hash}`);
      
      // Get project ID from events
      const projectSubmittedEvent = receipt.events.find(e => e.event === 'ProjectSubmitted');
      if (projectSubmittedEvent) {
        const contractProjectId = projectSubmittedEvent.args.projectId.toString();
        console.log(`🆔 Contract Project ID: ${contractProjectId}`);
        console.log(`🗃️  Database Project ID: ${project.dbId}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to submit project ${i + 1}:`, error.message);
    }
    
    // Add delay between submissions
    if (i < projects.length - 1) {
      console.log("⏱️  Waiting 2 seconds before next submission...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log("\n📊 Verifying submissions...");
  
  // Check project counts for each hackathon
  for (let hackathonId = 1; hackathonId <= 3; hackathonId++) {
    try {
      const hackathon = await contract.getHackathon(hackathonId);
      console.log(`Hackathon ${hackathonId}: ${hackathon.projectCount.toString()} projects submitted`);
    } catch (error) {
      console.log(`Hackathon ${hackathonId}: Could not verify project count`);
    }
  }
  
  console.log("\n🎉 Test projects creation complete!");
  console.log("📊 Summary:");
  console.log(`   Participant address: ${signer.address}`);
  console.log(`   Contract address: ${CONTRACT_ADDRESS}`);
  console.log(`   Network: Sepolia`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Project submission failed:", error);
    process.exit(1);
  });