import { ethers } from 'ethers';

// Contract details
const CONTRACT_ADDRESS = "0x176D598796508296b0d514CbC775AD65977fc9Cc";
const RPC_URL = "https://sepolia.infura.io/v3/1ba97db50e5a4b12b378b340284b81c1";

const ABI = [
  "function hackathonCount() view returns (uint256)",
  "function getHackathon(uint256 hackathonId) view returns (string name, string description, address organizer, uint256 prizePoolWei, uint256 projectCount, uint256 judgeCount, bool active, uint256 registrationDeadline, uint256 startDate, uint256 endDate)",
  "function getJudges(uint256 hackathonId) view returns (address[])",
  "function getHackathonsForJudge(address judgeAddress) view returns (uint256[])",
  "function isJudge(uint256 hackathonId, address judge) view returns (bool)"
];

async function debugJudgeHackathons() {
  try {
    console.log('🔍 Connecting to contract...');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    // Get total hackathon count
    const hackathonCount = await contract.hackathonCount();
    console.log(`📊 Total hackathons: ${hackathonCount}`);

    // Check each hackathon and list its judges
    for (let i = 1; i <= hackathonCount; i++) {
      console.log(`\n🏆 Hackathon ${i}:`);
      try {
        const hackathon = await contract.getHackathon(i);
        console.log(`   Name: ${hackathon.name}`);
        console.log(`   Organizer: ${hackathon.organizer}`);
        console.log(`   Judge Count: ${hackathon.judgeCount}`);
        
        const judges = await contract.getJudges(i);
        console.log(`   Judges: ${judges.join(', ')}`);

        // Test a few addresses to see if any are judges
        const testAddresses = [
          hackathon.organizer,
          "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // common test address
          "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"  // another common test address
        ];

        for (const addr of testAddresses) {
          const isJudgeResult = await contract.isJudge(i, addr);
          if (isJudgeResult) {
            console.log(`   ✅ ${addr} IS a judge for this hackathon`);
            
            // Test getHackathonsForJudge for this address
            const assignedHackathons = await contract.getHackathonsForJudge(addr);
            console.log(`   📋 Hackathons assigned to ${addr}: [${assignedHackathons.join(', ')}]`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error fetching hackathon ${i}:`, error.message);
      }
    }

    console.log('\n🔍 Testing getHackathonsForJudge with the actual judge address...');
    
    const judgeAddress = "0x135fDfDDD225A7e4A75C4815aA4ADf3b780E8E13";
    console.log(`Testing with judge address: ${judgeAddress}`);
    
    const assignedHackathons = await contract.getHackathonsForJudge(judgeAddress);
    console.log(`✅ Hackathons assigned to judge ${judgeAddress}: [${assignedHackathons.join(', ')}]`);

    // Also test the isJudge function for this address
    for (let i = 1; i <= hackathonCount; i++) {
      const isJudgeResult = await contract.isJudge(i, judgeAddress);
      console.log(`   Hackathon ${i}: isJudge = ${isJudgeResult}`);
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

debugJudgeHackathons();