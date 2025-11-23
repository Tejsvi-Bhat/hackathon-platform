'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { Trophy, Code, Calendar, Users, Plus, Github, ExternalLink, Tag, Image as ImageIcon, X, FolderGit, Award, Target } from 'lucide-react';

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

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    github_url: '',
    demo_url: '',
    image_url: '',
    tags: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/?login=true');
      return;
    }
    fetchDashboardData();
  }, [user]);

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
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
                  <h1 className="text-3xl font-bold mb-2">{user.full_name || user.fullName}</h1>
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

          {/* Judge Dashboard - Placeholder */}
          {user.role === 'judge' && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Judge Dashboard</h2>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          )}

          {/* Organizer Dashboard - Placeholder */}
          {user.role === 'organizer' && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Organizer Dashboard</h2>
              <p className="text-gray-400">Coming soon...</p>
            </div>
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
    </div>
  );
}
