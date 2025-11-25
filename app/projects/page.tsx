'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { Code, Search, Filter, Github, ExternalLink, Tag, Users, Calendar, Trophy } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  github_url: string;
  demo_url: string;
  video_url: string;
  tags: string[];
  submitted_at: string;
  hackathon_name: string;
  team_members: Array<{ id: number; name: string }>;
  is_public: boolean;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, selectedTag, projects]);

  const fetchProjects = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log('Fetching projects from:', `${apiUrl}/api/projects`);
      const res = await fetch(`${apiUrl}/api/projects`);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Projects fetched:', data.length, 'projects');
        setProjects(data);
        setFilteredProjects(data);
      } else {
        console.error('Failed to fetch projects:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.hackathon_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(project =>
        project.tags && project.tags.includes(selectedTag)
      );
    }

    setFilteredProjects(filtered);
  };

  // Get all unique tags
  const allTags = Array.from(new Set(projects.flatMap(p => p.tags || []))).filter(Boolean);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar />
        <div className="ml-64 flex-1 flex flex-col">
          <TopNav />
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <TopNav />
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Code className="w-10 h-10 text-blue-400" />
              Project Archive
            </h1>
            <p className="text-gray-400">Explore innovative projects built during hackathons</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Tag Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(searchTerm || selectedTag) && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-400">Active filters:</span>
                {searchTerm && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-2">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="hover:text-blue-200">×</button>
                  </span>
                )}
                {selectedTag && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-2">
                    Tag: {selectedTag}
                    <button onClick={() => setSelectedTag('')} className="hover:text-purple-200">×</button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-400">
              Showing <span className="text-white font-semibold">{filteredProjects.length}</span> of <span className="text-white font-semibold">{projects.length}</span> projects
            </p>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <Code className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Projects Found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition group cursor-pointer"
                  onClick={() => window.location.href = `/projects/${project.id}`}
                >
                  {/* Project Image */}
                  {project.video_url ? (
                    <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <Code className="w-16 h-16 text-blue-400/50" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <Code className="w-16 h-16 text-gray-700" />
                    </div>
                  )}

                  {/* Project Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition line-clamp-1">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>

                    {/* Hackathon Badge */}
                    {project.hackathon_name && (
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                          <Trophy className="w-3 h-3" />
                          {project.hackathon_name}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-white transition"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-white transition"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                      {project.team_members && project.team_members.length > 0 && (
                        <div className="ml-auto flex items-center gap-1 text-gray-400 text-sm">
                          <Users className="w-4 h-4" />
                          {project.team_members.length}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
