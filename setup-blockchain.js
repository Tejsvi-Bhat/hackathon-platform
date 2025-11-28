#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Hardhat blockchain and deploying contract with test data...\n');

// Start Hardhat node in background
console.log('📡 Starting Hardhat blockchain node...');
const hardhatNode = spawn('npx', ['hardhat', 'node'], {
  cwd: process.cwd(),
  stdio: 'pipe'
});

// Wait for node to start (look for "Started HTTP" in output)
let nodeReady = false;
hardhatNode.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Started HTTP and WebSocket JSON-RPC server at')) {
    nodeReady = true;
    console.log('✅ Hardhat node is ready!');
    
    // Deploy contract with test data
    setTimeout(() => {
      console.log('\n🏗️  Deploying contract with test data...');
      const deploy = spawn('npx', ['hardhat', 'run', 'scripts/deploy-with-test-data.js', '--network', 'localhost'], {
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      
      deploy.on('close', (code) => {
        if (code === 0) {
          console.log('\n🎉 Deployment completed successfully!');
          console.log('📋 Summary:');
          console.log('  • 3 hackathons created with organizer: 0x720f3a2cbdd2782481a9e93029ee11e753741935');
          console.log('  • Judge assigned: 0x135fdfddd225a7e4a75c4815aa4adf3b780e8e13');
          console.log('  • Test projects submitted by: 0xb8f43fd2025aebfbfdba5b754245777caca1d725');
          console.log('  • Contract deployment info saved to lib/contract-deployment.json');
          console.log('\n🔧 You can now restart your backend server to use the deployed contract!');
        } else {
          console.log('❌ Deployment failed with code:', code);
        }
      });
    }, 2000); // Wait 2 seconds for node to be fully ready
  }
});

hardhatNode.stderr.on('data', (data) => {
  const error = data.toString();
  if (error.includes('Error') || error.includes('error')) {
    console.error('Hardhat node error:', error);
  }
});

// Keep the node running
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Hardhat node...');
  hardhatNode.kill();
  process.exit();
});

console.log('⏳ Waiting for Hardhat node to start...');
console.log('   (This may take a few seconds)');
console.log('   Press Ctrl+C to stop');