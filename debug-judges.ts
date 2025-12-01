import { getJudgesFromChain, isJudgeOnChain } from './lib/blockchain.ts';

async function debugJudgeAuthorization() {
  try {
    const hackathonId = 2;
    const judgeWallet = "0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13";
    
    console.log(`🔍 Testing judge authorization for:`);
    console.log(`   Hackathon ID: ${hackathonId}`);
    console.log(`   Judge Wallet: ${judgeWallet}`);
    console.log('');
    
    // Method 1: Get all judges
    console.log(`📋 Fetching all judges for hackathon ${hackathonId}...`);
    const allJudges = await getJudgesFromChain(hackathonId);
    console.log(`📋 All judges:`, allJudges);
    console.log(`📋 Number of judges: ${allJudges.length}`);
    console.log('');
    
    // Method 2: Check each judge
    console.log(`🔍 Checking each judge address:`);
    allJudges.forEach((judge, index) => {
      console.log(`   Judge ${index}: ${judge.address || judge}`);
      console.log(`   Matches wallet: ${(judge.address || judge).toLowerCase() === judgeWallet.toLowerCase()}`);
    });
    console.log('');
    
    // Method 3: Direct isJudge check
    console.log(`🎯 Direct isJudge check...`);
    const isJudgeDirect = await isJudgeOnChain(hackathonId, judgeWallet);
    console.log(`🎯 Is judge (direct): ${isJudgeDirect}`);
    console.log('');
    
    // Method 4: Manual array check
    const isJudgeByArray = allJudges.some(judge => 
      (judge.address || judge).toLowerCase() === judgeWallet.toLowerCase()
    );
    console.log(`✅ Is judge (array check): ${isJudgeByArray}`);
    
    console.log('');
    console.log(`🎯 Final result: Judge should be ${isJudgeDirect || isJudgeByArray ? 'AUTHORIZED' : 'NOT AUTHORIZED'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugJudgeAuthorization();