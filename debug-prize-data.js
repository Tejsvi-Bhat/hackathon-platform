import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x176D598796508296b0d514CbC775AD65977fc9Cc";
const RPC_URL = "https://sepolia.infura.io/v3/1ba97db50e5a4b12b378b340284b81c1";

const ABI = [
  "function getPrizes(uint256 hackathonId) view returns (tuple(string title, uint256 amount, uint256 position)[])"
];

async function testPrizeData() {
  try {
    console.log('🔍 Testing prize data from contract...');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    for (let i = 1; i <= 3; i++) {
      console.log(`\n🏆 Hackathon ${i} prizes:`);
      try {
        const prizes = await contract.getPrizes(i);
        console.log('Raw prizes:', prizes);
        
        // Check what type of objects these are
        console.log('Prizes length:', prizes.length);
        if (prizes.length > 0) {
          console.log('First prize structure:', Object.keys(prizes[0]));
          console.log('First prize amount type:', typeof prizes[0].amount);
          console.log('First prize amount:', prizes[0].amount);
          console.log('First prize amount toString():', prizes[0].amount.toString());
          
          // Check if amount is a BigNumber
          console.log('Is BigNumber?', ethers.BigNumber.isBigNumber(prizes[0].amount));
        }
        
        // Transform the way the backend should
        const transformedPrizes = prizes.map((prize, index) => ({
          id: index + 1,
          title: prize.title,
          amount: Number(prize.amount), // This could be the issue!
          position: Number(prize.position),
          description: `Prize for position ${index + 1}`
        }));
        
        console.log('Transformed prizes:', transformedPrizes);
        
      } catch (error) {
        console.log(`   ❌ Error fetching prizes for hackathon ${i}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testPrizeData();