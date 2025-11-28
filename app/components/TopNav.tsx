'use client';

import { Search, Bell, User, LogOut, Wallet, Copy, Check, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal from './LoginModal';
import WalletAuthModal from './WalletAuthModal';
import ConfirmDialog from './ConfirmDialog';
import { getWalletBalance, formatBalance, getNetworkSymbol } from '@/lib/web3-client';
import { useBlockchain } from '@/app/context/BlockchainContext';

interface TopNavProps {
  onOpenLogin?: () => void;
  showLoginModal?: boolean;
  onCloseLoginModal?: () => void;
  initialLoginMode?: 'login' | 'register';
}

export default function TopNav({ onOpenLogin, showLoginModal: externalShowModal, onCloseLoginModal, initialLoginMode = 'login' }: TopNavProps) {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [internalShowModal, setInternalShowModal] = useState(false);
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(initialLoginMode);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [network] = useState<'sepolia' | 'mumbai'>('sepolia');
  const router = useRouter();
  
  // Blockchain context
  const { isBlockchainMode, walletAddress, balanceInHC, balance, isConnecting, connectWallet, disconnectWallet } = useBlockchain();
  
  const showLoginModal = externalShowModal !== undefined ? externalShowModal : internalShowModal;
  const setShowLoginModal = onCloseLoginModal
    ? (value: boolean) => { if (!value) onCloseLoginModal(); }
    : setInternalShowModal;

  useEffect(() => {
    if (isBlockchainMode) {
      // In blockchain mode, fetch user from backend based on wallet
      if (walletAddress) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        fetch(`${apiUrl}/api/blockchain-auth/verify/${walletAddress}`)
          .then(res => res.json())
          .then(data => {
            if (data.registered && data.user) {
              setUser(data.user);
            } else {
              setUser(null);
            }
          })
          .catch(() => setUser(null));
      } else {
        setUser(null);
      }
    } else {
      // In database mode, check for token auth
      const token = localStorage.getItem('token');
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        fetch(`${apiUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            setUser(data);
            if (data.wallet_address) {
              fetchWalletBalance(data.wallet_address);
            }
          })
          .catch(() => localStorage.removeItem('token'));
      } else {
        setUser(null);
      }
    }
  }, [isBlockchainMode, walletAddress]);

  const fetchWalletBalance = async (address: string) => {
    try {
      setLoadingBalance(true);
      const balance = await getWalletBalance(address, network);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setWalletBalance('0');
    } finally {
      setLoadingBalance(false);
    }
  };

  const refreshBalance = () => {
    if (user?.wallet_address) {
      fetchWalletBalance(user.wallet_address);
    }
  };

  const handleLogout = () => {
    if (isBlockchainMode) {
      // In blockchain mode, just disconnect wallet
      localStorage.removeItem('blockchainToken');
      disconnectWallet();
    } else {
      localStorage.removeItem('token');
    }
    setUser(null);
    setShowLogoutConfirm(false);
    router.push('/');
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const copyWalletAddress = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLoginSuccess = () => {
    // Refresh user data after login
    if (isBlockchainMode) {
      const walletAuth = localStorage.getItem('blockchainUser');
      if (walletAuth) {
        setUser(JSON.parse(walletAuth));
      }
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        fetch(`${apiUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => setUser(data))
          .catch(() => localStorage.removeItem('token'));
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
      <div className="px-6 py-4 flex items-center justify-between gap-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search hackathons, projects, or communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Blockchain Mode Wallet Display */}
          {isBlockchainMode && (
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/50 rounded-lg">
              {walletAddress ? (
                <>
                  {/* User Info */}
                  {user && (
                    <div className="flex flex-col border-r border-blue-500/30 pr-3">
                      <span className="text-xs text-gray-400">User</span>
                      <span className="text-sm font-semibold text-white">
                        {user.full_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-blue-300 capitalize">
                        {user.role}
                      </span>
                    </div>
                  )}
                  
                  {/* Balance */}
                  <Wallet className="w-5 h-5 text-blue-400" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Balance</span>
                    <span className="text-sm font-semibold text-white">
                      {balanceInHC} HC
                    </span>
                  </div>
                  
                  {/* Wallet Address */}
                  <div className="ml-2 border-l border-blue-500/30 pl-3">
                    <span className="text-xs text-gray-400">Wallet</span>
                    <div className="flex items-center gap-1">
                      <code className="text-sm font-mono text-blue-300">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(walletAddress);
                          setCopiedWallet(true);
                          setTimeout(() => setCopiedWallet(false), 2000);
                        }}
                        className="p-1 hover:bg-blue-800/50 rounded transition"
                      >
                        {copiedWallet ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wallet className="w-4 h-4" />
                  {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                </button>
              )}
            </div>
          )}

          {user ? (
            <>
              {/* Only show duplicate wallet info if NOT in blockchain mode */}
              {!isBlockchainMode && user.wallet_address && (
                <div className="hidden md:flex items-center gap-2">
                  {/* Balance Display */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 rounded-lg">
                    <Wallet className="w-4 h-4 text-blue-400" />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">Balance</span>
                      <span className="text-sm font-semibold text-white">
                        {loadingBalance ? '...' : `${formatBalance(walletBalance)} ${getNetworkSymbol(network)}`}
                      </span>
                    </div>
                    <button
                      onClick={refreshBalance}
                      className={`ml-1 p-1 hover:bg-blue-800/50 rounded transition ${loadingBalance ? 'animate-spin' : ''}`}
                      title="Refresh balance"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                  </div>
                  
                  {/* Wallet Address */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg">
                    <span className="text-sm font-mono text-gray-300">
                      {truncateAddress(user.wallet_address)}
                    </span>
                    <button
                      onClick={copyWalletAddress}
                      className="p-1 hover:bg-gray-700 rounded transition"
                      title="Copy wallet address"
                    >
                      {copiedWallet ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  <a
                    href="https://sepoliafaucet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5"
                    title="Get test ETH"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Faucet
                  </a>
                </div>
              )}

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-white">{user.full_name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {/* Wallet Info in Dropdown */}
                  {user.wallet_address && (
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">Wallet Address</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Wallet className="w-3.5 h-3.5 text-blue-400" />
                        <code className="text-xs font-mono text-gray-300 flex-1">
                          {truncateAddress(user.wallet_address)}
                        </code>
                        <button
                          onClick={copyWalletAddress}
                          className="p-1 hover:bg-gray-700 rounded transition"
                        >
                          {copiedWallet ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="https://sepoliafaucet.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition text-center"
                        >
                          Sepolia Faucet
                        </a>
                        <a
                          href="https://faucet.polygon.technology"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition text-center"
                        >
                          Mumbai Faucet
                        </a>
                      </div>
                    </div>
                  )}
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition"
                  >
                    Profile Settings
                  </Link>
                  {isBlockchainMode && (
                    <button
                      onClick={() => {
                        // Disconnect and reconnect to show account selection
                        disconnectWallet();
                        setTimeout(() => {
                          connectWallet();
                        }, 100);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      Switch Account
                    </button>
                  )}
                  <button
                    onClick={confirmLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (onOpenLogin) {
                    onOpenLogin();
                  } else {
                    setInternalShowModal(true);
                  }
                  setCurrentMode('login');
                }}
                className="px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-medium border border-gray-700"
              >
                Login
              </button>
              <button
                onClick={() => {
                  if (onOpenLogin) {
                    onOpenLogin();
                  } else {
                    setInternalShowModal(true);
                  }
                  setCurrentMode('register');
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {isBlockchainMode ? (
        <WalletAuthModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onAuthSuccess={handleLoginSuccess}
        />
      ) : (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
          initialMode={currentMode}
        />
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </header>
  );
}
