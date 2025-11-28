'use client';

import { useState, useEffect } from 'react';
import { X, Wallet, User, Users, Award } from 'lucide-react';
import { ethers } from 'ethers';
import { useBlockchain } from '@/app/context/BlockchainContext';

interface WalletAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export default function WalletAuthModal({ isOpen, onClose, onAuthSuccess }: WalletAuthModalProps) {
  const [step, setStep] = useState<'connect' | 'selectRole' | 'enterName'>('connect');
  const [selectedRole, setSelectedRole] = useState<'organizer' | 'participant' | 'judge' | null>(null);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { walletAddress, connectWallet, isConnecting } = useBlockchain();

  // Function to perform login for existing users
  const performLogin = async () => {
    if (!walletAddress) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Sign a message to prove ownership
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const timestamp = Date.now();
      const message = `Sign this message to authenticate on HackChain platform.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;
      const signature = await signer.signMessage(message);

      // Perform login
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/blockchain-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          signature,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();

      // Store token if provided
      if (data.token) {
        localStorage.setItem('blockchainToken', data.token);
        console.log('✅ Blockchain token stored successfully');
      }

      onAuthSuccess();
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
      // If login fails, allow manual registration
      setTimeout(() => setStep('selectRole'), 100);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-advance to role selection if wallet is already connected
  useEffect(() => {
    if (isOpen && walletAddress && step === 'connect') {
      // Check if user is already registered
      const checkRegistration = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const response = await fetch(`${apiUrl}/api/blockchain-auth/verify/${walletAddress}`);
          const data = await response.json();
          
          if (data.registered) {
            // User already registered, perform login to get token
            console.log('User already registered, performing automatic login...');
            await performLogin();
          } else {
            // User not registered, advance to role selection
            setTimeout(() => setStep('selectRole'), 100);
          }
        } catch (error) {
          console.error('Error checking registration:', error);
          // On error, still advance to registration
          setTimeout(() => setStep('selectRole'), 100);
        }
      };
      
      checkRegistration();
    }
  }, [isOpen, walletAddress, step]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('connect');
      setSelectedRole(null);
      setFullName('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    try {
      setError('');
      await connectWallet();
      // Advance to role selection after successful connection
      setStep('selectRole');
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleRoleSelect = () => {
    if (!selectedRole) return;
    setStep('enterName');
  };

  const handleRegister = async () => {
    if (!selectedRole || !walletAddress) return;

    setIsLoading(true);
    setError('');

    try {
      // Sign a message to prove ownership
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const timestamp = Date.now();
      const message = `Sign this message to authenticate as ${selectedRole} on HackChain platform.\n\nWallet: ${walletAddress}\nRole: ${selectedRole}\nTimestamp: ${timestamp}`;
      const signature = await signer.signMessage(message);

      // First check if wallet is already registered
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const verifyResponse = await fetch(`${apiUrl}/api/blockchain-auth/verify/${walletAddress}`);
      const verifyData = await verifyResponse.json();

      let response;
      if (verifyData.registered) {
        // Login existing user
        response = await fetch(`${apiUrl}/api/blockchain-auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            signature,
            message,
          }),
        });
      } else {
        // Register new user
        response = await fetch(`${apiUrl}/api/blockchain-auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            role: selectedRole,
            signature,
            message,
            fullName: fullName || `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} User`,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();

      // Store token if provided (for future API calls)
      if (data.token) {
        localStorage.setItem('blockchainToken', data.token);
      }

      // Don't store user in localStorage - components will fetch from backend
      onAuthSuccess();
      onClose();
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'organizer' as const,
      title: 'Organizer',
      description: 'Create and manage hackathons',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'participant' as const,
      title: 'Participant',
      description: 'Join hackathons and submit projects',
      icon: User,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'judge' as const,
      title: 'Judge',
      description: 'Review and evaluate projects',
      icon: Award,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {step === 'connect' ? 'Connect Wallet' : step === 'selectRole' ? 'Select Your Role' : 'Enter Your Name'}
              </h2>
              <p className="text-sm text-gray-400">
                {step === 'connect' ? 'Sign in with MetaMask' : step === 'selectRole' ? 'Choose how you want to participate' : 'Tell us who you are'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'connect' ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Use MetaMask to securely authenticate and interact with the blockchain
                </p>

                {walletAddress ? (
                  <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
                    <code className="text-sm font-mono text-green-400">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </code>
                  </div>
                ) : null}

                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  onClick={walletAddress ? () => setStep('selectRole') : handleConnect}
                  disabled={isConnecting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? 'Connecting...' : walletAddress ? 'Continue' : 'Connect MetaMask'}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 text-center">
                  Don't have MetaMask?{' '}
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Install it here
                  </a>
                </p>
              </div>
            </div>
          ) : step === 'selectRole' ? (
            <div className="space-y-4">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full p-4 rounded-lg border-2 transition text-left ${
                      selectedRole === role.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${role.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{role.title}</h4>
                        <p className="text-sm text-gray-400">{role.description}</p>
                      </div>
                      {selectedRole === role.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('connect')}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                >
                  Back
                </button>
                <button
                  onClick={handleRoleSelect}
                  disabled={!selectedRole}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : step === 'enterName' ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  What should we call you?
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Enter your name to personalize your experience
                </p>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2 text-left">
                    This will be displayed on your profile. You can leave it blank to use a default name.
                  </p>
                </div>

                {/* Show selected role */}
                <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Selected Role</p>
                  <p className="text-sm font-semibold text-white capitalize">{selectedRole}</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('selectRole')}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing...' : 'Sign & Register'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
