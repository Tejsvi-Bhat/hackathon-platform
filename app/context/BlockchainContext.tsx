'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface BlockchainContextType {
  isBlockchainMode: boolean;
  isMounted: boolean;
  toggleBlockchainMode: () => void;
  walletAddress: string | null;
  balance: string;
  balanceInHC: string;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  contract: ethers.Contract | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111');

// HackerCoinPlatform ABI - only the functions we need
const CONTRACT_ABI = [
  "function createHackathon(string memory name, string memory description, address[] memory judges, tuple(string title, uint256 amount, uint256 position)[] memory prizes, uint256 registrationDeadline, uint256 startDate, uint256 endDate) payable returns (uint256)",
  "function addJudge(uint256 hackathonId, address judgeAddress) payable",
  "function submitProject(uint256 hackathonId, string memory name, string memory description, string memory githubUrl, string memory demoUrl) payable",
  "function distributePrizes(uint256 hackathonId, address[] memory winners, uint256[] memory amounts) external",
  "function getHackathon(uint256 hackathonId) view returns (string name, string description, address organizer, uint256 prizePoolWei, uint256 projectCount, uint256 judgeCount, bool active, uint256 registrationDeadline, uint256 startDate, uint256 endDate)",
  "function getPrizes(uint256 hackathonId) view returns (tuple(string title, uint256 amount, uint256 position)[])",
  "function getJudges(uint256 hackathonId) view returns (address[])",
  "function hackathonCount() view returns (uint256)",
  "function HACKATHON_CREATION_FEE() view returns (uint256)",
  "function JUDGE_BASE_FEE() view returns (uint256)",
  "function SUBMISSION_FEE() view returns (uint256)",
  "function weiToHackerCoins(uint256 weiAmount) pure returns (uint256)",
  "function hackerCoinsToWei(uint256 hackerCoins) pure returns (uint256)"
];

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [isBlockchainMode, setIsBlockchainMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [balanceInHC, setBalanceInHC] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Safe state setters that check for mounted state
  const setSafeProvider = (newProvider: ethers.providers.Web3Provider | null) => {
    if (isMounted) {
      setProvider(newProvider);
    }
  };

  const setSafeSigner = (newSigner: ethers.Signer | null) => {
    if (isMounted) {
      setSigner(newSigner);
    }
  };

  const setSafeContract = (newContract: ethers.Contract | null) => {
    if (isMounted) {
      setContract(newContract);
    }
  };

  // Load blockchain mode from localStorage after mount (avoid hydration mismatch)
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('blockchainMode');
    if (saved === 'true') {
      setIsBlockchainMode(true);
    }
    
    // Restore wallet connection if it exists in localStorage
    const savedWalletAddress = localStorage.getItem('walletAddress');
    if (savedWalletAddress && saved === 'true') {
      // Wait a bit for the component to stabilize before attempting reconnection
      setTimeout(async () => {
        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.includes(savedWalletAddress)) {
              console.log('Restoring wallet connection on page load');
              const success = await silentReconnect(savedWalletAddress);
              if (!success) {
                console.log('Silent reconnection failed, clearing stored address');
                localStorage.removeItem('walletAddress');
              }
            } else {
              console.log('Stored address not in connected accounts, clearing');
              localStorage.removeItem('walletAddress');
            }
          } catch (error) {
            console.error('Error checking accounts on page load:', error);
            localStorage.removeItem('walletAddress');
          }
        }
      }, 1000);
    }
  }, []);

  // Check if wallet was previously connected (but don't auto-connect)
  useEffect(() => {
    // Only run this check once on mount, don't react to blockchain mode changes
    if (!isMounted) return;
    
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum && isBlockchainMode) {
        try {
          // Only check if accounts are already connected, don't request connection
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            console.log('Found existing connection:', accounts[0]);
            // Only auto-reconnect if we have a stored wallet address that matches
            const storedAddress = localStorage.getItem('walletAddress');
            if (storedAddress && accounts.includes(storedAddress.toLowerCase())) {
              console.log('Auto-reconnecting to stored wallet silently');
              const success = await silentReconnect(storedAddress);
              if (!success) {
                console.log('Silent auto-reconnection failed');
                localStorage.removeItem('walletAddress');
              }
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    // Add a small delay to avoid conflicts with page navigation
    const timer = setTimeout(checkConnection, 500);
    return () => clearTimeout(timer);
  }, [isMounted, isBlockchainMode]); // Only depend on isMounted and isBlockchainMode

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum && walletAddress) {
      const handleAccountsChanged = async (accounts: string[]) => {
        console.log('Account change detected:', accounts, 'Current:', walletAddress);
        
        if (accounts.length === 0) {
          // User explicitly disconnected all accounts
          console.log('User disconnected all accounts');
          disconnectWallet();
        } else if (accounts[0] && accounts[0].toLowerCase() !== walletAddress.toLowerCase()) {
          // User switched to a different account
          console.log('Account switched from', walletAddress, 'to', accounts[0]);
          // Use silent reconnection for account switches
          const success = await silentReconnect(accounts[0]);
          if (!success) {
            console.log('Silent reconnection failed for new account, disconnecting');
            disconnectWallet();
          } else {
            // Update localStorage with new address
            localStorage.setItem('walletAddress', accounts[0].toLowerCase());
          }
        }
      };

      const handleChainChanged = (chainId: string) => {
        console.log('Chain changed to:', chainId, 'Expected:', `0x${CHAIN_ID.toString(16)}`);
        // Don't reload the page, just show a warning or handle gracefully
        const newChainId = parseInt(chainId, 16);
        if (newChainId !== CHAIN_ID) {
          console.warn('Wrong network detected. Please switch back to Sepolia.');
          // Could show a toast notification instead of reloading
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [walletAddress]); // Only depend on walletAddress

  const toggleBlockchainMode = () => {
    const newMode = !isBlockchainMode;
    setIsBlockchainMode(newMode);
    // Persist to localStorage
    localStorage.setItem('blockchainMode', newMode.toString());
    if (isBlockchainMode) {
      // Turning off blockchain mode
      disconnectWallet();
    }
  };

  const checkAndLoadUserInfo = async (address: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/blockchain-auth/verify/${address}`);
      const data = await response.json();
      
      if (!data.registered || !data.user) {
        // User not registered - do nothing, they'll see registration modal
        console.log('User not registered:', address);
      }
      // Note: We don't store anything in localStorage
      // Components will fetch user data directly from backend using wallet address
    } catch (error) {
      console.error('Error checking user registration:', error);
    }
  };

  const silentReconnect = async (address: string) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return false;
    }

    try {
      console.log('Attempting silent reconnection for:', address);
      
      // Create provider and signer without requesting accounts
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();

      // Check if the address is still connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts.includes(address)) {
        console.log('Address no longer connected');
        return false;
      }

      // Check network silently
      const network = await web3Provider.getNetwork();
      if (network.chainId !== CHAIN_ID) {
        console.log('Wrong network, cannot silent reconnect');
        return false;
      }

      // Get balance
      const bal = await web3Provider.getBalance(address);
      const ethBalance = ethers.utils.formatEther(bal);
      const hcBalance = (parseFloat(ethBalance) * 1000000).toFixed(0);

      // Create contract instance
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);

      setWalletAddress(address);
      setBalance(ethBalance);
      setBalanceInHC(hcBalance);
      setSafeProvider(web3Provider);
      setSafeSigner(web3Signer);
      setSafeContract(contractInstance);

      // Check if user is registered and load their info
      await checkAndLoadUserInfo(address);
      
      console.log('Silent reconnection successful');
      return true;
    } catch (error) {
      console.error('Silent reconnection failed:', error);
      return false;
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask to use blockchain features!');
      return;
    }

    setIsConnecting(true);
    try {
      // First, request wallet_requestPermissions to force account selection popup
      // This will always show the account selection UI in MetaMask
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (permError: any) {
        // If user cancels the permission request, stop here
        if (permError.code === 4001) {
          console.log('User cancelled account selection');
          setIsConnecting(false);
          return;
        }
        // For other errors, try to continue with regular connection
        console.warn('Permission request failed, trying regular connection:', permError);
      }
      
      // Now get the selected account
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const address = accounts[0];
      console.log('Connecting to account:', address);

      // Create provider and signer
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();

      // Check network
      const network = await web3Provider.getNetwork();
      if (network.chainId !== CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            alert('Please add Sepolia testnet to MetaMask');
          }
          throw switchError;
        }
      }

      // Get balance
      const bal = await web3Provider.getBalance(address);
      const ethBalance = ethers.utils.formatEther(bal);
      const hcBalance = (parseFloat(ethBalance) * 1000000).toFixed(0);

      // Create contract instance
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);

      setWalletAddress(address);
      setBalance(ethBalance);
      setBalanceInHC(hcBalance);
      setSafeProvider(web3Provider);
      setSafeSigner(web3Signer);
      setSafeContract(contractInstance);

      // Store wallet address in localStorage for persistence across navigation
      localStorage.setItem('walletAddress', address.toLowerCase());

      // Check if user is registered and load their info
      await checkAndLoadUserInfo(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    console.log('Disconnecting wallet...');
    setWalletAddress(null);
    setBalance('0');
    setBalanceInHC('0');
    setSafeProvider(null);
    setSafeSigner(null);
    setSafeContract(null);
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('blockchainUser');
    }
  };

  return (
    <BlockchainContext.Provider
      value={{
        isBlockchainMode,
        isMounted,
        toggleBlockchainMode,
        walletAddress,
        balance,
        balanceInHC,
        isConnecting,
        connectWallet,
        disconnectWallet,
        contract,
        provider,
        signer,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
