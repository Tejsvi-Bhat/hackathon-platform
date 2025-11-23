import { ethers } from 'ethers';

let provider: ethers.providers.JsonRpcProvider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;

export const initBlockchain = async () => {
  try {
    // Connect to local Hardhat node
    provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Get signer (first account from Hardhat)
    signer = provider.getSigner(0);
    
    // Load contract
    const contractData = await import('./contracts/HackathonPlatform.json');
    contract = new ethers.Contract(
      contractData.address,
      contractData.abi,
      signer
    );
    
    console.log('Blockchain initialized');
    return { provider, signer, contract };
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
export const getSigner = () => signer;

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

export const getPrizesFromChain = async (hackathonId: number) => {
  const contract = await getContract();
  return await contract.getPrizes(hackathonId);
};

export const getProjectsFromChain = async (hackathonId: number) => {
  const contract = await getContract();
  return await contract.getProjects(hackathonId);
};

export const getProjectScoresFromChain = async (hackathonId: number, projectId: number) => {
  const contract = await getContract();
  return await contract.getProjectScores(hackathonId, projectId);
};
