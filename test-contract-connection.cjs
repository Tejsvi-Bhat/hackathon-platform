const { ethers } = require("hardhat");
require('dotenv').config();

async function testContract() {
  console.log("🧪 Testing Sepolia contract connection...");
  
  const CONTRACT_ADDRESS = "0x176D598796508296b0d514CbC775AD65977fc9Cc";
  const RPC_URL = process.env.SEPOLIA_RPC_URL;
  
  console.log("Contract Address:", CONTRACT_ADDRESS);
  console.log("RPC URL:", RPC_URL);
  
  // Connect to Sepolia
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  
  // Contract ABI - just the functions we need for testing
  const HACKERCOIN_ABI = [
    "function hackathonCount() view returns (uint256)",
    "function getHackathon(uint256 hackathonId) view returns (string name, string description, address organizer, uint256 prizePoolWei, uint256 projectCount, uint256 judgeCount, bool active, uint256 registrationDeadline, uint256 startDate, uint256 endDate)",
    "function isJudge(uint256 hackathonId, address judge) view returns (bool)",
    "function getHackathonsForJudge(address judgeAddress) view returns (uint256[])"
  ];
  
  // Create contract instance
  const contract = new ethers.Contract(CONTRACT_ADDRESS, HACKERCOIN_ABI, provider);
  
  try {
    // Test basic contract call
    const hackathonCount = await contract.hackathonCount();
    console.log("✅ Total hackathons on contract:", hackathonCount.toString());
    
    // Test judge assignment for our judge address
    const judgeAddress = "0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13";
    const assignedHackathons = await contract.getHackathonsForJudge(judgeAddress);
    console.log(`✅ Hackathons assigned to judge ${judgeAddress}:`, assignedHackathons.map(h => h.toString()));
    
    // Get details of each hackathon
    for (let i = 1; i <= hackathonCount; i++) {
      try {
        const hackathon = await contract.getHackathon(i);
        const isJudge = await contract.isJudge(i, judgeAddress);
        console.log(`\n📋 Hackathon ${i}:`);
        console.log(`   Name: ${hackathon.name}`);
        console.log(`   Description: ${hackathon.description}`);
        console.log(`   Projects: ${hackathon.projectCount.toString()}`);
        console.log(`   Judge assigned: ${isJudge}`);
        console.log(`   Active: ${hackathon.active}`);
      } catch (error) {
        console.log(`❌ Error getting hackathon ${i}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error("❌ Contract connection failed:", error.message);
  }
}

testContract().catch(console.error);