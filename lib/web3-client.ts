// Client-side Web3 utilities for wallet interaction
import { ethers } from 'ethers';

// Network configurations
export const NETWORKS = {
  sepolia: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'], // Public Infura
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  },
  mumbai: {
    chainId: '0x13881', // 80001 in hex
    chainName: 'Polygon Mumbai',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com']
  }
};

// Get provider (read-only, no wallet needed)
export const getProvider = (network: 'sepolia' | 'mumbai' = 'sepolia') => {
  return new ethers.providers.JsonRpcProvider(NETWORKS[network].rpcUrls[0]);
};

// Get wallet balance (in ETH/MATIC)
export const getWalletBalance = async (
  address: string,
  network: 'sepolia' | 'mumbai' = 'sepolia'
): Promise<string> => {
  try {
    const provider = getProvider(network);
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    return '0';
  }
};

// Check if wallet has MetaMask
export const hasMetaMask = (): boolean => {
  return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
};

// Connect MetaMask wallet
export const connectWallet = async (): Promise<{ address: string; balance: string } | null> => {
  if (!hasMetaMask()) {
    alert('Please install MetaMask to connect your wallet');
    return null;
  }

  try {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    
    return {
      address,
      balance: ethers.utils.formatEther(balance)
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
};

// Switch to correct network
export const switchNetwork = async (network: 'sepolia' | 'mumbai' = 'sepolia') => {
  if (!hasMetaMask()) return false;

  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORKS[network].chainId }],
    });
    return true;
  } catch (error: any) {
    // Network not added, try to add it
    if (error.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORKS[network]],
        });
        return true;
      } catch (addError) {
        console.error('Error adding network:', addError);
        return false;
      }
    }
    return false;
  }
};

// Format balance for display
export const formatBalance = (balance: string, decimals: number = 4): string => {
  const num = parseFloat(balance);
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  return num.toFixed(decimals);
};

// Get token symbol for network
export const getNetworkSymbol = (network: 'sepolia' | 'mumbai' = 'sepolia'): string => {
  return NETWORKS[network].nativeCurrency.symbol;
};
