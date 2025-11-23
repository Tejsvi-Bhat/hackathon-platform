'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import TopNav from '../../components/TopNav';
import ConfirmDialog from '../../components/ConfirmDialog';
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

interface Hackathon {
  id: number;
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
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'prizes' | 'schedule' | 'projects'>('overview');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchHackathonDetails();
  }, [params.id]);

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

  const fetchHackathonDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/hackathons/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setHackathon(data);

      const token = localStorage.getItem('token');
      if (token) {
        const regResponse = await fetch(`http://localhost:3001/api/hackathons/${params.id}/check-registration`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (regResponse.ok) {
          const regData = await regResponse.json();
          setIsRegistered(regData.isRegistered);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/?login=true');
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch(`http://localhost:3001/api/hackathons/${params.id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsRegistered(true);
        setShowRegisterConfirm(false);
        // Show success notification
        setTimeout(() => {
          setShowShareSuccess(true);
          setTimeout(() => setShowShareSuccess(false), 3000);
        }, 300);
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setRegistering(false);
    }
  };

  const confirmRegister = () => {
    setShowRegisterConfirm(true);
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
                      ${hackathon.total_prize_pool?.toLocaleString()}
                    </div>
                    <p className="text-gray-400">{hackathon.prizes?.length || 0} prize categories available</p>
                  </div>

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
                            <div className="text-3xl font-bold text-yellow-500">${prize.amount.toLocaleString()}</div>
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
                        <div key={project.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition group">
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
                            <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
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
                    <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition">
                      Submit Project
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
                    <span className="text-yellow-500 font-bold">${hackathon.total_prize_pool?.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
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
    </div>
  );
}
