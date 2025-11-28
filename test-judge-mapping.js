import { ethers } from 'ethers';

// Test data
const JUDGE_ADDRESS = "0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default Hardhat deployment address

async function testJudgeMapping() {
  console.log('🧪 Testing Judge-Hackathon Mapping...\n');

  try {
    // Connect to the contract
    const contractABI = [
      "function hackathonCount() view returns (uint256)",
      "function getHackathon(uint256 hackathonId) view returns (string name, string description, address organizer, uint256 prizePoolWei, uint256 projectCount, uint256 judgeCount, bool active, uint256 registrationDeadline, uint256 startDate, uint256 endDate)",
      "function getJudges(uint256 hackathonId) view returns (address[])",
      "function isJudge(uint256 hackathonId, address judge) view returns (bool)",
      "function getHackathonsForJudge(address judgeAddress) view returns (uint256[])"
    ];

    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

    // Test 1: Get total hackathon count
    console.log('📊 Testing hackathonCount()...');
    const count = await contract.hackathonCount();
    console.log(`   Total hackathons: ${count.toNumber()}\n`);

    if (count.toNumber() === 0) {
      console.log('❌ No hackathons found. Please deploy with test data first.\n');
      return false;
    }

    // Test 2: Check judge assignment for each hackathon
    console.log(`🔍 Testing isJudge() for ${JUDGE_ADDRESS}...`);
    for (let i = 1; i <= count.toNumber(); i++) {
      try {
        const isJudge = await contract.isJudge(i, JUDGE_ADDRESS);
        const hackathon = await contract.getHackathon(i);
        console.log(`   Hackathon ${i}: "${hackathon.name}" - Judge assigned: ${isJudge ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`   Hackathon ${i}: ❌ Error - ${error.message}`);
      }
    }

    // Test 3: Test reverse mapping (get hackathons for judge)
    console.log(`\n🔄 Testing getHackathonsForJudge(${JUDGE_ADDRESS})...`);
    try {
      const judgeHackathons = await contract.getHackathonsForJudge(JUDGE_ADDRESS);
      const hackathonIds = judgeHackathons.map(id => id.toNumber());
      
      if (hackathonIds.length > 0) {
        console.log(`   ✅ Judge assigned to hackathons: [${hackathonIds.join(', ')}]`);
        
        // Get details for each assigned hackathon
        for (const id of hackathonIds) {
          try {
            const hackathon = await contract.getHackathon(id);
            console.log(`      - Hackathon ${id}: "${hackathon.name}"`);
          } catch (error) {
            console.log(`      - Hackathon ${id}: Error getting details`);
          }
        }
      } else {
        console.log(`   ❌ Judge not assigned to any hackathons`);
      }
    } catch (error) {
      console.log(`   ❌ Error getting judge hackathons: ${error.message}`);
      return false;
    }

    // Test 4: Get judges for each hackathon
    console.log(`\n👨‍⚖️ Testing getJudges() for each hackathon...`);
    for (let i = 1; i <= count.toNumber(); i++) {
      try {
        const judges = await contract.getJudges(i);
        const hackathon = await contract.getHackathon(i);
        console.log(`   Hackathon ${i} "${hackathon.name}": ${judges.length} judges`);
        judges.forEach((judge, index) => {
          console.log(`      ${index + 1}. ${judge}`);
        });
      } catch (error) {
        console.log(`   Hackathon ${i}: Error getting judges - ${error.message}`);
      }
    }

    console.log('\n✅ Judge mapping test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'CALL_EXCEPTION') {
      console.log('💡 Tip: Make sure the blockchain node is running and contract is deployed');
    }
    return false;
  }
}

async function main() {
  const success = await testJudgeMapping();
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error('Test script error:', error);
  process.exit(1);
});