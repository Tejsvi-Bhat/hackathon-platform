const jwt = require('jsonwebtoken');

const judgePayload = {
  userId: 2,
  walletAddress: '0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13',
  role: 'judge',
  isBlockchainUser: true
};

const secret = 'your-super-secret-jwt-key-change-in-production';
const token = jwt.sign(judgePayload, secret, { expiresIn: '24h' });

console.log('🔑 Fresh JWT Token for Judge:');
console.log(token);
console.log('');
console.log('📋 To use in browser:');
console.log('1. Open Developer Tools (F12)');
console.log('2. Go to Application > Local Storage');
console.log('3. Set key: blockchainToken');
console.log('4. Set value:', token);
console.log('5. Refresh the page');
console.log('');
console.log('🧪 Test in PowerShell:');
console.log(`$token = '${token}'; Invoke-WebRequest -Uri "http://localhost:3001/api/users/me/judge-hackathons" -Headers @{ "Authorization" = "Bearer $token" } -Method GET`);