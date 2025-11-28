import { ethers } from 'ethers';

let provider: ethers.providers.JsonRpcProvider | null = null;
let contract: ethers.Contract | null = null;

// Contract ABI for the functions we need
const HACKERCOIN_ABI = [
  "function hackathonCount() view returns (uint256)",
  "function getHackathon(uint256 hackathonId) view returns (string name, string description, address organizer, uint256 prizePoolWei, uint256 projectCount, uint256 judgeCount, bool active, uint256 registrationDeadline, uint256 startDate, uint256 endDate)",
  "function getPrizes(uint256 hackathonId) view returns (tuple(string title, uint256 amount, uint256 position)[])",
  "function getProject(uint256 hackathonId, uint256 projectId) view returns (string name, string description, string githubUrl, string demoUrl, address participant, uint256 submissionTimestamp)",
  "function getJudges(uint256 hackathonId) view returns (address[])",
  "function isJudge(uint256 hackathonId, address judge) view returns (bool)",
  "function getHackathonsForJudge(address judgeAddress) view returns (uint256[])"
];

// Use deployed contract address from environment or fallback
let CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x176D598796508296b0d514CbC775AD65977fc9Cc";
console.log('🔍 Initial CONTRACT_ADDRESS from env/fallback:', CONTRACT_ADDRESS);
console.log('🔍 NEXT_PUBLIC_CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);

// Try to load from deployment file
try {
  const deployment = require('./contract-deployment.json');
  console.log('📁 Deployment file loaded:', JSON.stringify(deployment, null, 2));
  if (deployment.contractAddress) {
    CONTRACT_ADDRESS = deployment.contractAddress;
    console.log('✅ Loaded contract address from deployment:', CONTRACT_ADDRESS);
  }
} catch (error: any) {
  console.log('⚠️  No deployment file found, using default address:', error.message);
}

console.log('🎯 Final CONTRACT_ADDRESS that will be used:', CONTRACT_ADDRESS);

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545"; // Prefer frontend config, fallback to server config

export const initBlockchain = async () => {
  try {
    // Connect to Sepolia or local Hardhat node
    provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    // Create contract instance
    contract = new ethers.Contract(CONTRACT_ADDRESS, HACKERCOIN_ABI, provider);
    
    console.log('🔗 Blockchain initialized with contract:', CONTRACT_ADDRESS);
    console.log('🌐 RPC URL:', RPC_URL);
    
    // Test contract connection and log hackathon count
    try {
      const hackathonCount = await contract.hackathonCount();
      console.log('📊 Hackathon count from contract:', hackathonCount.toString());
      
      // Log first few hackathons for debugging
      for (let i = 1; i <= Math.min(3, hackathonCount.toNumber()); i++) {
        const hackathon = await contract.getHackathon(i);
        console.log(`📋 Hackathon ${i}: ${hackathon.name} (${hackathon.projectCount} projects)`);
      }
    } catch (testError: any) {
      console.error('❌ Contract test failed:', testError.message);
    }
    return { provider, contract };
  } catch (error) {
    console.error('Failed to initialize blockchain:', error);
    throw error;
  }
};

export const getContract = async () => {
  if (!contract) {
    await initBlockchain();
  }
  return contract!;
};

export const getProvider = () => provider;

// Helper functions for blockchain interactions
export const createHackathonOnChain = async (
  name: string,
  description: string,
  startDate: number,
  endDate: number
) => {
  const contract = await getContract();
  const tx = await contract.createHackathon(name, description, startDate, endDate);
  const receipt = await tx.wait();
  
  // Get hackathon ID from event
  const event = receipt.events?.find((e: any) => e.event === 'HackathonCreated');
  return event?.args?.id.toNumber();
};

export const addPrizeOnChain = async (
  hackathonId: number,
  title: string,
  description: string,
  amount: number,
  position: number
) => {
  const contract = await getContract();
  const tx = await contract.addPrize(
    hackathonId,
    title,
    description,
    ethers.utils.parseEther(amount.toString()),
    position
  );
  await tx.wait();
};

export const addScheduleOnChain = async (
  hackathonId: number,
  eventName: string,
  description: string,
  eventTime: number
) => {
  const contract = await getContract();
  const tx = await contract.addSchedule(hackathonId, eventName, description, eventTime);
  await tx.wait();
};

export const addJudgeOnChain = async (hackathonId: number, judgeAddress: string) => {
  const contract = await getContract();
  const tx = await contract.addJudge(hackathonId, judgeAddress);
  await tx.wait();
};

export const submitProjectOnChain = async (
  hackathonId: number,
  name: string,
  description: string,
  githubUrl: string,
  demoUrl: string,
  teamMembers: string[]
) => {
  const contract = await getContract();
  const tx = await contract.submitProject(
    hackathonId,
    name,
    description,
    githubUrl,
    demoUrl,
    teamMembers
  );
  const receipt = await tx.wait();
  
  const event = receipt.events?.find((e: any) => e.event === 'ProjectSubmitted');
  return event?.args?.projectId.toNumber();
};

export const scoreProjectOnChain = async (
  hackathonId: number,
  projectId: number,
  technicalScore: number,
  innovationScore: number,
  presentationScore: number,
  impactScore: number,
  feedback: string
) => {
  const contract = await getContract();
  const tx = await contract.scoreProject(
    hackathonId,
    projectId,
    technicalScore,
    innovationScore,
    presentationScore,
    impactScore,
    feedback
  );
  await tx.wait();
};

export const releaseScoresOnChain = async (hackathonId: number) => {
  const contract = await getContract();
  const tx = await contract.releaseScores(hackathonId);
  await tx.wait();
};

export const getHackathonFromChain = async (hackathonId: number) => {
  const contract = await getContract();
  return await contract.getHackathon(hackathonId);
};

export const getHackathonsForJudge = async (judgeAddress: string) => {
  const contract = await getContract();
  const hackathonIds = await contract.getHackathonsForJudge(judgeAddress);
  return hackathonIds.map((id: any) => id.toNumber());
};

export const getPrizesFromChain = async (hackathonId: number) => {
  const contract = await getContract();
  return await contract.getPrizes(hackathonId);
};

export const getProjectsFromChain = async (hackathonId: number) => {
  const contract = await getContract();
  const hackathon = await contract.getHackathon(hackathonId);
  const projectCount = Number(hackathon.projectCount);
  
  const projects = [];
  for (let i = 1; i <= projectCount; i++) {
    try {
      const project = await contract.getProject(hackathonId, i);
      projects.push({
        id: i,
        name: project.name,
        description: project.description,
        githubUrl: project.githubUrl,
        demoUrl: project.demoUrl,
        submitter: project.participant,
        submissionTimestamp: Number(project.submissionTimestamp)
      });
    } catch (error) {
      console.log(`Project ${i} not found for hackathon ${hackathonId}`);
    }
  }
  
  return projects;
};

export const getProjectScoresFromChain = async (hackathonId: number, projectId: number) => {
  const contract = await getContract();
  return await contract.getProjectScores(hackathonId, projectId);
};

export const getJudgesFromChain = async (hackathonId: number) => {
  const contract = await getContract();
  return await contract.getJudges(hackathonId);
};

export const getHackathonCountFromChain = async () => {
  const contract = await getContract();
  const count = await contract.hackathonCount();
  return count.toNumber();
};

export const isJudgeOnChain = async (hackathonId: number, judgeAddress: string) => {
  const contract = await getContract();
  return await contract.isJudge(hackathonId, judgeAddress);
};
