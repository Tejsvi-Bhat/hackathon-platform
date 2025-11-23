'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import { ChevronLeft, ChevronRight, Calendar, Users, Trophy, Code, MapPin, Clock, ArrowRight } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
  is_featured: boolean;
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState(true);
  const [filters, setFilters] = useState({
    prizeRange: 'all',
    ecosystem: 'all',
    techStack: 'all',
    status: 'all',
  });

  useEffect(() => {
    fetchHackathons();
    
    // Check URL parameters for login/register triggers
    if (searchParams.get('login') === 'true') {
      setLoginMode(true);
      setShowLoginModal(true);
    } else if (searchParams.get('register') === 'true') {
      setLoginMode(false);
      setShowLoginModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [hackathons, filters]);

  const fetchHackathons = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/hackathons`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setHackathons(data);
      }
    } catch (error) {
      console.error('Failed to fetch hackathons:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...hackathons];

    if (filters.prizeRange !== 'all') {
      const ranges: { [key: string]: [number, number] } = {
        '0-10k': [0, 10000],
        '10k-50k': [10000, 50000],
        '50k+': [50000, Infinity],
      };
      const [min, max] = ranges[filters.prizeRange] || [0, Infinity];
      filtered = filtered.filter(h => h.total_prize_pool >= min && h.total_prize_pool < max);
    }

    if (filters.ecosystem !== 'all') {
      filtered = filtered.filter(h => h.ecosystem === filters.ecosystem);
    }

    if (filters.techStack !== 'all') {
      filtered = filtered.filter(h => h.tech_stack?.includes(filters.techStack));
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(h => h.status === filters.status);
    }

    setFilteredHackathons(filtered);
  };

  const featuredHackathons = hackathons.filter(h => h.is_featured && h.status === 'upcoming').slice(0, 3);

  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % featuredHackathons.length);
  };

  const prevFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + featuredHackathons.length) % featuredHackathons.length);
  };

  const getTimeLeft = (deadline: string) => {
    const now = new Date().getTime();
    const deadlineDate = new Date(deadline).getTime();
    const diff = deadlineDate - now;

    if (diff <= 0) return 'Registration closed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h left`;
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      beginner: 'bg-green-500/20 text-green-400 border-green-500/50',
      intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      advanced: 'bg-red-500/20 text-red-400 border-red-500/50',
      all: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    };
    return colors[level] || colors.all;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      upcoming: 'bg-blue-500/20 text-blue-400',
      ongoing: 'bg-green-500/20 text-green-400',
      completed: 'bg-gray-500/20 text-gray-400',
    };
    return colors[status] || colors.upcoming;
  };

  const featured = featuredHackathons[featuredIndex];

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        <TopNav 
          onOpenLogin={() => setShowLoginModal(true)}
          showLoginModal={showLoginModal}
          onCloseLoginModal={() => setShowLoginModal(false)}
          initialLoginMode={loginMode}
        />
        
        <main className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Explore Hackathons
            </h1>
            <p className="text-gray-400 text-lg">
              Join blockchain hackathons, showcase your skills, and win amazing prizes
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-4">
            <select
              value={filters.prizeRange}
              onChange={(e) => setFilters({ ...filters, prizeRange: e.target.value })}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Total Prize: All</option>
              <option value="0-10k">$0 - $10K</option>
              <option value="10k-50k">$10K - $50K</option>
              <option value="50k+">$50K+</option>
            </select>

            <select
              value={filters.ecosystem}
              onChange={(e) => setFilters({ ...filters, ecosystem: e.target.value })}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Ecosystem: All</option>
              <option value="Ethereum">Ethereum</option>
              <option value="Polygon">Polygon</option>
              <option value="Binance Smart Chain">BSC</option>
              <option value="Solana">Solana</option>
            </select>

            <select
              value={filters.techStack}
              onChange={(e) => setFilters({ ...filters, techStack: e.target.value })}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tech Stack: All</option>
              <option value="Solidity">Solidity</option>
              <option value="React">React</option>
              <option value="Python">Python</option>
              <option value="Node.js">Node.js</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Status: All</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Featured Hackathons Carousel */}
          {featured && (
            <div className="mb-12 relative">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-pink-900/50 border border-gray-800">
                {/* Featured Tag */}
                <div className="absolute top-6 left-6 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg z-10">
                  ⭐ FEATURED
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                  }}></div>
                </div>

                <div className="relative p-8 md:p-12">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Left: Info */}
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {featured.name}
                      </h3>
                      <p className="text-lg text-blue-300 font-medium mb-4">
                        {featured.ecosystem}
                      </p>
                      <p className="text-gray-300 text-lg mb-6 line-clamp-3">
                        {featured.description}
                      </p>
                    </div>

                    {/* Right: Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900/70 backdrop-blur border border-gray-700 rounded-xl p-4">
                        <Calendar className="w-5 h-5 text-blue-400 mb-2" />
                        <p className="text-xs text-gray-400 mb-1">Registration</p>
                        <p className="text-sm font-semibold text-white">
                          {getTimeLeft(featured.registration_deadline)}
                        </p>
                      </div>

                      <div className="bg-gray-900/70 backdrop-blur border border-gray-700 rounded-xl p-4">
                        <Code className="w-5 h-5 text-purple-400 mb-2" />
                        <p className="text-xs text-gray-400 mb-1">Tech Stack</p>
                        <p className="text-sm font-semibold text-white">
                          {featured.tech_stack?.[0] || 'Multiple'}
                        </p>
                      </div>

                      <div className="bg-gray-900/70 backdrop-blur border border-gray-700 rounded-xl p-4">
                        <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
                        <p className="text-xs text-gray-400 mb-1">Total Prize</p>
                        <p className="text-sm font-semibold text-white">
                          ${featured.total_prize_pool?.toLocaleString() || '0'}
                        </p>
                      </div>

                      <div className="bg-gray-900/70 backdrop-blur border border-gray-700 rounded-xl p-4">
                        <Users className="w-5 h-5 text-green-400 mb-2" />
                        <p className="text-xs text-gray-400 mb-1">Level</p>
                        <p className="text-sm font-semibold text-white capitalize">
                          {featured.level}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Register Button */}
                  <div className="mt-8 flex items-center gap-4">
                    <a
                      href={`/hackathons/${featured.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                      Register Now
                      <ArrowRight className="w-5 h-5" />
                    </a>
                    <span className="text-gray-400 text-sm">
                      {featured.participant_count} participants
                    </span>
                  </div>
                </div>

                {/* Carousel Controls */}
                {featuredHackathons.length > 1 && (
                  <>
                    <button
                      onClick={prevFeatured}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-900/80 hover:bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-white transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextFeatured}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-900/80 hover:bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-white transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Dots */}
                {featuredHackathons.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {featuredHackathons.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFeaturedIndex(idx)}
                        className={`w-2 h-2 rounded-full transition ${
                          idx === featuredIndex ? 'bg-blue-500 w-8' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hackathons List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              All Hackathons ({filteredHackathons.length})
            </h2>

            {filteredHackathons.map((hackathon) => (
              <div
                key={hackathon.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition group"
              >
                <div className="grid md:grid-cols-12 gap-6">
                  {/* Column 1: Basic Info */}
                  <div className="md:col-span-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                        {hackathon.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hackathon.status)}`}>
                        {hackathon.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {hackathon.description}
                    </p>
                    <div className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                      {hackathon.ecosystem}
                    </div>
                  </div>

                  {/* Column 2: Details */}
                  <div className="md:col-span-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Registration:</span>
                      <span className="text-white font-medium">
                        {getTimeLeft(hackathon.registration_deadline)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {hackathon.tech_stack?.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-2 py-1 border rounded text-xs ${getLevelColor(hackathon.level)}`}>
                        {hackathon.level}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <MapPin className="w-4 h-4" />
                        {hackathon.mode}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Users className="w-4 h-4" />
                        {hackathon.participant_count} participants
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-500 font-bold text-lg">
                        ${hackathon.total_prize_pool?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Column 3: Summary & Action */}
                  <div className="md:col-span-3 flex flex-col items-end justify-between">
                    <div className="text-right">
                      <p className="text-gray-400 text-sm mb-1">Prize Pool</p>
                      <p className="text-white font-bold text-2xl">
                        ${(hackathon.total_prize_pool / 1000).toFixed(0)}K
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(hackathon.start_date).toLocaleDateString()} -
                        {new Date(hackathon.end_date).toLocaleDateString()}
                      </p>
                    </div>

                    <a
                      href={`/hackathons/${hackathon.id}`}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {filteredHackathons.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No hackathons found matching your filters</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
