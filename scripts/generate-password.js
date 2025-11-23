import bcrypt from 'bcryptjs';

async function generateHashes() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('Password: password123');
  console.log('Hash:', hash);
  console.log('\nUse this hash in the seed.sql file for all test users');
  console.log('Then you can login with: password123');
}

generateHashes();
