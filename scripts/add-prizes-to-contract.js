import { ethers } from 'ethers';
import { config } from 'dotenv';
config();

// Contract ABI with necessary functions
const HACKERCOIN_ABI = [
  "function hackathonCount() view returns (uint256)",
  "function getHackathon(uint256 hackathonId) view returns (string name, string description, address organizer, uint256 prizePoolWei, uint256 projectCount, uint256 judgeCount, bool active, uint256 registrationDeadline, uint256 startDate, uint256 endDate)",
  "function getPrizes(uint256 hackathonId) view returns (tuple(string title, uint256 amount, uint256 position)[])",
  "function createHackathon(string memory name, string memory description, address[] memory judgeAddresses, tuple(string title, uint256 amount, uint256 position)[] memory prizes, uint256 registrationDeadline, uint256 startDate, uint256 endDate) payable"
];

const CONTRACT_ADDRESS = "0x176D598796508296b0d514CbC775AD65977fc9Cc";
const RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/1ba97db50e5a4b12b378b340284b81c1";

async function addPrizesToContract() {
  try {
    console.log('🔗 Connecting to Sepolia...');
    
    // Connect to provider
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    // You'll need to provide a private key with ETH to create hackathons
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.log('❌ Please set PRIVATE_KEY in .env file');
      return;
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('👛 Using wallet:', wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Wallet balance:', ethers.utils.formatEther(balance), 'ETH');
    
    // Connect to contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, HACKERCOIN_ABI, wallet);
    
    // Check current hackathons
    const hackathonCount = await contract.hackathonCount();
    console.log('📊 Current hackathon count:', hackathonCount.toString());
    
    // Get existing hackathons and check their prizes
    for (let i = 1; i <= hackathonCount; i++) {
      const hackathon = await contract.getHackathon(i);
      const prizes = await contract.getPrizes(i);
      console.log(`📋 Hackathon ${i}: ${hackathon.name}`);
      console.log(`   Prizes: ${prizes.length}`);
      
      if (prizes.length === 0) {
        console.log(`   ⚠️ No prizes found for hackathon ${i}`);
        // Since we can't modify existing hackathons, we'll create new ones with prizes
      }
    }
    
    // Define judge addresses (you can modify these)
    const judgeAddresses = [
      "0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13", // existing judge
    ];
    
    // Define prize structure - 1 HC winner prize
    const prizes = [
      {
        title: "Winner Prize",
        amount: 1, // 1 HC
        position: 1
      }
    ];
    
    // Create hackathons with prizes
    const hackathonsToCreate = [
      {
        name: "DeFi Innovation Challenge with Prizes",
        description: "Build the next generation of DeFi protocols and earn rewards",
        registrationDeadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
        startDate: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now  
        endDate: Math.floor(Date.now() / 1000) + (37 * 24 * 60 * 60) // 37 days from now
      },
      {
        name: "NFT Marketplace Sprint with Prizes", 
        description: "Create innovative NFT marketplace solutions and win prizes",
        registrationDeadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        startDate: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        endDate: Math.floor(Date.now() / 1000) + (37 * 24 * 60 * 60)
      },
      {
        name: "Web3 Gaming Hackathon with Prizes",
        description: "Develop the future of blockchain gaming and earn rewards", 
        registrationDeadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        startDate: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        endDate: Math.floor(Date.now() / 1000) + (37 * 24 * 60 * 60)
      }
    ];
    
    // Calculate required payment
    const HACKATHON_CREATION_FEE = ethers.utils.parseEther("0.01"); // 0.01 ETH
    const JUDGE_BASE_FEE = ethers.utils.parseEther("0.001"); // 0.001 ETH per judge
    const HACKERCOIN = ethers.utils.parseEther("0.001"); // 1 HC = 0.001 ETH
    
    const totalPrizePoolWei = prizes.reduce((sum, prize) => sum.add(ethers.BigNumber.from(prize.amount).mul(HACKERCOIN)), ethers.BigNumber.from(0));
    const judgesFeeWei = ethers.BigNumber.from(judgeAddresses.length).mul(JUDGE_BASE_FEE);
    const requiredAmountWei = HACKATHON_CREATION_FEE.add(totalPrizePoolWei).add(judgesFeeWei);
    
    console.log('💰 Required payment per hackathon:');
    console.log('   Creation fee:', ethers.utils.formatEther(HACKATHON_CREATION_FEE), 'ETH');
    console.log('   Prize pool:', ethers.utils.formatEther(totalPrizePoolWei), 'ETH');  
    console.log('   Judges fee:', ethers.utils.formatEther(judgesFeeWei), 'ETH');
    console.log('   Total:', ethers.utils.formatEther(requiredAmountWei), 'ETH');
    
    // Create each hackathon
    for (const hackathonData of hackathonsToCreate) {
      console.log(`\n🚀 Creating hackathon: ${hackathonData.name}`);
      
      try {
        const tx = await contract.createHackathon(
          hackathonData.name,
          hackathonData.description,
          judgeAddresses,
          prizes,
          hackathonData.registrationDeadline,
          hackathonData.startDate,
          hackathonData.endDate,
          { value: requiredAmountWei }
        );
        
        console.log('📤 Transaction sent:', tx.hash);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log('✅ Hackathon created! Block:', receipt.blockNumber);
        
        // Get the new hackathon ID from events
        const newCount = await contract.hackathonCount();
        console.log('🆔 New hackathon ID:', newCount.toString());
        
      } catch (error) {
        console.error(`❌ Failed to create ${hackathonData.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Done! Check the new hackathons with prizes.');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
addPrizesToContract();