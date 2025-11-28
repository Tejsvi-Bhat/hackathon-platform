import { ethers } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const CONTRACT_ABI = [
  "function createHackathon(string memory name, string memory description, address[] memory judges, tuple(string title, uint256 amount, uint256 position)[] memory prizes, uint256 registrationDeadline, uint256 startDate, uint256 endDate) payable returns (uint256)",
  "function submitProject(uint256 hackathonId, string memory name, string memory description, string memory githubUrl, string memory demoUrl) payable",
  "function distributePrizes(uint256 hackathonId, address[] memory winners, uint256[] memory amounts) external",
  "function getHackathon(uint256 hackathonId) view returns (string name, string description, address organizer, uint256 prizePoolWei, uint256 projectCount, uint256 judgeCount, bool active, uint256 registrationDeadline, uint256 startDate, uint256 endDate)",
  "function getPrizes(uint256 hackathonId) view returns (tuple(string title, uint256 amount, uint256 position)[])",
  "function getProject(uint256 hackathonId, uint256 projectId) view returns (string name, string description, string githubUrl, string demoUrl, address participant, uint256 submissionTimestamp)",
  "function hackathonCount() view returns (uint256)",
  "function HACKATHON_CREATION_FEE() view returns (uint256)",
  "function JUDGE_BASE_FEE() view returns (uint256)",
  "function SUBMISSION_FEE() view returns (uint256)",
  "function weiToHackerCoins(uint256 weiAmount) pure returns (uint256)",
  "function hackerCoinsToWei(uint256 hackerCoins) pure returns (uint256)",
  "function getJudges(uint256 hackathonId) view returns (address[])"
];

export interface BlockchainHackathon {
  id: number;
  name: string;
  description: string;
  organizer: string;
  prizePoolWei: string;
  judges: string[];
  judgePoolBalance: string;
  organizerBalance: string;
  projectCount: number;
  active: boolean;
  registrationDeadline: number;
  startDate: number;
  endDate: number;
  prizes: Array<{title: string, amount: number, position: number}>;
  // Additional computed fields
  prizePoolHC: string;
  totalProjects: number;
  status: 'active' | 'completed';
}

export interface BlockchainProject {
  id: number;
  hackathonId: number;
  name: string;
  description: string;
  githubUrl: string;
  demoUrl: string;
  participant: string;
  timestamp: number;
  submittedAt: string;
}

export async function getProvider() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not found');
  }
  return new ethers.providers.Web3Provider(window.ethereum);
}

export async function getContract() {
  const provider = await getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

export async function getContractWithSigner() {
  const provider = await getProvider();
  const signer = provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export async function fetchAllHackathons(): Promise<BlockchainHackathon[]> {
  try {
    const contract = await getContract();
    
    // Check if contract is deployed by trying to call a view function
    try {
      const totalHackathons = await contract.hackathonCount();
      const count = totalHackathons.toNumber();

      const hackathons: BlockchainHackathon[] = [];

      // Fetch all hackathons (starting from ID 1)
      for (let i = 1; i <= count; i++) {
        try {
          const data = await contract.getHackathon(i);

          // New contract returns: (name, description, organizer, prizePoolWei, projectCount, judgeCount, active, registrationDeadline, startDate, endDate)
          const prizePoolWei = data.prizePoolWei.toString();
          // Convert Wei to HC (1 HC = 1,000,000 wei)
          const HACKERCOIN = 1_000_000;
          const prizePoolHC = (parseInt(prizePoolWei) / HACKERCOIN).toString();
          
          // Get judges separately
          const judges = await contract.getJudges(i);
          
          // Get prizes
          const prizesData = await contract.getPrizes(i);
          const prizes = prizesData.map((p: any) => ({
            title: p.title,
            amount: p.amount.toNumber(),
            position: p.position.toNumber()
          }));
          
          hackathons.push({
            id: i,
            name: data.name,
            description: data.description,
            organizer: data.organizer,
            prizePoolWei: prizePoolWei,
            judges: judges,
            judgePoolBalance: '0', // Not directly accessible in new contract
            organizerBalance: '0', // Not directly accessible in new contract
            projectCount: data.projectCount.toNumber(),
            active: data.active,
            registrationDeadline: data.registrationDeadline.toNumber(),
            startDate: data.startDate.toNumber(),
            endDate: data.endDate.toNumber(),
            prizes: prizes,
            prizePoolHC: prizePoolHC,
            totalProjects: data.projectCount.toNumber(),
            status: data.active ? 'active' : 'completed',
          });
        } catch (err) {
          console.error(`Error fetching hackathon ${i}:`, err);
          // Skip hackathons that don't exist or have errors
        }
      }

      return hackathons.reverse(); // Show newest first
    } catch (contractError: any) {
      // Contract not deployed or ABI mismatch
      if (contractError.code === 'CALL_EXCEPTION') {
        console.warn('Contract not yet deployed or no hackathons created yet');
        return [];
      }
      throw contractError;
    }
  } catch (error) {
    console.error('Error fetching hackathons from blockchain:', error);
    return [];
  }
}

export async function fetchHackathonById(id: number): Promise<BlockchainHackathon | null> {
  try {
    const contract = await getContract();
    const data = await contract.getHackathon(id);

    const prizePoolWei = data.prizePoolWei.toString();
    // Convert Wei to HC (1 HC = 1,000,000 wei)
    const HACKERCOIN = 1_000_000;
    const prizePoolHC = (parseInt(prizePoolWei) / HACKERCOIN).toString();
    
    console.log('Fetched hackathon:', {
      id,
      prizePoolWei,
      prizePoolHC,
      name: data.name
    });
    
    // Get judges separately
    const judges = await contract.getJudges(id);
    
    // Get prizes
    const prizesData = await contract.getPrizes(id);
    const prizes = prizesData.map((p: any) => ({
      title: p.title,
      amount: p.amount.toNumber(),
      position: p.position.toNumber()
    }));

    return {
      id: id,
      name: data.name,
      description: data.description,
      organizer: data.organizer,
      prizePoolWei: prizePoolWei,
      judges: judges,
      judgePoolBalance: '0',
      organizerBalance: '0',
      projectCount: data.projectCount.toNumber(),
      active: data.active,
      registrationDeadline: data.registrationDeadline.toNumber(),
      startDate: data.startDate.toNumber(),
      endDate: data.endDate.toNumber(),
      prizes: prizes,
      prizePoolHC: prizePoolHC,
      totalProjects: data.projectCount.toNumber(),
      status: data.active ? 'active' : 'completed',
    };
  } catch (error) {
    console.error('Error fetching hackathon:', error);
    return null;
  }
}

export async function fetchProjectsForHackathon(hackathonId: number): Promise<BlockchainProject[]> {
  try {
    const contract = await getContract();
    const hackathon = await contract.getHackathon(hackathonId);
    const projectCount = hackathon.projectCount.toNumber();

    const projects: BlockchainProject[] = [];

    for (let i = 1; i <= projectCount; i++) {
      try {
        const data = await contract.getProject(hackathonId, i);
        
        // New contract returns: (name, description, githubUrl, demoUrl, participant, submissionTimestamp)
        projects.push({
          id: i,
          hackathonId: hackathonId,
          name: data.name,
          description: data.description,
          githubUrl: data.githubUrl,
          demoUrl: data.demoUrl,
          participant: data.participant,
          timestamp: data.submissionTimestamp.toNumber(),
          submittedAt: new Date(data.submissionTimestamp.toNumber() * 1000).toISOString(),
        });
      } catch (err) {
        console.error(`Error fetching project ${i}:`, err);
      }
    }

    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getContractFees() {
  try {
    const contract = await getContract();
    
    const creationFee = await contract.HACKATHON_CREATION_FEE();
    const judgeFee = await contract.JUDGE_BASE_FEE();
    const submissionFee = await contract.SUBMISSION_FEE();

    return {
      creationFeeWei: creationFee.toString(),
      creationFeeHC: (parseFloat(ethers.utils.formatEther(creationFee)) * 1000000).toFixed(0),
      judgeFeeWei: judgeFee.toString(),
      judgeFeeHC: (parseFloat(ethers.utils.formatEther(judgeFee)) * 1000000).toFixed(0),
      submissionFeeWei: submissionFee.toString(),
      submissionFeeHC: (parseFloat(ethers.utils.formatEther(submissionFee)) * 1000000).toFixed(0),
    };
  } catch (error) {
    console.error('Error fetching contract fees:', error);
    return {
      creationFeeWei: '0',
      creationFeeHC: '100',
      judgeFeeWei: '0',
      judgeFeeHC: '5',
      submissionFeeWei: '0',
      submissionFeeHC: '1',
    };
  }
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function weiToHC(weiAmount: string): string {
  return (parseFloat(ethers.utils.formatEther(weiAmount)) * 1000000).toFixed(0);
}

export function hcToWei(hc: string): string {
  return ethers.utils.parseEther((parseFloat(hc) / 1000000).toString()).toString();
}
