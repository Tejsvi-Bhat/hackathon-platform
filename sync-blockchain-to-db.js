import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Database connection
const supabaseUrl = 'https://itcrmiztwztrldvodmjt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0Y3JtaXp0d3p0cmxkdm9kbWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MjY5NDYsImV4cCI6MjA0ODMwMjk0Nn0.MQ7cgvHqEBJuaG7NlHZW2yLyJyoJ5_r0UFVL8_OgVVQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Blockchain data from contract
const blockchainData = {
  hackathons: [
    {
      id: 1,
      name: "DeFi Innovation Challenge",
      description: "A hackathon focused on decentralized finance innovations",
      start_date: "2024-01-15T00:00:00Z",
      end_date: "2024-01-22T23:59:59Z",
      registration_deadline: "2024-01-14T23:59:59Z",
      max_participants: 100,
      prize_pool: 10000,
      status: "completed"
    },
    {
      id: 2,
      name: "Gaming & NFT Showcase",
      description: "A hackathon for gaming applications and NFT platforms",
      start_date: "2024-02-01T00:00:00Z",
      end_date: "2024-02-08T23:59:59Z",
      registration_deadline: "2024-01-31T23:59:59Z",
      max_participants: 80,
      prize_pool: 8000,
      status: "completed"
    },
    {
      id: 3,
      name: "Marketplace & Trading Platform",
      description: "A hackathon for building trading and marketplace applications",
      start_date: "2024-03-01T00:00:00Z",
      end_date: "2024-03-08T23:59:59Z",
      registration_deadline: "2024-02-28T23:59:59Z",
      max_participants: 120,
      prize_pool: 12000,
      status: "completed"
    }
  ],
  projects: [
    {
      name: "DeFiLend Protocol",
      description: "A decentralized lending protocol with innovative collateral mechanisms",
      hackathon_id: 1,
      github_url: "https://github.com/participant/defilend-protocol",
      demo_url: "https://defilend-demo.vercel.app",
      member_address: "0xb8F43fD2025aEbFbFdba5b754245777CACa1d725"
    },
    {
      name: "YieldFarm Pro",
      description: "Advanced yield farming platform with auto-compounding features",
      hackathon_id: 1,
      github_url: "https://github.com/participant/yieldfarm-pro",
      demo_url: "https://yieldfarm-demo.vercel.app",
      member_address: "0xb8F43fD2025aEbFbFdba5b754245777CACa1d725"
    },
    {
      name: "MetaMarket",
      description: "Decentralized NFT marketplace with cross-chain support",
      hackathon_id: 2,
      github_url: "https://github.com/participant/metamarkets",
      demo_url: "https://metamarkets-demo.vercel.app",
      member_address: "0xb8F43fD2025aEbFbFdba5b754245777CACa1d725"
    },
    {
      name: "CryptoQuest",
      description: "Blockchain-based RPG game with NFT characters and items",
      hackathon_id: 3,
      github_url: "https://github.com/participant/cryptoquest",
      demo_url: "https://cryptoquest-demo.vercel.app",
      member_address: "0xb8F43fD2025aEbFbFdba5b754245777CACa1d725"
    }
  ]
};

async function syncBlockchainToDatabase() {
  try {
    console.log('Starting sync of blockchain data to database...');

    // Insert hackathons
    console.log('Inserting hackathons...');
    for (const hackathon of blockchainData.hackathons) {
      const { data, error } = await supabase
        .from('hackathons')
        .upsert(hackathon, { onConflict: 'id' });
      
      if (error) {
        console.error(`Error inserting hackathon ${hackathon.id}:`, error);
      } else {
        console.log(`✓ Inserted hackathon: ${hackathon.name} (ID: ${hackathon.id})`);
      }
    }

    // Insert projects
    console.log('\nInserting projects...');
    for (const project of blockchainData.projects) {
      // Insert project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: project.name,
          description: project.description,
          hackathon_id: project.hackathon_id,
          github_url: project.github_url,
          demo_url: project.demo_url,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (projectError) {
        console.error(`Error inserting project ${project.name}:`, projectError);
        continue;
      }

      console.log(`✓ Inserted project: ${project.name} (ID: ${projectData.id})`);

      // Insert project member (blockchain participant)
      const { data: memberData, error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectData.id,
          member_address: project.member_address,
          role: 'creator',
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        console.error(`Error inserting project member for ${project.name}:`, memberError);
      } else {
        console.log(`✓ Added member ${project.member_address} to project ${project.name}`);
      }
    }

    console.log('\n✅ Blockchain data sync completed successfully!');

  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Run the sync
syncBlockchainToDatabase();