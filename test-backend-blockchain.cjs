const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Server Environment Check:');
console.log('CONTRACT_ADDRESS from env NEXT_PUBLIC_CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
console.log('RPC_URL from env NEXT_PUBLIC_RPC_URL:', process.env.NEXT_PUBLIC_RPC_URL);
console.log('RPC_URL from env SEPOLIA_RPC_URL:', process.env.SEPOLIA_RPC_URL);
console.log('DATABASE_URL available:', !!process.env.DATABASE_URL);
console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);

// Test the blockchain initialization
const { initBlockchain, getHackathonsForJudge } = require('./lib/blockchain');

async function testBackendBlockchain() {
  console.log('\n🧪 Testing backend blockchain initialization...');
  
  try {
    await initBlockchain();
    
    // Test getting hackathons for judge
    const judgeAddress = '0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13';
    const hackathons = await getHackathonsForJudge(judgeAddress);
    
    console.log('✅ Judge hackathons from backend:', hackathons.length);
    hackathons.forEach((h, i) => {
      console.log(`   ${i + 1}. ${h.name} (ID: ${h.id}, Projects: ${h.projectCount})`);
    });
    
  } catch (error) {
    console.error('❌ Backend blockchain test failed:', error.message);
  }
}

testBackendBlockchain();