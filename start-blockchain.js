import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

console.log('Starting Hardhat blockchain...');
const hardhat = spawn('npx', ['hardhat', 'node'], { stdio: 'inherit', shell: true });

// Wait for Hardhat to start
await setTimeout(8000);

console.log('\nDeploying smart contracts...');
const deploy = spawn('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'localhost'], { 
  stdio: 'inherit', 
  shell: true 
});

await new Promise((resolve) => deploy.on('close', resolve));

console.log('\nBlockchain and contracts ready!');
