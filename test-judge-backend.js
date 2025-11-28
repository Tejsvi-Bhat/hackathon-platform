const API_URL = 'https://hackathon-platform-production-2055.up.railway.app';
const JUDGE_WALLET = '0x135fDfDDD225A7e4A75C4815aA4ADf3b780E8E13';

async function testJudgeHackathons() {
  try {
    console.log('🔍 Testing judge hackathons endpoint...');
    console.log('API URL:', API_URL);
    console.log('Judge Wallet:', JUDGE_WALLET);
    
    // Test blockchain user verification endpoint
    console.log('\n🧪 Testing blockchain user verification endpoint...');
    const verifyResponse = await fetch(`${API_URL}/api/blockchain-auth/verify/${JUDGE_WALLET}`);
    console.log('Verify Status:', verifyResponse.status);
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('Verify Response:', JSON.stringify(verifyData, null, 2));
      
      if (verifyData.registered) {
        console.log('✅ Judge wallet is registered in the backend');
      } else {
        console.log('❌ Judge wallet is NOT registered in the backend');
        console.log('💡 This means the judge wallet needs to be registered first');
      }
    } else {
      console.log('❌ Failed to verify judge wallet:', await verifyResponse.text());
    }
    
    // Test if the backend can communicate with blockchain
    console.log('\n🔗 Testing backend blockchain connectivity...');
    const hackathonsResponse = await fetch(`${API_URL}/api/hackathons?mode=blockchain`);
    console.log('Hackathons Status:', hackathonsResponse.status);
    if (hackathonsResponse.ok) {
      const hackathonsData = await hackathonsResponse.json();
      console.log('✅ Backend can fetch hackathons from blockchain');
      console.log(`Found ${hackathonsData.length} hackathons:`, hackathonsData.map(h => `${h.id}: ${h.name}`));
    } else {
      console.log('❌ Backend cannot fetch hackathons:', await hackathonsResponse.text());
    }
    
    // Test endpoint without authentication (should get 401)
    console.log('\n📡 Testing judge endpoint without authentication (should get 401)...');
    const noAuthResponse = await fetch(`${API_URL}/api/users/me/judge-hackathons`);
    console.log('Status:', noAuthResponse.status);
    const noAuthText = await noAuthResponse.text();
    console.log('Response:', noAuthText);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testJudgeHackathons();