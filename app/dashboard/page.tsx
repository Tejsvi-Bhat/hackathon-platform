'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { Trophy, Code, Calendar, Users, Plus, Github, ExternalLink, Tag, Image as ImageIcon, X, FolderGit, Award, Target, Rocket, TrendingUp, FileText } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  github_url: string;
  demo_url: string;
  image_url: string;
  tags: string[];
  created_at: string;
  hackathon_name?: string;
}

interface Registration {
  id: number;
  hackathon_id: number;
  hackathon_name: string;
  status: string;
  registered_at: string;
  start_date: string;
  end_date: string;
  total_prize_pool: number;
}

interface Hackathon {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  total_prize_pool: number;
  participant_count: number;
  project_count: number;
  ecosystem: string;
  level: string;
  mode: string;
  scored_count?: number;
  assigned_at?: string;
}

interface Prize {
  position: number;
  title: string;
  amount: number;
  description: string;
  evaluation_criteria: string;
  judge_ids: number[];
}

interface Judge {
  id: number;
  full_name: string;
  email: string;
  expertise?: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [judgeHackathons, setJudgeHackathons] = useState<Hackathon[]>([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateHackathon, setShowCreateHackathon] = useState(false);
  const [hackathonStep, setHackathonStep] = useState(1);
  const [createdHackathonId, setCreatedHackathonId] = useState<number | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [availableJudges, setAvailableJudges] = useState<Judge[]>([]);
  const [currentPrize, setCurrentPrize] = useState<Prize>({
    position: 1,
    title: '',
    amount: 0,
    description: '',
    evaluation_criteria: '',
    judge_ids: []
  });
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    github_url: '',
    demo_url: '',
    image_url: '',
    tags: ''
  });
  const [newHackathon, setNewHackathon] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    ecosystem: 'Ethereum',
    tech_stack: '',
    level: 'intermediate',
    mode: 'hybrid',
    min_team_size: 1,
    max_team_size: 5,
    banner_image: '',
    is_featured: false
  });

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete
    
    if (!user) {
      router.push('/?login=true');
      return;
    }
    fetchDashboardData();
  }, [user, loading]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    try {
      // Fetch stats
      const statsRes = await fetch(`${apiUrl}/api/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch user projects if participant
      if (user?.role === 'hacker') {
        const projectsRes = await fetch(`${apiUrl}/api/users/me/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }

        // Fetch registrations
        const regsRes = await fetch(`${apiUrl}/api/users/me/registrations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (regsRes.ok) {
          const regsData = await regsRes.json();
          setRegistrations(regsData);
        }
      }

      // Fetch organizer's hackathons
      if (user?.role === 'organizer') {
        const hackathonsRes = await fetch(`${apiUrl}/api/users/me/hackathons`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (hackathonsRes.ok) {
          const hackathonsData = await hackathonsRes.json();
          setHackathons(hackathonsData);
        }
      }

      // Fetch judge's assigned hackathons
      if (user?.role === 'judge') {
        const judgeHackathonsRes = await fetch(`${apiUrl}/api/users/me/judge-hackathons`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (judgeHackathonsRes.ok) {
          const judgeHackathonsData = await judgeHackathonsRes.json();
          setJudgeHackathons(judgeHackathonsData);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchJudges = async () => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    try {
      const res = await fetch(`${apiUrl}/api/judges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableJudges(data);
      }
    } catch (error) {
      console.error('Error fetching judges:', error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${apiUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProject,
          tags: newProject.tags.split(',').map(t => t.trim()).filter(t => t)
        })
      });

      if (response.ok) {
        setShowCreateProject(false);
        setNewProject({ title: '', description: '', github_url: '', demo_url: '', image_url: '', tags: '' });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${apiUrl}/api/hackathons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newHackathon,
          tech_stack: newHackathon.tech_stack.split(',').map(t => t.trim()).filter(t => t),
          total_prize_pool: 0 // Will be calculated from prizes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedHackathonId(data.id);
        setHackathonStep(2);
        fetchJudges();
      }
    } catch (error) {
      console.error('Failed to create hackathon:', error);
    }
  };

  const handleAddPrize = () => {
    if (!currentPrize.title || currentPrize.amount <= 0) {
      alert('Please fill in prize title and amount');
      return;
    }
    setPrizes([...prizes, { ...currentPrize }]);
    setCurrentPrize({
      position: prizes.length + 2,
      title: '',
      amount: 0,
      description: '',
      evaluation_criteria: '',
      judge_ids: []
    });
  };

  const handleRemovePrize = (index: number) => {
    const updatedPrizes = prizes.filter((_, i) => i !== index);
    // Reorder positions
    setPrizes(updatedPrizes.map((p, i) => ({ ...p, position: i + 1 })));
  };

  const handleFinishHackathon = async () => {
    if (prizes.length === 0) {
      const confirm = window.confirm('No prizes added. Do you want to continue without prizes?');
      if (!confirm) return;
    }

    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      // Create prizes
      const uniqueJudges = new Set<number>();
      
      for (const prize of prizes) {
        await fetch(`${apiUrl}/api/hackathons/${createdHackathonId}/prizes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(prize)
        });

        // Collect unique judge IDs
        prize.judge_ids.forEach(id => uniqueJudges.add(id));
      }

      // Assign judges to hackathon (unique)
      for (const judgeId of uniqueJudges) {
        await fetch(`${apiUrl}/api/hackathons/${createdHackathonId}/judges`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ judge_id: judgeId })
        });
      }

      alert('Hackathon created successfully with prizes and judges!');
      setShowCreateHackathon(false);
      setHackathonStep(1);
      setCreatedHackathonId(null);
      setPrizes([]);
      setCurrentPrize({
        position: 1,
        title: '',
        amount: 0,
        description: '',
        evaluation_criteria: '',
        judge_ids: []
      });
      setNewHackathon({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        ecosystem: 'Ethereum',
        tech_stack: '',
        level: 'intermediate',
        mode: 'hybrid',
        min_team_size: 1,
        max_team_size: 5,
        banner_image: '',
        is_featured: false
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating prizes:', error);
      alert('Failed to create prizes');
    }
  };

  const handleCancelHackathon = () => {
    if (hackathonStep === 2) {
      const confirm = window.confirm('Are you sure? The hackathon basic details have been saved, but prizes will not be added.');
      if (!confirm) return;
    }
    setShowCreateHackathon(false);
    setHackathonStep(1);
    setCreatedHackathonId(null);
    setPrizes([]);
    setCurrentPrize({
      position: 1,
      title: '',
      amount: 0,
      description: '',
      evaluation_criteria: '',
      judge_ids: []
    });
    setNewHackathon({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      registration_deadline: '',
      ecosystem: 'Ethereum',
      tech_stack: '',
      level: 'intermediate',
      mode: 'hybrid',
      min_team_size: 1,
      max_team_size: 5,
      banner_image: '',
      is_featured: false
    });
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-950 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        <TopNav />
        
        <main className="p-8">
          {/* Profile Header */}
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user.fullName}</h1>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <span className="text-white/90">{user.email}</span>
                  </div>
                  {user.bio && (
                    <p className="text-white/90 max-w-2xl">{user.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Participant Dashboard */}
          {user.role === 'hacker' && (
            <>
              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Hackathons Joined</p>
                      <p className="text-3xl font-bold text-white mt-1">{registrations.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Code className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Projects Created</p>
                      <p className="text-3xl font-bold text-white mt-1">{projects.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Wins / Top 3</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.wins || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Project Button */}
              <div className="mb-8">
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create New Project
                </button>
              </div>

              {/* Projects Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FolderGit className="w-7 h-7 text-blue-400" />
                    My Projects
                  </h2>
                </div>

                {projects.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {projects.map((project) => (
                      <div key={project.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition">
                        {project.image_url && (
                          <img 
                            src={project.image_url} 
                            alt={project.title}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                        
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.tags.map((tag, idx) => (
                              <span key={idx} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-3">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition text-sm"
                            >
                              <Github className="w-4 h-4" />
                              Code
                            </a>
                          )}
                          {project.demo_url && (
                            <a
                              href={project.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Demo
                            </a>
                          )}
                        </div>

                        {project.hackathon_name && (
                          <p className="text-xs text-gray-500 mt-4">
                            Submitted to: {project.hackathon_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                    <FolderGit className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No projects yet</p>
                    <button
                      onClick={() => setShowCreateProject(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Create Your First Project
                    </button>
                  </div>
                )}
              </div>

              {/* Registered Hackathons */}
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                  <Calendar className="w-7 h-7 text-purple-400" />
                  Registered Hackathons
                </h2>

                {registrations.length > 0 ? (
                  <div className="space-y-4">
                    {registrations.map((reg) => (
                      <Link
                        key={reg.id}
                        href={`/hackathons/${reg.hackathon_id}`}
                        className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">{reg.hackathon_name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(reg.start_date).toLocaleDateString()} - {new Date(reg.end_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Trophy className="w-4 h-4" />
                                ${(reg.total_prize_pool / 1000).toFixed(0)}K Prize
                              </span>
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-lg ${
                            reg.status === 'ongoing' ? 'bg-green-500/10 text-green-400' :
                            reg.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-gray-500/10 text-gray-400'
                          }`}>
                            {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Not registered for any hackathons yet</p>
                    <Link
                      href="/"
                      className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      Browse Hackathons
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Judge Dashboard */}
          {user.role === 'judge' && (
            <>
              {/* Stats */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Award className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Hackathons Assigned</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.hackathonsJudging || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Projects Scored</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.projectsScored || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Hackathons */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-400" />
                  Assigned Hackathons
                </h2>

                {judgeHackathons.length === 0 ? (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                    <Award className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No Hackathons Assigned</h3>
                    <p className="text-gray-500">You haven't been assigned to any hackathons yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {judgeHackathons.map((hackathon) => (
                      <Link
                        key={hackathon.id}
                        href={`/hackathons/${hackathon.id}`}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition mb-2">
                              {hackathon.name}
                            </h3>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{hackathon.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                hackathon.status === 'ongoing' ? 'bg-green-500/20 text-green-300' :
                                hackathon.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {hackathon.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 pt-4 border-t border-gray-800">
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-300">{hackathon.project_count || 0} Projects</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-gray-300">{hackathon.scored_count || 0} Scored</span>
                          </div>
                          {hackathon.status === 'ongoing' || hackathon.status === 'completed' ? (
                            <div className="ml-auto">
                              <span className="text-blue-400 text-sm font-medium group-hover:underline">
                                View Projects to Judge →
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Organizer Dashboard */}
          {user.role === 'organizer' && (
            <>
              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Rocket className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Hackathons Organized</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.hackathonsOrganized || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Participants</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.totalParticipants || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Project Submissions</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.totalProjects || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Hackathon Button */}
              <div className="mb-8">
                <button
                  onClick={() => setShowCreateHackathon(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create New Hackathon
                </button>
              </div>

              {/* My Hackathons */}
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                  <Rocket className="w-7 h-7 text-purple-400" />
                  My Hackathons
                </h2>

                {hackathons.length > 0 ? (
                  <div className="space-y-4">
                    {hackathons.map((hackathon) => (
                      <Link
                        key={hackathon.id}
                        href={`/hackathons/${hackathon.id}`}
                        className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">{hackathon.name}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{hackathon.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                              </span>
                              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium border border-blue-500/20">
                                {hackathon.ecosystem}
                              </span>
                              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium border border-purple-500/20">
                                {hackathon.level}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`px-4 py-2 rounded-lg ml-4 ${
                            hackathon.status === 'ongoing' ? 'bg-green-500/10 text-green-400' :
                            hackathon.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-gray-500/10 text-gray-400'
                          }`}>
                            {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 pt-4 border-t border-gray-800">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">{hackathon.participant_count} Participants</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Code className="w-4 h-4" />
                            <span className="text-sm">{hackathon.project_count} Projects</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Trophy className="w-4 h-4" />
                            <span className="text-sm">${(hackathon.total_prize_pool / 1000).toFixed(0)}K Prize Pool</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                    <Rocket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No hackathons organized yet</p>
                    <button
                      onClick={() => setShowCreateHackathon(true)}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      Create Your First Hackathon
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-400" />
                Create New Project
              </h2>
              <button
                onClick={() => setShowCreateProject(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter project title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Describe your project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Github className="w-4 h-4 inline mr-1" />
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={newProject.github_url}
                  onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <ExternalLink className="w-4 h-4 inline mr-1" />
                  Demo URL
                </label>
                <input
                  type="url"
                  value={newProject.demo_url}
                  onChange={(e) => setNewProject({ ...newProject, demo_url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="https://your-demo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Project Image URL
                </label>
                <input
                  type="url"
                  value={newProject.image_url}
                  onChange={(e) => setNewProject({ ...newProject, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="https://image-url.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="React, Web3, DeFi, NFT"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Hackathon Modal */}
      {showCreateHackathon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-purple-400" />
                  {hackathonStep === 1 ? 'Create New Hackathon' : 'Add Prizes & Judges'}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${hackathonStep === 1 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                    Step 1: Details
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${hackathonStep === 2 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                    Step 2: Prizes
                  </div>
                </div>
              </div>
              <button
                onClick={handleCancelHackathon}
                className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {hackathonStep === 1 ? (
              <form onSubmit={handleCreateHackathon} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Hackathon Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hackathon Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newHackathon.name}
                    onChange={(e) => setNewHackathon({ ...newHackathon, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    placeholder="e.g., Web3 Innovation Hackathon 2025"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newHackathon.description}
                    onChange={(e) => setNewHackathon({ ...newHackathon, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    placeholder="Describe your hackathon..."
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newHackathon.start_date}
                    onChange={(e) => setNewHackathon({ ...newHackathon, start_date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newHackathon.end_date}
                    onChange={(e) => setNewHackathon({ ...newHackathon, end_date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Registration Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Registration Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newHackathon.registration_deadline}
                    onChange={(e) => setNewHackathon({ ...newHackathon, registration_deadline: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Ecosystem */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ecosystem *
                  </label>
                  <select
                    value={newHackathon.ecosystem}
                    onChange={(e) => setNewHackathon({ ...newHackathon, ecosystem: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="Ethereum">Ethereum</option>
                    <option value="Polygon">Polygon</option>
                    <option value="Solana">Solana</option>
                    <option value="Binance Smart Chain">Binance Smart Chain</option>
                    <option value="Avalanche">Avalanche</option>
                    <option value="Multi-chain">Multi-chain</option>
                  </select>
                </div>

                {/* Tech Stack */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tech Stack (comma separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newHackathon.tech_stack}
                    onChange={(e) => setNewHackathon({ ...newHackathon, tech_stack: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    placeholder="Solidity, React, Hardhat, IPFS"
                  />
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    value={newHackathon.level}
                    onChange={(e) => setNewHackathon({ ...newHackathon, level: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all">All Levels</option>
                  </select>
                </div>

                {/* Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mode *
                  </label>
                  <select
                    value={newHackathon.mode}
                    onChange={(e) => setNewHackathon({ ...newHackathon, mode: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="online">Online</option>
                    <option value="offline">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Team Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Team Size *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newHackathon.min_team_size}
                    onChange={(e) => setNewHackathon({ ...newHackathon, min_team_size: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Team Size *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newHackathon.max_team_size}
                    onChange={(e) => setNewHackathon({ ...newHackathon, max_team_size: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Banner Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <ImageIcon className="w-4 h-4 inline mr-1" />
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    value={newHackathon.banner_image}
                    onChange={(e) => setNewHackathon({ ...newHackathon, banner_image: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    placeholder="https://image-url.com/banner.jpg"
                  />
                </div>

                {/* Featured */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newHackathon.is_featured}
                      onChange={(e) => setNewHackathon({ ...newHackathon, is_featured: e.target.checked })}
                      className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-2 focus:ring-purple-500/20"
                    />
                    <span className="text-sm text-gray-300">Feature this hackathon on homepage</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleCancelHackathon}
                  className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-medium"
                >
                  Next: Add Prizes →
                </button>
              </div>
            </form>
            ) : (
              <div className="p-6 space-y-6">
                {/* Prize Form */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Add Prize
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Position *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentPrize.position}
                        onChange={(e) => setCurrentPrize({ ...currentPrize, position: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prize Title *
                      </label>
                      <input
                        type="text"
                        value={currentPrize.title}
                        onChange={(e) => setCurrentPrize({ ...currentPrize, title: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                        placeholder="e.g., First Place"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Amount (USD) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentPrize.amount}
                        onChange={(e) => setCurrentPrize({ ...currentPrize, amount: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                        placeholder="10000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={currentPrize.description}
                        onChange={(e) => setCurrentPrize({ ...currentPrize, description: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                        placeholder="Best overall project"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Evaluation Criteria
                      </label>
                      <textarea
                        rows={2}
                        value={currentPrize.evaluation_criteria}
                        onChange={(e) => setCurrentPrize({ ...currentPrize, evaluation_criteria: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                        placeholder="Innovation, technical implementation, impact..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Assign Judges
                      </label>
                      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto">
                        {availableJudges.length === 0 ? (
                          <p className="text-gray-500 text-sm">No judges available</p>
                        ) : (
                          <div className="space-y-2">
                            {availableJudges.map((judge) => (
                              <label key={judge.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={currentPrize.judge_ids.includes(judge.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCurrentPrize({ ...currentPrize, judge_ids: [...currentPrize.judge_ids, judge.id] });
                                    } else {
                                      setCurrentPrize({ ...currentPrize, judge_ids: currentPrize.judge_ids.filter(id => id !== judge.id) });
                                    }
                                  }}
                                  className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-purple-600"
                                />
                                <span className="text-sm text-gray-300">{judge.full_name} ({judge.email})</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPrize}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Prize
                  </button>
                </div>

                {/* Added Prizes List */}
                {prizes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Added Prizes ({prizes.length})
                    </h3>
                    {prizes.map((prize, index) => (
                      <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">
                                #{prize.position}
                              </span>
                              <h4 className="text-white font-semibold">{prize.title}</h4>
                              <span className="text-green-400 font-bold">${prize.amount.toLocaleString()}</span>
                            </div>
                            {prize.description && (
                              <p className="text-gray-400 text-sm mb-2">{prize.description}</p>
                            )}
                            {prize.evaluation_criteria && (
                              <p className="text-gray-500 text-xs mb-2">
                                <Target className="w-3 h-3 inline mr-1" />
                                {prize.evaluation_criteria}
                              </p>
                            )}
                            {prize.judge_ids.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <Users className="w-3 h-3 text-gray-500" />
                                {prize.judge_ids.map(judgeId => {
                                  const judge = availableJudges.find(j => j.id === judgeId);
                                  return judge ? (
                                    <span key={judgeId} className="px-2 py-0.5 bg-blue-600/20 text-blue-300 text-xs rounded">
                                      {judge.full_name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemovePrize(index)}
                            className="p-1 hover:bg-red-600/20 rounded text-red-400 hover:text-red-300 transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={handleCancelHackathon}
                    className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishHackathon}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-medium"
                  >
                    Finish & Create Hackathon
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
