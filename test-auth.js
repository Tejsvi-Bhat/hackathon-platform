import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Create a token for the blockchain judge
const payload = {
  userId: 2,
  walletAddress: '0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13',
  role: 'judge',
  isBlockchainUser: true
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
console.log('Generated JWT Token:');
console.log(token);

// Verify the token works
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('\nDecoded token:');
  console.log(decoded);
} catch (error) {
  console.error('Token verification failed:', error);
}