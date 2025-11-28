'use client';

import { useState, useEffect } from 'react';
import { Wallet, CheckCircle, XCircle, RefreshCw, Zap, Award, Users, Code } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { getWalletBalance, connectWallet, formatBalance, hasMetaMask, switchNetwork } from '@/lib/web3-client';

export default function BlockchainDemo() {
  const [step, setStep] = useState(1);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [networkSwitched, setNetworkSwitched] = useState(false);

  useEffect(() => {
    // Check if user already has wallet in system
    const user = localStorage.getItem('token');
    if (user) {
      // Check balance of registered wallet
      fetchBalance();
    }
  }, []);

  const fetchBalance = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const res = await fetch(`${apiUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.wallet_address) {
          setWalletAddress(data.wallet_address);
          const balance = await getWalletBalance(data.wallet_address, 'sepolia');
          setWalletBalance(balance);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  const handleConnectWallet = async () => {
    if (!hasMetaMask()) {
      alert('Please install MetaMask extension to continue!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setLoading(true);
    try {
      const result = await connectWallet();
      if (result) {
        setWalletAddress(result.address);
        setWalletBalance(result.balance);
        setWalletConnected(true);
        setStep(2);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchNetwork = async () => {
    setLoading(true);
    try {
      const switched = await switchNetwork('sepolia');
      if (switched) {
        setNetworkSwitched(true);
        setStep(3);
        // Refresh balance
        if (walletAddress) {
          const balance = await getWalletBalance(walletAddress, 'sepolia');
          setWalletBalance(balance);
        }
      } else {
        alert('Failed to switch network. Please switch manually in MetaMask.');
      }
    } catch (error) {
      console.error('Error switching network:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="ml-64 flex-1">
        <TopNav />
        <main className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Blockchain Integration Demo
            </h1>
            <p className="text-gray-400">
              See how your wallet and smart contracts work together in this platform
            </p>
          </div>

          {/* Current Wallet Info */}
          {walletAddress && (
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-400" />
                    Your Connected Wallet
                  </h3>
                  <p className="text-gray-300 font-mono text-sm">{walletAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-1">Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {formatBalance(walletBalance)} ETH
                  </p>
                  <p className="text-xs text-gray-500">Sepolia Testnet</p>
                </div>
              </div>
            </div>
          )}

          {/* Demo Steps */}
          <div className="grid grid-cols-1 gap-6">
            {/* Step 1: Connect Wallet */}
            <div className={`bg-gray-900 border-2 ${step >= 1 ? 'border-blue-500' : 'border-gray-800'} rounded-xl p-6`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step > 1 ? 'bg-green-600' : 'bg-blue-600'}`}>
                  {step > 1 ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white font-bold">1</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Connect MetaMask to interact with the blockchain. This is your identity on the network.
                  </p>
                  
                  {!walletConnected ? (
                    <button
                      onClick={handleConnectWallet}
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Wallet className="w-5 h-5" />
                      )}
                      Connect MetaMask
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Wallet Connected!</span>
                    </div>
                  )}

                  {!hasMetaMask() && (
                    <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                      <p className="text-yellow-400 text-sm">
                        ⚠️ MetaMask not detected. 
                        <a href="https://metamask.io/download/" target="_blank" className="underline ml-1">
                          Install MetaMask
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Switch to Test Network */}
            <div className={`bg-gray-900 border-2 ${step >= 2 ? 'border-blue-500' : 'border-gray-800'} rounded-xl p-6 ${step < 2 && 'opacity-50'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step > 2 ? 'bg-green-600' : step === 2 ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  {step > 2 ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white font-bold">2</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Switch to Sepolia Testnet
                  </h3>
                  <p className="text-gray-400 mb-4">
                    We use Sepolia testnet for development. Get free test ETH from faucets - no real money needed!
                  </p>
                  
                  {step >= 2 && !networkSwitched ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleSwitchNetwork}
                        disabled={loading}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Zap className="w-5 h-5" />
                        )}
                        Switch to Sepolia
                      </button>
                      
                      <div className="flex gap-2">
                        <a
                          href="https://sepoliafaucet.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                        >
                          Get Test ETH (Faucet)
                        </a>
                        <a
                          href="https://sepolia.etherscan.io"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
                        >
                          View on Explorer
                        </a>
                      </div>
                    </div>
                  ) : step > 2 && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">On Sepolia Testnet!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: What Happens Next */}
            <div className={`bg-gray-900 border-2 ${step >= 3 ? 'border-blue-500' : 'border-gray-800'} rounded-xl p-6 ${step < 3 && 'opacity-50'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 3 ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    How Your Wallet Will Be Used
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Use Case 1 */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Code className="w-5 h-5 text-blue-400 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-1">Submit Projects</h4>
                          <p className="text-gray-400 text-sm mb-2">
                            Sign your project submission to prove authorship. Gas cost: ~0.0001 ETH ($0.02)
                          </p>
                          <code className="text-xs bg-gray-900 text-green-400 px-2 py-1 rounded">
                            Your balance: {formatBalance(walletBalance)} ETH → After: {formatBalance((parseFloat(walletBalance) - 0.0001).toString())} ETH
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Use Case 2 */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-purple-400 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-1">Team Verification</h4>
                          <p className="text-gray-400 text-sm mb-2">
                            All team members sign to confirm they worked on the project. FREE - no gas needed!
                          </p>
                          <code className="text-xs bg-gray-900 text-blue-400 px-2 py-1 rounded">
                            Off-chain signature - instant and free
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Use Case 3 */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-yellow-400 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-1">Receive Prizes Automatically</h4>
                          <p className="text-gray-400 text-sm mb-2">
                            When you win, smart contract sends ETH directly to your wallet. INSTANT and AUTOMATIC!
                          </p>
                          <code className="text-xs bg-gray-900 text-green-400 px-2 py-1 rounded">
                            1st place: +0.25 ETH | 2nd: +0.15 ETH | 3rd: +0.10 ETH
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Use Case 4 */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-1">Immutable Score Records</h4>
                          <p className="text-gray-400 text-sm mb-2">
                            Judge scores are recorded on blockchain - cannot be changed or manipulated!
                          </p>
                          <code className="text-xs bg-gray-900 text-purple-400 px-2 py-1 rounded">
                            Transparent & verifiable forever
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Important Notes
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>This is <strong>Sepolia testnet</strong> - all ETH is fake and free from faucets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Your current balance of {formatBalance(walletBalance)} ETH is enough for ~100 transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Smart contracts ensure transparency - all transactions are public and verifiable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>You stay in control - every transaction requires your approval in MetaMask</span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
