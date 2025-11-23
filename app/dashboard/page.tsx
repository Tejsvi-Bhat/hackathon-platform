'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const [statsRes, notifRes] = await Promise.all([
        fetch('http://localhost:3001/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-2xl font-bold text-blue-600">🚀 Hackathon Platform</Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.fullName}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {user.role === 'hacker' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Hackathons Registered</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.hackathonsRegistered || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Projects Submitted</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.projectsSubmitted || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Wins / Top 3</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.wins || 0}</p>
              </div>
            </>
          )}

          {user.role === 'judge' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Hackathons Judging</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.hackathonsJudging || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Projects Scored</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.projectsScored || 0}</p>
              </div>
            </>
          )}

          {user.role === 'organizer' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Hackathons Organized</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.hackathonsOrganized || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Total Participants</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalParticipants || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Total Projects</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProjects || 0}</p>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Browse Hackathons
            </Link>
            
            {user.role === 'organizer' && (
              <Link href="/hackathons/create" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Create Hackathon
              </Link>
            )}
            
            {user.role === 'hacker' && (
              <Link href="/projects/submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                Submit Project
              </Link>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif.id} className={`p-4 ${notif.is_read ? 'bg-white' : 'bg-blue-50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      {notif.hackathon_name && (
                        <p className="text-xs text-gray-500 mt-1">Hackathon: {notif.hackathon_name}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-gray-500">No notifications yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
