import { ethers } from 'ethers';
import pkg from 'pg';
const { Client } = pkg;

// Contract configuration
const CONTRACT_ADDRESS = '0x176D598796508296b0d514CbC775AD65977fc9Cc';
const RPC_URL = 'https://sepolia.infura.io/v3/1ba97db50e5a4b12b378b340284b81c1';

const CONTRACT_ABI = [
  "function hackathonCount() view returns (uint256)",
  "function getHackathon(uint256 hackathonId) view returns (string name, string description, address organizer, uint256 prizePoolWei, uint256 projectCount, uint256 judgeCount, bool active, uint256 registrationDeadline, uint256 startDate, uint256 endDate)",
  "function getPrizes(uint256 hackathonId) view returns (tuple(string title, uint256 amount, uint256 position)[])",
  "function getProject(uint256 hackathonId, uint256 projectId) view returns (string name, string description, string githubUrl, string demoUrl, address participant, uint256 submissionTimestamp)",
  "function getJudges(uint256 hackathonId) view returns (address[])",
  "function isJudge(uint256 hackathonId, address judge) view returns (bool)",
  "function getHackathonsForJudge(address judgeAddress) view returns (uint256[])"
];

// Database connection
const client = new Client({
  connectionString: 'postgresql://postgres.itcrmiztwztrldvodmjt:postgres@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'
});

async function fetchContractData() {
  try {
    console.log('Connecting to blockchain...');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Get hackathon count
    const hackathonCount = await contract.hackathonCount();
    console.log(`Found ${hackathonCount.toString()} hackathons in contract`);

    const hackathons = [];
    const projects = [];

    // Fetch all hackathons and their projects (hackathons are 1-indexed)
    for (let i = 1; i <= hackathonCount; i++) {
      try {
        const hackathon = await contract.getHackathon(i);
        const hackathonData = {
          blockchain_id: i,
          name: hackathon.name,
          description: hackathon.description,
          organizer: hackathon.organizer,
          start_date: new Date(Number(hackathon.startDate) * 1000).toISOString(),
          end_date: new Date(Number(hackathon.endDate) * 1000).toISOString(),
          registration_deadline: new Date(Number(hackathon.registrationDeadline) * 1000).toISOString(),
          prize_pool: Math.floor(Number(hackathon.prizePoolWei) / 1000000), // Convert wei to readable units
          is_active: hackathon.active,
          project_count: Number(hackathon.projectCount)
        };
        hackathons.push(hackathonData);
        console.log(`Fetched hackathon ${i}: ${hackathon.name} (${hackathon.projectCount} projects)`);

        // Fetch all projects for this hackathon (projects are 1-indexed)
        for (let j = 1; j <= hackathon.projectCount; j++) {
          try {
            const project = await contract.getProject(i, j);
            const projectData = {
              blockchain_project_id: `${i}-${j}`, // Unique identifier
              name: project.name,
              description: project.description,
              github_url: project.githubUrl,
              demo_url: project.demoUrl,
              participant_address: project.participant,
              hackathon_blockchain_id: i,
              submission_timestamp: new Date(Number(project.submissionTimestamp) * 1000).toISOString()
            };
            projects.push(projectData);
            console.log(`  - Project ${j}: ${project.name} by ${project.participant}`);
          } catch (error) {
            console.error(`Error fetching project ${j} from hackathon ${i}:`, error.message);
          }
        }
      } catch (error) {
        console.error(`Error fetching hackathon ${i}:`, error.message);
      }
    }

    return { hackathons, projects };
  } catch (error) {
    console.error('Error fetching contract data:', error);
    throw error;
  }
}

async function syncToDatabase(hackathons, projects) {
  try {
    console.log('\nConnecting to database...');
    await client.connect();

    // Insert hackathons
    console.log('\nInserting hackathons into database...');
    for (const hackathon of hackathons) {
      const query = `
        INSERT INTO hackathons (
          blockchain_id, name, description, start_date, end_date, registration_deadline,
          total_prize_pool, is_active, mode, organizer_address, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (blockchain_id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          registration_deadline = EXCLUDED.registration_deadline,
          total_prize_pool = EXCLUDED.total_prize_pool,
          is_active = EXCLUDED.is_active
        RETURNING id;
      `;
      
      const values = [
        hackathon.blockchain_id,
        hackathon.name,
        hackathon.description,
        hackathon.start_date,
        hackathon.end_date,
        hackathon.registration_deadline,
        hackathon.prize_pool,
        hackathon.is_active,
        'blockchain',
        hackathon.organizer,
        new Date().toISOString()
      ];

      const result = await client.query(query, values);
      console.log(`✓ Inserted/Updated hackathon: ${hackathon.name} (DB ID: ${result.rows[0].id})`);
    }

    // Get hackathon ID mapping (blockchain_id -> db_id)
    const hackathonMapping = {};
    const hackathonQuery = 'SELECT id, blockchain_id FROM hackathons WHERE blockchain_id IS NOT NULL';
    const hackathonResult = await client.query(hackathonQuery);
    hackathonResult.rows.forEach(row => {
      hackathonMapping[row.blockchain_id] = row.id;
    });

    // Insert projects
    console.log('\nInserting projects into database...');
    for (const project of projects) {
      const hackathonDbId = hackathonMapping[project.hackathon_blockchain_id];
      if (!hackathonDbId) {
        console.error(`No database hackathon found for blockchain ID ${project.hackathon_blockchain_id}`);
        continue;
      }

      const projectQuery = `
        INSERT INTO projects (
          blockchain_project_id, hackathon_id, name, description, 
          github_url, demo_url, submitted_at, is_public
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (blockchain_project_id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          hackathon_id = EXCLUDED.hackathon_id
        RETURNING id;
      `;

      const projectValues = [
        project.blockchain_project_id,
        hackathonDbId,
        project.name,
        project.description,
        project.github_url || `https://github.com/participant/${project.name.toLowerCase().replace(/\s+/g, '-')}`,
        project.demo_url || `https://${project.name.toLowerCase().replace(/\s+/g, '-')}-demo.vercel.app`,
        project.submission_timestamp,
        true
      ];

      const projectResult = await client.query(projectQuery, projectValues);
      const projectDbId = projectResult.rows[0].id;
      console.log(`✓ Inserted/Updated project: ${project.name} (DB ID: ${projectDbId})`);

      // Insert project member
      const memberQuery = `
        INSERT INTO project_members (
          project_id, member_address, role, joined_at
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (project_id, member_address) DO NOTHING;
      `;

      const memberValues = [
        projectDbId,
        project.participant_address,
        'creator',
        new Date().toISOString()
      ];

      await client.query(memberQuery, memberValues);
      console.log(`✓ Added member ${project.participant_address} to project ${project.name}`);
    }

    console.log('\n✅ Contract data successfully synced to database!');

  } catch (error) {
    console.error('Database sync error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    console.log('🚀 Starting contract data sync...\n');
    
    const { hackathons, projects } = await fetchContractData();
    await syncToDatabase(hackathons, projects);
    
    console.log('\n🎉 Sync completed successfully!');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

main();