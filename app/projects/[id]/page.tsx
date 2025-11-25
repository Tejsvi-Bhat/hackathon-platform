'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import TopNav from '../../components/TopNav';
import { 
  Code, 
  ExternalLink, 
  Github, 
  Users, 
  Calendar, 
  Trophy, 
  Edit, 
  Save, 
  X, 
  UserPlus, 
  Eye, 
  EyeOff,
  Send,
  Award,
  Sparkles,
  Target,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  github_url?: string;
  demo_url?: string;
  video_url?: string;
  tags: string[];
  submitted_at: string;
  hackathon_name?: string;
  hackathon_id?: number;
  is_public: boolean;
  team_members: Array<{
    id: number;
    name: string;
    role?: string;
  }>;
}

interface Score {
  id: number;
  technical_score: number;
  innovation_score: number;
  presentation_score: number;
  impact_score: number;
  total_score: number;
  feedback?: string;
  scored_at: string;
}

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'organizer' | 'participant' | 'judge';
}

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [canScore, setCanScore] = useState(false);
  const [existingScore, setExistingScore] = useState<Score | null>(null);
  const [averageScore, setAverageScore] = useState<number | null>(null);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editedProject, setEditedProject] = useState<Partial<Project>>({});

  // Score mode state
  const [scoreMode, setScoreMode] = useState(false);
  const [scores, setScores] = useState({
    technical_score: 0,
    innovation_score: 0,
    presentation_score: 0,
    impact_score: 0,
    feedback: ''
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch user data
      if (token) {
        const userRes = await fetch(`${apiUrl}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }
      }

      // Fetch project data
      const projectRes = await fetch(`${apiUrl}/api/projects/${projectId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!projectRes.ok) {
        throw new Error('Project not found');
      }

      const projectData = await projectRes.json();
      setProject(projectData);

      // Check if user is creator
      if (token && projectData.team_members) {
        const userRes = await fetch(`${apiUrl}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          const isMember = projectData.team_members.some(
            (member: any) => member.id === userData.id
          );
          setIsCreator(isMember);
        }
      }

      // Check if user can score (judge)
      if (token && projectData.hackathon_id) {
        const canScoreRes = await fetch(
          `${apiUrl}/api/projects/${projectId}/can-score`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        if (canScoreRes.ok) {
          const { canScore, existingScore } = await canScoreRes.json();
          setCanScore(canScore);
          if (existingScore) {
            setExistingScore(existingScore);
            setScores({
              technical_score: existingScore.technical_score,
              innovation_score: existingScore.innovation_score,
              presentation_score: existingScore.presentation_score,
              impact_score: existingScore.impact_score,
              feedback: existingScore.feedback || ''
            });
          }
        }
      }

      // Fetch average score
      const avgRes = await fetch(`${apiUrl}/api/projects/${projectId}/average-score`);
      if (avgRes.ok) {
        const { average_score } = await avgRes.json();
        setAverageScore(average_score);
      }

    } catch (error) {
      console.error('Error fetching project:', error);
      alert('Failed to load project');
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (!editMode) {
      setEditedProject({
        name: project?.name,
        description: project?.description,
        github_url: project?.github_url,
        demo_url: project?.demo_url,
        video_url: project?.video_url,
        tags: project?.tags || []
      });
    }
    setEditMode(!editMode);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedProject)
      });

      if (!res.ok) throw new Error('Failed to update project');

      alert('Project updated successfully!');
      setEditMode(false);
      fetchProjectData();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_public: !project?.is_public })
      });

      if (!res.ok) throw new Error('Failed to update visibility');

      alert('Project visibility updated!');
      fetchProjectData();
    } catch (error) {
      console.error('Error updating visibility:', error);
      alert('Failed to update visibility');
    }
  };

  const handleSubmitScore = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scores)
      });

      if (!res.ok) throw new Error('Failed to submit score');

      alert('Score submitted successfully!');
      setScoreMode(false);
      fetchProjectData();
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1">
          <TopNav />
          <main className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1">
          <TopNav />
          <main className="p-8">
            <div className="text-center">
              <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl text-gray-400">Project not found</h2>
              <Link href="/projects" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
                ← Back to Projects
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const totalScore = scores.technical_score + scores.innovation_score + 
                     scores.presentation_score + scores.impact_score;

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1">
        <TopNav />
        <main className="p-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/projects" className="text-blue-400 hover:text-blue-300 text-sm">
              ← Back to Projects
            </Link>
          </div>

          {/* Project Header */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {editMode ? (
                  <input
                    type="text"
                    value={editedProject.name}
                    onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                    className="text-3xl font-bold text-white bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
                )}
                
                {project.hackathon_name && (
                  <div className="flex items-center gap-2 text-purple-400 text-sm mt-2">
                    <Trophy className="w-4 h-4" />
                    <Link 
                      href={`/hackathons/${project.hackathon_id}`}
                      className="hover:underline"
                    >
                      {project.hackathon_name}
                    </Link>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isCreator && (
                  <>
                    {editMode ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleEditToggle}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={handleToggleVisibility}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                        >
                          {project.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          {project.is_public ? 'Public' : 'Private'}
                        </button>
                      </>
                    )}
                  </>
                )}

                {canScore && !isCreator && (
                  <button
                    onClick={() => setScoreMode(!scoreMode)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    {existingScore ? 'Edit Score' : 'Score Project'}
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            {editMode ? (
              <textarea
                value={editedProject.description}
                onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                rows={4}
                className="w-full text-gray-300 bg-gray-800 border border-gray-700 rounded px-3 py-2"
              />
            ) : (
              <p className="text-gray-300 mb-4">{project.description}</p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(editMode ? editedProject.tags : project.tags)?.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              {(editMode ? editedProject.github_url : project.github_url) && (
                editMode ? (
                  <input
                    type="url"
                    placeholder="GitHub URL"
                    value={editedProject.github_url}
                    onChange={(e) => setEditedProject({ ...editedProject, github_url: e.target.value })}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                ) : (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )
              )}
              
              {(editMode ? editedProject.demo_url : project.demo_url) && (
                editMode ? (
                  <input
                    type="url"
                    placeholder="Demo URL"
                    value={editedProject.demo_url}
                    onChange={(e) => setEditedProject({ ...editedProject, demo_url: e.target.value })}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                ) : (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </a>
                )
              )}
            </div>

            {/* Submitted Date */}
            <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
              <Calendar className="w-4 h-4" />
              Submitted {new Date(project.submitted_at).toLocaleDateString()}
            </div>

            {/* Average Score Display */}
            {averageScore !== null && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">Average Score: {averageScore.toFixed(1)} / 400</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column - Team Members */}
            <div className="md:col-span-1">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Members
                  </h2>
                  {isCreator && !editMode && (
                    <button className="text-blue-400 hover:text-blue-300">
                      <UserPlus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {project.team_members?.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <div className="text-white font-medium">{member.name || 'Unknown User'}</div>
                        {member.role && (
                          <div className="text-gray-400 text-sm">{member.role}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Scoring Interface or Additional Info */}
            <div className="md:col-span-2">
              {scoreMode && canScore ? (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Score Project
                  </h2>

                  <div className="space-y-6">
                    {/* Technical Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white flex items-center gap-2">
                          <Code className="w-4 h-4 text-blue-400" />
                          Technical Implementation
                        </label>
                        <span className="text-blue-400 font-semibold">{scores.technical_score}/100</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={scores.technical_score}
                        onChange={(e) => setScores({ ...scores, technical_score: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Innovation Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          Innovation & Creativity
                        </label>
                        <span className="text-purple-400 font-semibold">{scores.innovation_score}/100</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={scores.innovation_score}
                        onChange={(e) => setScores({ ...scores, innovation_score: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Presentation Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-400" />
                          Presentation & Demo
                        </label>
                        <span className="text-green-400 font-semibold">{scores.presentation_score}/100</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={scores.presentation_score}
                        onChange={(e) => setScores({ ...scores, presentation_score: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Impact Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-orange-400" />
                          Impact & Usefulness
                        </label>
                        <span className="text-orange-400 font-semibold">{scores.impact_score}/100</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={scores.impact_score}
                        onChange={(e) => setScores({ ...scores, impact_score: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Total Score */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Total Score</div>
                        <div className="text-3xl font-bold text-blue-400">{totalScore} / 400</div>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="text-white mb-2 block flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Feedback (Optional)
                      </label>
                      <textarea
                        value={scores.feedback}
                        onChange={(e) => setScores({ ...scores, feedback: e.target.value })}
                        rows={4}
                        placeholder="Provide constructive feedback for the team..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleSubmitScore}
                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 font-semibold"
                      >
                        <Send className="w-4 h-4" />
                        Submit Score
                      </button>
                      <button
                        onClick={() => setScoreMode(false)}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : existingScore && canScore ? (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Your Score
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Technical</div>
                      <div className="text-2xl font-bold text-blue-400">{existingScore.technical_score}</div>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Innovation</div>
                      <div className="text-2xl font-bold text-purple-400">{existingScore.innovation_score}</div>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Presentation</div>
                      <div className="text-2xl font-bold text-green-400">{existingScore.presentation_score}</div>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Impact</div>
                      <div className="text-2xl font-bold text-orange-400">{existingScore.impact_score}</div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-1">Total Score</div>
                      <div className="text-3xl font-bold text-blue-400">{existingScore.total_score} / 400</div>
                    </div>
                  </div>
                  {existingScore.feedback && (
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-gray-400 text-sm mb-2">Your Feedback</div>
                      <div className="text-white">{existingScore.feedback}</div>
                    </div>
                  )}
                  <div className="text-gray-500 text-sm mt-4 text-center">
                    Scored on {new Date(existingScore.scored_at).toLocaleDateString()}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
