import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x176D598796508296b0d514CbC775AD65977fc9Cc";
const RPC_URL = "https://sepolia.infura.io/v3/1ba97db50e5a4b12b378b340284b81c1";

const ABI = [
  "function hackathonCount() view returns (uint256)",
  "function getHackathon(uint256 hackathonId) view returns (string name, string description, address organizer, uint256 prizePoolWei, uint256 projectCount, uint256 judgeCount, bool active, uint256 registrationDeadline, uint256 startDate, uint256 endDate)",
  "function getProject(uint256 hackathonId, uint256 projectId) view returns (string name, string description, string githubUrl, string demoUrl, address participant, uint256 submissionTimestamp)"
];

async function checkContractProjects() {
  try {
    console.log('🔍 Checking smart contract projects...');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const hackathonCount = await contract.hackathonCount();
    console.log(`📊 Total hackathons: ${hackathonCount}`);

    for (let hackathonId = 1; hackathonId <= hackathonCount; hackathonId++) {
      console.log(`\n🏆 Hackathon ${hackathonId}:`);
      
      try {
        const hackathon = await contract.getHackathon(hackathonId);
        console.log(`   Name: ${hackathon.name}`);
        console.log(`   Project Count: ${hackathon.projectCount}`);
        
        const projectCount = hackathon.projectCount.toNumber();
        
        if (projectCount > 0) {
          console.log(`   📋 Projects in this hackathon:`);
          
          for (let projectId = 1; projectId <= projectCount; projectId++) {
            try {
              const project = await contract.getProject(hackathonId, projectId);
              console.log(`      Project ${projectId}:`);
              console.log(`         Name: ${project.name}`);
              console.log(`         Description: ${project.description}`);
              console.log(`         Participant: ${project.participant}`);
              console.log(`         GitHub: ${project.githubUrl}`);
              console.log(`         Demo: ${project.demoUrl}`);
              console.log(`         Timestamp: ${project.submissionTimestamp.toString()}`);
            } catch (error) {
              console.log(`      ❌ Project ${projectId} not found`);
            }
          }
        } else {
          console.log(`   📋 No projects in this hackathon`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error fetching hackathon ${hackathonId}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

checkContractProjects();