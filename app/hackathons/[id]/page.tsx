'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import TopNav from '../../components/TopNav';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useBlockchain } from '../../context/BlockchainContext';
import { fetchHackathonById, fetchProjectsForHackathon } from '@/lib/blockchain-utils';
import { 
  ArrowLeft, Share2, Calendar, Code, Trophy, MapPin, 
  Clock, Users, Heart, ExternalLink, Award, Target, CheckCircle2
} from 'lucide-react';

interface Prize {
  id: number;
  position: number;
  amount: number;
  description: string;
  category: string;
  evaluation_criteria: string;
  voting_type: string;
}

interface Schedule {
  id: number;
  event_name: string;
  event_date: string;
  description: string;
}

interface Judge {
  id: number;
  full_name: string;
  email: string;
  bio: string;
}

interface TeamMember {
  user_id: number;
  full_name: string;
  role: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  github_url: string;
  demo_url: string;
  image_url: string;
  likes_count: number;
  updated_at: string;
  tags: string[];
  team_members: TeamMember[];
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  display_order: number;
}

interface LeaderboardEntry {
  project_id: number;
  project_name: string;
  average_score: number;
  num_judges: number;
  team_members: string[];
  github_url: string;
  demo_url: string;
}

interface Hackathon {
  id: number;
  blockchain_id?: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  status: string;
  ecosystem: string;
  tech_stack: string[];
  level: string;
  mode: string;
  total_prize_pool: number;
  participant_count: number;
  organizer_name: string;
  prizes: Prize[];
  schedules: Schedule[];
  judges: Judge[];
  projects: Project[];
  faqs: FAQ[];
}

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isBlockchainMode, walletAddress } = useBlockchain();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'prizes' | 'schedule' | 'projects' | 'leaderboard'>('overview');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [submittedProjects, setSubmittedProjects] = useState<Set<number>>(new Set());
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    type: 'loading' | 'success' | 'error';
    message: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    fetchHackathonDetails();
    checkRegistrationStatus();
  }, [params.id, isBlockchainMode]);

  useEffect(() => {
    if (!hackathon) return;
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = hackathon.status === 'upcoming' 
        ? new Date(hackathon.registration_deadline).getTime()
        : new Date(hackathon.end_date).getTime();
      
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [hackathon]);

  const checkRegistrationStatus = async () => {
    const token = isBlockchainMode 
      ? localStorage.getItem('blockchainToken') 
      : localStorage.getItem('token');
    
    if (!token) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/hackathons/${params.id}/check-registration`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsRegistered(data.isRegistered);
        console.log('Registration status:', data.isRegistered);
      }
    } catch (err) {
      console.error('Error checking registration:', err);
    }
  };

  const fetchHackathonDetails = async () => {
    setLoading(true);
    try {
      // Use API endpoint with blockchain mode instead of direct blockchain calls
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/hackathons/${params.id}?mode=blockchain`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.error('Hackathon not found');
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch hackathon');
      }
      
      const data = await response.json();
      console.log('Hackathon data received:', data);
      
      // Set the hackathon data directly from the API
      setHackathon(data);
      
      // Check registration status if user is authenticated
      const token = localStorage.getItem('token') || localStorage.getItem('blockchainToken');
      if (token) {
        try {
          const regResponse = await fetch(`${apiUrl}/api/hackathons/${params.id}/check-registration`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (regResponse.ok) {
            const regData = await regResponse.json();
            setIsRegistered(regData.isRegistered);
          }
        } catch (regError) {
          console.log('Could not check registration status:', regError);
        }
      }
      
      // Fetch leaderboard if hackathon is completed
      if (data.status === 'completed') {
        const leaderboardResponse = await fetch(`${apiUrl}/api/hackathons/${params.id}/leaderboard`);
        if (leaderboardResponse.ok) {
          const leaderboardData = await leaderboardResponse.json();
          setLeaderboard(leaderboardData);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching hackathon details:', err);
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    // Try to get any available token (blockchain or traditional)
    const blockchainToken = localStorage.getItem('blockchainToken');
    const regularToken = localStorage.getItem('token');
    const token = blockchainToken || regularToken;
    
    if (!token) {
      console.error('No authentication token found');
      console.log('Blockchain token:', blockchainToken ? 'Present' : 'Missing');
      console.log('Regular token:', regularToken ? 'Present' : 'Missing');
      console.log('Is blockchain mode:', isBlockchainMode);
      alert('Please login first');
      router.push('/?login=true');
      return;
    }

    setRegistering(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      console.log('Registering for hackathon:', params.id);
      console.log('Using blockchain mode:', isBlockchainMode);
      console.log('Wallet address:', walletAddress);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${apiUrl}/api/hackathons/${params.id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: walletAddress
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      let data;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          data = { error: 'Server returned non-JSON response: ' + text.substring(0, 100) };
        }
      } catch (parseError: any) {
        console.error('Error parsing response:', parseError);
        const text = await response.text().catch(() => 'Unable to read response');
        data = { error: 'Failed to parse response: ' + parseError.message };
      }

      console.log('Registration response data:', data);

      if (response.ok) {
        console.log('Registration successful!');
        setIsRegistered(true);
        setShowRegisterConfirm(false);
        alert('Successfully registered for hackathon!');
        // Show success notification
        setTimeout(() => {
          setShowShareSuccess(true);
          setTimeout(() => setShowShareSuccess(false), 3000);
        }, 300);
      } else {
        console.error('Registration failed:', data);
        if (data.error === 'Already registered') {
          alert('You are already registered for this hackathon');
          setIsRegistered(true);
        } else {
          alert(`Registration failed: ${data.error || 'Unknown error'}`);
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      alert(`Registration failed: ${err.message || 'Network error. Please check if the server is running.'}`);
    } finally {
      setRegistering(false);
    }
  };

  const confirmRegister = () => {
    setShowRegisterConfirm(true);
  };

  const handleSubmitProject = async (projectId: number) => {
    if (!isBlockchainMode) {
      setSubmissionStatus({
        type: 'error',
        message: 'Blockchain mode required',
        details: 'Project submission is only available in blockchain mode'
      });
      setShowSubmissionModal(true);
      return;
    }

    if (submittedProjects.has(projectId)) {
      setSubmissionStatus({
        type: 'error',
        message: 'Already submitted',
        details: 'This project has already been submitted to the blockchain'
      });
      setShowSubmissionModal(true);
      return;
    }

    const blockchainToken = localStorage.getItem('blockchainToken');
    const regularToken = localStorage.getItem('token');
    const token = blockchainToken || regularToken;
    
    if (!token) {
      setSubmissionStatus({
        type: 'error',
        message: 'Authentication required',
        details: 'Please login first'
      });
      setShowSubmissionModal(true);
      return;
    }

    setSubmitting(true);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const abi = [
        'function submitProject(uint256 hackathonId, string memory name, string memory description, string memory githubUrl, string memory demoUrl) external payable'
      ];

      const contract = new ethers.Contract(contractAddress!, abi, signer);

      // Get project details
      const project = userProjects.find(p => p.id === projectId);
      if (!project) {
        setSubmissionStatus({
          type: 'error',
          message: 'Project not found',
          details: 'The selected project could not be found'
        });
        setShowSubmissionModal(true);
        return;
      }

      console.log('Project object:', project);

      // Ensure all string parameters are defined
      const projectName = project.title || project.name || 'Untitled Project';
      const projectDescription = project.description || 'No description provided';
      const projectGithubUrl = project.github_url || '';
      const projectDemoUrl = project.demo_url || '';

      if (!projectName.trim()) {
        setSubmissionStatus({
          type: 'error',
          message: 'Project name required',
          details: 'Please add a name to your project before submitting'
        });
        setShowSubmissionModal(true);
        return;
      }

      // Check if hackathon has blockchain ID
      console.log('Hackathon object:', hackathon);
      
      if (!hackathon) {
        setSubmissionStatus({
          type: 'error',
          message: 'Hackathon data not loaded',
          details: 'Please refresh the page and try again'
        });
        setShowSubmissionModal(true);
        return;
      }
      
      let blockchainHackathonId;
      if (isBlockchainMode) {
        // In blockchain mode, the hackathon.id IS the blockchain ID
        blockchainHackathonId = hackathon.id;
        console.log('Blockchain mode - using hackathon.id:', blockchainHackathonId);
      } else {
        // In database mode, need blockchain_id field
        blockchainHackathonId = hackathon.blockchain_id;
        console.log('Database mode - using blockchain_id:', blockchainHackathonId);
      }
      
      if (!blockchainHackathonId) {
        setSubmissionStatus({
          type: 'error',
          message: 'Hackathon not available',
          details: 'This hackathon is not available for blockchain submission'
        });
        setShowSubmissionModal(true);
        return;
      }

      // 1 HC = 1,000,000 wei
      const submissionFee = ethers.utils.parseUnits('1', 6);

      // Show loading modal
      setSubmissionStatus({
        type: 'loading',
        message: 'Confirm transaction in MetaMask',
        details: 'Submission fee: 1 HC'
      });
      setShowSubmissionModal(true);

      console.log('Contract call parameters:');
      console.log('  hackathonId:', blockchainHackathonId);
      console.log('  name:', projectName);
      console.log('  description:', projectDescription);
      console.log('  githubUrl:', projectGithubUrl);
      console.log('  demoUrl:', projectDemoUrl);
      console.log('  value:', submissionFee.toString());

      const tx = await contract.submitProject(
        blockchainHackathonId,
        projectName,
        projectDescription,
        projectGithubUrl,
        projectDemoUrl,
        { value: submissionFee }
      );

      setSubmissionStatus({
        type: 'loading',
        message: 'Transaction submitted!',
        details: 'Waiting for blockchain confirmation...'
      });

      await tx.wait();

      setSubmissionStatus({
        type: 'success',
        message: 'Project submitted successfully!',
        details: 'Your project is now on the blockchain'
      });

      // Mark project as submitted
      setSubmittedProjects(prev => new Set([...prev, projectId]));
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowSubmissionModal(false);
        setShowProjectSelector(false);
      }, 3000);
    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmissionStatus({
        type: 'error',
        message: 'Submission failed',
        details: error.message || 'Please try again'
      });
      setShowSubmissionModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const openProjectSelector = async () => {
    const blockchainToken = localStorage.getItem('blockchainToken');
    const regularToken = localStorage.getItem('token');
    const token = blockchainToken || regularToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${apiUrl}/api/users/me/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const projects = await response.json();
        setUserProjects(projects);
        setShowProjectSelector(true);
      } else {
        alert('Failed to load your projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Failed to load projects');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareSuccess(true);
    setTimeout(() => setShowShareSuccess(false), 3000);
  };

  if (loading || !hackathon) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar />
        <div className="ml-64 flex-1">
          <TopNav />
          <div className="flex items-center justify-center h-screen">
            <div className="text-xl text-gray-400">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const registrationClosed = new Date() > new Date(hackathon.registration_deadline);
  const hackathonEnded = hackathon.status === 'completed';

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        <TopNav />
        
        <main className="p-8">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Hackathons
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-900 p-1 rounded-lg w-fit">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'prizes', label: 'Prizes & Judges' },
              { id: 'schedule', label: 'Schedule' },
              { id: 'projects', label: 'Submitted Projects' },
              ...(hackathon.status === 'completed' ? [{ id: 'leaderboard', label: 'Leaderboard' }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2.5 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Introduction */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
                    <h1 className="text-4xl font-bold text-white mb-4">{hackathon.name}</h1>
                    <p className="text-xl text-blue-400 mb-6">{hackathon.ecosystem}</p>
                    <div className="prose prose-invert max-w-none">
                      <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
                      <p className="text-gray-300 leading-relaxed">{hackathon.description}</p>
                    </div>
                  </div>

                  {/* FAQs */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                      {hackathon.faqs?.sort((a, b) => a.display_order - b.display_order).map((faq) => (
                        <details key={faq.id} className="group">
                          <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition">
                            <span className="font-semibold text-white">{faq.question}</span>
                            <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                          </summary>
                          <div className="mt-2 p-4 text-gray-300 bg-gray-850 rounded-lg">
                            {faq.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'prizes' && (
                <div className="space-y-6">
                  {/* Overall Prize Pool */}
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-800/50 rounded-xl p-8 text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Total Prize Pool</h2>
                    <div className="text-5xl font-bold text-yellow-500 mb-2">
                      {isBlockchainMode ? `${hackathon.total_prize_pool?.toLocaleString()} HC` : `$${hackathon.total_prize_pool?.toLocaleString()}`}
                    </div>
                    <p className="text-gray-400">{hackathon.prizes?.length || 0} prize categories available</p>
                  </div>

                  {/* Blockchain Mode Notice */}
                  {isBlockchainMode && hackathon.prizes?.length === 0 && (
                    <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Blockchain Hackathon Prizes</h3>
                          <p className="text-gray-300 mb-3">
                            This is a blockchain-based hackathon. Prize details were set when the hackathon was created on the blockchain.
                            The total prize pool of <span className="font-bold text-yellow-500">{hackathon.total_prize_pool} HC</span> will be distributed to winners by the organizer.
                          </p>
                          <p className="text-gray-400 text-sm">
                            Individual prize breakdowns are stored in the smart contract but cannot be retrieved after creation.
                            The organizer will distribute prizes according to the predefined criteria.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {hackathon.prizes?.map((prize) => (
                    <div key={prize.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-6 border-b border-gray-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-2">{prize.category}</h3>
                            <p className="text-gray-400">{prize.description}</p>
                          </div>
                          <div className="text-right">
                            <Trophy className="w-8 h-8 text-yellow-500 mb-2 ml-auto" />
                            <div className="text-3xl font-bold text-yellow-500">
                              {isBlockchainMode ? `${prize.amount} HC` : `$${prize.amount.toLocaleString()}`}
                            </div>
                            <div className="text-sm text-gray-400">Position #{prize.position}</div>
                            <div className="text-xs text-gray-500 mt-1">1 Winner</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-5 h-5 text-blue-400" />
                            <h4 className="font-semibold text-white">Evaluation Criteria</h4>
                          </div>
                          <p className="text-gray-300">{prize.evaluation_criteria}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 text-purple-400" />
                            <h4 className="font-semibold text-white">Voting</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {hackathon.judges?.map((judge) => (
                              <div key={judge.id} className="px-3 py-2 bg-gray-800 rounded-lg text-sm">
                                <div className="font-medium text-white">{judge.full_name}</div>
                                <div className="text-xs text-gray-400">{judge.email}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-8">Event Timeline</h2>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800"></div>
                    <div className="space-y-8">
                      {hackathon.schedules?.sort((a, b) => 
                        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
                      ).map((schedule, idx) => {
                        const isPast = new Date(schedule.event_date) < new Date();
                        return (
                          <div key={schedule.id} className="relative pl-12">
                            <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isPast ? 'bg-green-600' : 'bg-blue-600'
                            }`}>
                              {isPast ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : (
                                <span className="text-white font-bold">{idx + 1}</span>
                              )}
                            </div>
                            <div className="bg-gray-800 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-semibold text-white">{schedule.event_name}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  isPast ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'
                                }`}>
                                  {isPast ? 'Completed' : 'Upcoming'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400 mb-2">
                                {new Date(schedule.event_date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })} at {new Date(schedule.event_date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <p className="text-gray-300">{schedule.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div>
                  {hackathon.projects && hackathon.projects.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {hackathon.projects.map((project) => (
                        <div 
                          key={project.id} 
                          className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition group cursor-pointer"
                          onClick={() => router.push(`/projects/${project.id}`)}
                        >
                      <div className="relative h-48 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                        {project.image_url ? (
                          <img src={project.image_url} alt={project.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Code className="w-16 h-16 text-gray-700" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/90 backdrop-blur rounded-full">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-white font-medium text-sm">{project.likes_count}</span>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">
                          {project.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span>Edited {new Date(project.updated_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>By {project.team_members?.[0]?.full_name || 'Anonymous'}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags?.map((tag, idx) => (
                            <span key={`tag-${project.id}-${idx}-${tag}`} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition"
                            >
                              <ExternalLink className="w-4 h-4" />
                              GitHub
                            </a>
                          )}
                          {project.demo_url && (
                            <a
                              href={project.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Demo
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
                      <Code className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
                      <p className="text-gray-400">No projects have been submitted to this hackathon yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'leaderboard' && (
                <div className="space-y-6">
                  {/* Leaderboard Header */}
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-800/50 rounded-xl p-8 text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Final Rankings</h2>
                    <p className="text-gray-400">Based on judges' scores across all evaluation categories</p>
                  </div>

                  {/* Leaderboard Table */}
                  {leaderboard && leaderboard.length > 0 ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-800/50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Team</th>
                              <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Average Score</th>
                              <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Judges</th>
                              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Links</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {leaderboard.map((entry, index) => (
                              <tr key={entry.project_id} className="hover:bg-gray-800/50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {index === 0 && <Trophy className="w-6 h-6 text-yellow-500 mr-2" />}
                                    {index === 1 && <Trophy className="w-6 h-6 text-gray-400 mr-2" />}
                                    {index === 2 && <Trophy className="w-6 h-6 text-orange-600 mr-2" />}
                                    <span className="text-2xl font-bold text-white">#{index + 1}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-white text-lg">{entry.project_name}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1">
                                    {entry.team_members?.slice(0, 3).map((member, idx) => (
                                      <span key={`member-${entry.project_id}-${idx}-${member}`} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                                        {member}
                                      </span>
                                    ))}
                                    {entry.team_members?.length > 3 && (
                                      <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                                        +{entry.team_members.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <Award className="w-5 h-5 text-blue-400" />
                                    <span className="text-2xl font-bold text-blue-400">{Number(entry.average_score).toFixed(1)}</span>
                                    <span className="text-sm text-gray-400">/ 400</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-gray-300">{entry.num_judges} {entry.num_judges === 1 ? 'judge' : 'judges'}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex justify-end gap-2">
                                    {entry.github_url && (
                                      <a
                                        href={entry.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
                                        title="View on GitHub"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    )}
                                    {entry.demo_url && (
                                      <a
                                        href={entry.demo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                        title="View Demo"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
                      <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Rankings Available</h3>
                      <p className="text-gray-400">Projects have not been scored yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Countdown Timer */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4">
                    {hackathon.status === 'upcoming' ? 'Registration Ends In' : 'Hackathon Ends In'}
                  </h3>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {Object.entries(timeLeft).map(([unit, value]) => (
                      <div key={unit} className="text-center">
                        <div className="bg-gray-800 rounded-lg p-3 mb-1">
                          <div className="text-2xl font-bold text-white">{value}</div>
                        </div>
                        <div className="text-xs text-gray-400 capitalize">{unit}</div>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  {!hackathonEnded && !registrationClosed && !isRegistered && (
                    <button
                      onClick={confirmRegister}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                      Register for Hackathon
                    </button>
                  )}
                  
                  {isRegistered && !hackathonEnded && (
                    <button 
                      onClick={openProjectSelector}
                      disabled={submitting}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Project (1 HC)'}
                    </button>
                  )}
                  
                  {(registrationClosed || hackathonEnded) && !isRegistered && (
                    <button disabled className="w-full py-3 bg-gray-800 text-gray-500 rounded-lg font-semibold cursor-not-allowed">
                      Registration Closed
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-5 h-5" />
                      <span>Registration</span>
                    </div>
                    <span className="text-white font-medium">
                      {(() => {
                        const daysLeft = Math.ceil((new Date(hackathon.registration_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        return daysLeft > 0 ? `${daysLeft} days left` : 'Registration Closed';
                      })()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Code className="w-5 h-5" />
                      <span>Tech Stack</span>
                    </div>
                    <span className="text-white font-medium">{hackathon.tech_stack?.[0]}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Target className="w-5 h-5" />
                      <span>Level</span>
                    </div>
                    <span className="text-white font-medium capitalize">{hackathon.level}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Trophy className="w-5 h-5" />
                      <span>Prize Pool</span>
                    </div>
                    <span className="text-yellow-500 font-bold">
                      {isBlockchainMode ? `${hackathon.total_prize_pool?.toLocaleString()} HC` : `$${hackathon.total_prize_pool?.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-5 h-5" />
                      <span>Location</span>
                    </div>
                    <span className="text-white font-medium capitalize">{hackathon.mode}</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4">Follow Us</h3>
                  <div className="space-y-3">
                    <a
                      href="https://twitter.com/hackchain"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-750 rounded-lg transition"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">𝕏</span>
                      </div>
                      <span className="text-white font-medium">Follow on X</span>
                    </a>
                    <a
                      href="https://t.me/hackchain"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-750 rounded-lg transition"
                    >
                      <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">TG</span>
                      </div>
                      <span className="text-white font-medium">Join Telegram</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Registration Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRegisterConfirm}
        onClose={() => setShowRegisterConfirm(false)}
        onConfirm={handleRegister}
        title="Register for Hackathon"
        message={`Are you sure you want to register for ${hackathon?.name}? You'll be able to submit your project after registration.`}
        confirmText="Register"
        cancelText="Cancel"
        type="success"
        loading={registering}
      />

      {/* Share Success Notification */}
      {showShareSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-white font-semibold">Success!</p>
              <p className="text-gray-400 text-sm">
                {isRegistered ? 'Successfully registered for hackathon' : 'Link copied to clipboard'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Project Selector Modal */}
      {showProjectSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Select Project to Submit</h2>
              <button 
                onClick={() => setShowProjectSelector(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {userProjects.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No projects found. Create a project first in your dashboard.
                </p>
              ) : (
                userProjects.map((project) => {
                  const isSubmitted = submittedProjects.has(project.id);
                  return (
                    <div 
                      key={project.id}
                      className={`p-4 bg-gray-800/50 border rounded-lg transition ${
                        isSubmitted 
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-gray-700 hover:border-purple-500 cursor-pointer'
                      }`}
                      onClick={!isSubmitted ? () => handleSubmitProject(project.id) : undefined}
                    >
                      <h3 className="font-semibold text-white mb-2">{project.title || project.name}</h3>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {project.github_url && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                          </span>
                        )}
                        {project.demo_url && (
                          <span className="flex items-center gap-1">
                            🔗 Demo
                          </span>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        {isSubmitted ? (
                          <p className="text-xs text-green-400 font-medium flex items-center gap-2">
                            ✅ Submitted to blockchain
                          </p>
                        ) : (
                          <p className="text-xs text-green-400 font-medium">Click to submit (1 HC fee)</p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-4">
              <button
                onClick={() => setShowProjectSelector(false)}
                className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Status Modal */}
      {showSubmissionModal && submissionStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              {submissionStatus.type === 'loading' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 mx-auto border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <h3 className="text-lg font-semibold text-white">{submissionStatus.message}</h3>
                  <p className="text-gray-400 text-sm">{submissionStatus.details}</p>
                </div>
              )}
              
              {submissionStatus.type === 'success' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-400">{submissionStatus.message}</h3>
                  <p className="text-gray-400 text-sm">{submissionStatus.details}</p>
                  <p className="text-xs text-gray-500">This modal will close automatically</p>
                </div>
              )}
              
              {submissionStatus.type === 'error' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 mx-auto bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-400">{submissionStatus.message}</h3>
                  <p className="text-gray-400 text-sm">{submissionStatus.details}</p>
                  <button
                    onClick={() => setShowSubmissionModal(false)}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
