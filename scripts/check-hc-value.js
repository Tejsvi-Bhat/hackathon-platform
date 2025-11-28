import { ethers } from 'ethers';

// Contract ABI to check HC to ETH conversion
const HACKERCOIN_ABI = [
  "function hackathonCount() view returns (uint256)",
  "function getHackathon(uint256 hackathonId) view returns (string name, string description, address organizer, uint256 prizePoolWei, uint256 projectCount, uint256 judgeCount, bool active, uint256 registrationDeadline, uint256 startDate, uint256 endDate)",
  "function getPrizes(uint256 hackathonId) view returns (tuple(string title, uint256 amount, uint256 position)[])"
];

const CONTRACT_ADDRESS = "0x176D598796508296b0d514CbC775AD65977fc9Cc";
const RPC_URL = "https://sepolia.infura.io/v3/1ba97db50e5a4b12b378b340284b81c1";

async function checkHCValue() {
  try {
    console.log('🔗 Connecting to Sepolia...');
    
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, HACKERCOIN_ABI, provider);
    
    console.log('💰 Analyzing HC to ETH conversion rates...\n');
    
    for (let i = 1; i <= 3; i++) {
      const hackathon = await contract.getHackathon(i);
      const prizes = await contract.getPrizes(i);
      
      console.log(`📋 Hackathon ${i}: ${hackathon.name}`);
      console.log(`   Contract Prize Pool (Wei): ${hackathon.prizePoolWei.toString()}`);
      console.log(`   Contract Prize Pool (ETH): ${ethers.utils.formatEther(hackathon.prizePoolWei)}`);
      
      if (prizes.length > 0) {
        const totalHC = prizes.reduce((sum, prize) => sum + Number(prize.amount), 0);
        console.log(`   Total HC from Prizes: ${totalHC} HC`);
        
        // Calculate HC to ETH ratio using BigNumber for precision
        const prizePoolWei = hackathon.prizePoolWei;
        const hcToWei = prizePoolWei.div(totalHC);
        const hcToETH = parseFloat(ethers.utils.formatEther(hcToWei));
        const ethToUSD = 2500; // Approximate ETH price for reference
        const hcToUSD = hcToETH * ethToUSD;
        
        console.log(`   HC to Wei ratio: 1 HC = ${hcToWei.toString()} Wei`);
        console.log(`   HC to ETH ratio: 1 HC = ${hcToETH.toFixed(12)} ETH`);
        console.log(`   HC to USD ratio: 1 HC ≈ $${hcToUSD.toFixed(8)} USD`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error checking HC value:', error);
  }
}

checkHCValue();