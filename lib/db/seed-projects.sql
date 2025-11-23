-- Additional projects for Web3 Innovation Summit (hackathon 1)
INSERT INTO projects (blockchain_project_id, hackathon_id, name, description, github_url, demo_url) VALUES
(4, 1, 'Web3 Social Network', 'A decentralized social media platform with token rewards', 'https://github.com/example/web3-social', 'https://demo.web3-social.com'),
(5, 1, 'NFT Marketplace', 'Buy, sell, and trade NFTs with low gas fees', 'https://github.com/example/nft-marketplace', 'https://demo.nft-marketplace.com'),
(6, 1, 'DAO Governance Tool', 'Simplified governance for DAOs', 'https://github.com/example/dao-governance', 'https://demo.dao-governance.com');

-- Additional projects for AI & Blockchain (hackathon 2)
INSERT INTO projects (blockchain_project_id, hackathon_id, name, description, github_url, demo_url) VALUES
(7, 2, 'Smart Contract Auditor AI', 'AI-powered smart contract security analysis', 'https://github.com/example/sc-auditor', 'https://demo.sc-auditor.com'),
(8, 2, 'Blockchain Data Analytics', 'AI-driven insights for blockchain transactions', 'https://github.com/example/chain-analytics', 'https://demo.chain-analytics.com');

-- Add team members for new projects
INSERT INTO project_members (project_id, user_id, member_address, role) VALUES
-- Project 4 (Web3 Social Network)
(4, 4, '0x4234567890123456789012345678901234567890', 'team lead'),
(4, 5, '0x5234567890123456789012345678901234567890', 'member'),
-- Project 5 (NFT Marketplace)
(5, 6, '0x6234567890123456789012345678901234567890', 'team lead'),
(5, 4, '0x4234567890123456789012345678901234567890', 'member'),
-- Project 6 (DAO Governance Tool)
(6, 5, '0x5234567890123456789012345678901234567890', 'team lead'),
-- Project 7 (Smart Contract Auditor AI)
(7, 6, '0x6234567890123456789012345678901234567890', 'team lead'),
(7, 5, '0x5234567890123456789012345678901234567890', 'member'),
-- Project 8 (Blockchain Data Analytics)
(8, 4, '0x4234567890123456789012345678901234567890', 'team lead'),
(8, 6, '0x6234567890123456789012345678901234567890', 'member');
