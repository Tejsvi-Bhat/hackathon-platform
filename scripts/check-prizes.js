import { ethers } from 'ethers';

// Contract ABI to check prizes
const HACKERCOIN_ABI = [
  "function hackathonCount() view returns (uint256)",
  "function getHackathon(uint256 hackathonId) view returns (string name, string description, address organizer, uint256 prizePoolWei, uint256 projectCount, uint256 judgeCount, bool active, uint256 registrationDeadline, uint256 startDate, uint256 endDate)",
  "function getPrizes(uint256 hackathonId) view returns (tuple(string title, uint256 amount, uint256 position)[])"
];

const CONTRACT_ADDRESS = "0x176D598796508296b0d514CbC775AD65977fc9Cc";
const RPC_URL = "https://sepolia.infura.io/v3/1ba97db50e5a4b12b378b340284b81c1";

async function checkCurrentPrizes() {
  try {
    console.log('🔗 Connecting to Sepolia...');
    
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, HACKERCOIN_ABI, provider);
    
    const hackathonCount = await contract.hackathonCount();
    console.log('📊 Current hackathon count:', hackathonCount.toString());
    
    for (let i = 1; i <= hackathonCount; i++) {
      const hackathon = await contract.getHackathon(i);
      const prizes = await contract.getPrizes(i);
      
      console.log(`\n📋 Hackathon ${i}: ${hackathon.name}`);
      console.log(`   Prize Pool: ${ethers.utils.formatEther(hackathon.prizePoolWei)} ETH`);
      console.log(`   Prize Count: ${prizes.length}`);
      
      if (prizes.length > 0) {
        prizes.forEach((prize, index) => {
          console.log(`   Prize ${index + 1}: ${prize.title} - ${prize.amount} HC (Position ${prize.position})`);
        });
      } else {
        console.log('   ⚠️ No prizes configured');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking prizes:', error);
  }
}

checkCurrentPrizes();