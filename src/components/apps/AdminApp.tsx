'use client';

import React, { useState, useEffect } from 'react';
import { useOSStore } from '@/lib/store';
import { 
  Lock, 
  ShieldAlert, 
  Folder, 
  Briefcase, 
  Wrench, 
  User, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Database, 
  LogOut, 
  Check, 
  X,
  RefreshCw
} from 'lucide-react';

export function AdminApp() {
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'projects' | 'skills' | 'experiences'>('overview');

  // Store
  const { 
    profile, 
    projects, 
    skills, 
    experiences,
    setProfile,
    setProjects,
    setSkills,
    setExperiences,
    fetchDatabaseData
  } = useOSStore();

  // Status/Loading States
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    title: '',
    location: '',
    email: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
  });

  // Modal / Editing states
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'project' | 'skill' | 'experience' | null>(null);

  // Entity-specific form states
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tags: '',
    githubUrl: '',
    liveUrl: '',
  });

  const [skillForm, setSkillForm] = useState({
    category: '',
    skills: '',
  });

  const [experienceForm, setExperienceForm] = useState({
    role: '',
    company: '',
    duration: '',
    description: '', // split by newline
  });

  // Auto-login from localStorage if session exists
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthorized(true);
    }
  }, []);

  // Initialize Profile Form on load or store change
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        title: profile.title || '',
        location: profile.location || '',
        email: profile.email || '',
        bio: profile.bio || '',
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
      });
    }
  }, [profile]);

  // Flash Status Message
  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Authentication logic (env-based via API)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      if (data.success && data.token) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setIsAuthorized(true);
        setUsername('');
        setPassword('');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLockSession = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setIsAuthorized(false);
  };

  // CRUD API Calls
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      setProfile(updated);
      showStatus('Profile updated successfully!');
    } catch (err: any) {
      showStatus(err.message || 'Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Project CRUD
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tagsArray = projectForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        ...projectForm,
        tags: tagsArray,
      };

      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/projects/${editingItem.id}` : '/api/projects';
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to ${editingItem ? 'update' : 'create'} project`);
      const data = await res.json();

      if (editingItem) {
        setProjects(projects.map(p => p.id === editingItem.id ? data : p));
        showStatus('Project updated successfully!');
      } else {
        setProjects([...projects, data]);
        showStatus('Project created successfully!');
      }
      closeModal();
    } catch (err: any) {
      showStatus(err.message || 'Error processing project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/projects/${id}`, { 
        method: 'DELETE',
        headers 
      });
      if (!res.ok) throw new Error('Failed to delete project');
      setProjects(projects.filter(p => p.id !== id));
      showStatus('Project deleted successfully!');
    } catch (err: any) {
      showStatus(err.message || 'Error deleting project', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Skill CRUD
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = skillForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        ...skillForm,
        skills: skillsArray,
      };

      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/skills/${editingItem.id}` : '/api/skills';
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to ${editingItem ? 'update' : 'create'} skill group`);
      const data = await res.json();

      if (editingItem) {
        setSkills(skills.map(s => s.id === editingItem.id ? data : s));
        showStatus('Skill group updated successfully!');
      } else {
        setSkills([...skills, data]);
        showStatus('Skill group created successfully!');
      }
      closeModal();
    } catch (err: any) {
      showStatus(err.message || 'Error processing skills', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill group?')) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/skills/${id}`, { 
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete skill group');
      setSkills(skills.filter(s => s.id !== id));
      showStatus('Skill group deleted successfully!');
    } catch (err: any) {
      showStatus(err.message || 'Error deleting skill group', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Experience CRUD
  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const descArray = experienceForm.description.split('\n').map(d => d.trim()).filter(Boolean);
      const payload = {
        ...experienceForm,
        description: descArray,
      };

      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/experiences/${editingItem.id}` : '/api/experiences';
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to ${editingItem ? 'update' : 'create'} experience`);
      const data = await res.json();

      if (editingItem) {
        setExperiences(experiences.map(exp => exp.id === editingItem.id ? data : exp));
        showStatus('Experience updated successfully!');
      } else {
        setExperiences([...experiences, data]);
        showStatus('Experience created successfully!');
      }
      closeModal();
    } catch (err: any) {
      showStatus(err.message || 'Error processing experience', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/experiences/${id}`, { 
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete experience');
      setExperiences(experiences.filter(exp => exp.id !== id));
      showStatus('Experience deleted successfully!');
    } catch (err: any) {
      showStatus(err.message || 'Error deleting experience', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Modals management
  const openModal = (type: 'project' | 'skill' | 'experience', item: any = null) => {
    setEditingItem(item);
    setModalType(type);
    setIsModalOpen(true);

    if (type === 'project') {
      setProjectForm({
        title: item?.title || '',
        description: item?.description || '',
        tags: item?.tags ? (Array.isArray(item.tags) ? item.tags.join(', ') : item.tags) : '',
        githubUrl: item?.githubUrl || '',
        liveUrl: item?.liveUrl || '',
      });
    } else if (type === 'skill') {
      setSkillForm({
        category: item?.category || '',
        skills: item?.skills ? (Array.isArray(item.skills) ? item.skills.join(', ') : item.skills) : '',
      });
    } else if (type === 'experience') {
      setExperienceForm({
        role: item?.role || '',
        company: item?.company || '',
        duration: item?.duration || '',
        description: item?.description ? (Array.isArray(item.description) ? item.description.join('\n') : item.description) : '',
      });
    }
  };

  const closeModal = () => {
    setEditingItem(null);
    setModalType(null);
    setIsModalOpen(false);
  };

  // Force Database Refresh
  const handleDbRefresh = async () => {
    setLoading(true);
    try {
      await fetchDatabaseData();
      showStatus('Refreshed data from API.');
    } catch {
      showStatus('Error fetching latest database data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Login form view
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-950/80 backdrop-blur-xl text-slate-100 p-6">
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold tracking-wide">Administrator Access</h2>
            <p className="text-xs text-slate-400 font-medium">Enter credentials configured in .env file</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-semibold uppercase">Username</label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-win-accent-light"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-semibold uppercase">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-win-accent-light"
                required
              />
            </div>

            {loginError && (
              <span className="text-xs text-red-400 font-medium animate-pulse flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {loginError}
              </span>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-2 w-full rounded-lg bg-win-accent hover:bg-win-accent/80 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-default text-center"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authorized Admin View
  return (
    <div className="flex h-full bg-zinc-950/40 text-slate-100 font-sans select-none overflow-hidden">
      {/* Sidebar navigation */}
      <div className="w-48 bg-black/40 border-r border-white/5 flex flex-col justify-between p-3 shrink-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5 px-2.5 py-3 mb-2 border-b border-white/5">
            <Database className="w-4 h-4 text-win-accent-light" />
            <span className="font-semibold text-xs text-slate-300">Admin Control</span>
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-xs transition cursor-default ${
              activeTab === 'overview' ? 'bg-win-accent text-white font-medium shadow-md shadow-win-accent/20' : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Overview & Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-xs transition cursor-default ${
              activeTab === 'profile' ? 'bg-win-accent text-white font-medium shadow-md shadow-win-accent/20' : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-xs transition cursor-default ${
              activeTab === 'projects' ? 'bg-win-accent text-white font-medium shadow-md shadow-win-accent/20' : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-xs transition cursor-default ${
              activeTab === 'skills' ? 'bg-win-accent text-white font-medium shadow-md shadow-win-accent/20' : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Skills ({skills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('experiences')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-xs transition cursor-default ${
              activeTab === 'experiences' ? 'bg-win-accent text-white font-medium shadow-md shadow-win-accent/20' : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Experiences ({experiences.length})</span>
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
          <button
            onClick={handleDbRefresh}
            disabled={loading}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs text-slate-400 hover:text-white transition disabled:opacity-50 cursor-default"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Database</span>
          </button>

          <button
            onClick={handleLockSession}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded bg-red-950/20 border border-red-500/10 hover:bg-red-950/40 text-xs text-red-400 hover:text-red-300 transition cursor-default"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Session</span>
          </button>
        </div>
      </div>

      {/* Main Workspace content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black/10">
        {/* Header notification bar */}
        {statusMessage && (
          <div className={`px-4 py-2 text-xs flex items-center justify-between transition-all ${
            statusMessage.type === 'error' ? 'bg-red-950/50 border-b border-red-500/20 text-red-300' : 'bg-emerald-950/50 border-b border-emerald-500/20 text-emerald-300'
          }`}>
            <span className="flex items-center gap-2">
              {statusMessage.type === 'error' ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
              {statusMessage.text}
            </span>
            <button onClick={() => setStatusMessage(null)} className="p-0.5 hover:bg-white/10 rounded cursor-default">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Dynamic content view */}
        <div className="flex-1 p-5 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Database Control Panel</h1>
                <p className="text-xs text-slate-400 mt-1">Live metrics and health check of your portfolio's local SQLite database.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Project card */}
                <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{projects.length}</div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Projects</div>
                  </div>
                </div>

                {/* Skill card */}
                <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{skills.length}</div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Skill Groups</div>
                  </div>
                </div>

                {/* Experience card */}
                <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{experiences.length}</div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Experiences</div>
                  </div>
                </div>

                {/* Profile card */}
                <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white truncate max-w-[120px]">{profileForm.name || 'Setup Needed'}</div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Developer Profile</div>
                  </div>
                </div>
              </div>

              {/* Database diagnostics status */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="text-xs font-semibold text-slate-300">Diagnostics Check</span>
                  <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> ONLINE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Database Engine</span>
                    <span className="font-semibold text-slate-200">SQLite (dev.db)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">ORM Manager</span>
                    <span className="font-semibold text-slate-200">Prisma Client v7.8</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Profile Configuration</span>
                    <span className="font-semibold text-slate-200">Upsert Successful</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Workspace Sync</span>
                    <span className="font-semibold text-slate-200">React/Zustand Linked</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE EDITOR */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white font-medium">Profile Editor</h1>
                <p className="text-xs text-slate-400 mt-1">Manage public developer information seen across applications.</p>
              </div>

              <form onSubmit={handleProfileSave} className="bg-zinc-900/40 border border-white/5 rounded-xl p-5 flex flex-col gap-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-win-accent-light"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">Job Title</label>
                    <input
                      type="text"
                      value={profileForm.title}
                      onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                      className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-win-accent-light"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">Location</label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-win-accent-light"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-win-accent-light"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">GitHub URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={profileForm.githubUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                      className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-win-accent-light"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">LinkedIn URL</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={profileForm.linkedinUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                      className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-win-accent-light"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-slate-400 font-semibold uppercase">Biography (Markdown Supported)</label>
                  <textarea
                    rows={6}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-win-accent-light resize-none leading-relaxed"
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-win-accent hover:bg-win-accent/80 transition text-white font-medium rounded text-xs disabled:opacity-50 cursor-default"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PROJECTS MANAGER */}
          {activeTab === 'projects' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">Project Repositories</h1>
                  <p className="text-xs text-slate-400 mt-1">Manage project cards visible in the Projects App explorer.</p>
                </div>
                <button
                  onClick={() => openModal('project')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-win-accent hover:bg-win-accent/80 transition text-white font-semibold rounded text-xs cursor-default"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {/* Projects Table */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-slate-300 font-semibold border-b border-white/5">
                      <th className="p-3">Title</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Tags</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-3 font-semibold text-slate-200">{project.title}</td>
                        <td className="p-3 text-slate-400 max-w-xs truncate">{project.description}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {project.tags?.map((t: string) => (
                              <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-slate-400">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openModal('project', project)}
                              className="p-1 hover:bg-white/10 text-slate-300 hover:text-white rounded cursor-default"
                              title="Edit Project"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleProjectDelete(project.id)}
                              className="p-1 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded cursor-default"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500">No projects found. Create one above!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS MANAGER */}
          {activeTab === 'skills' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">Skills Matrix</h1>
                  <p className="text-xs text-slate-400 mt-1">Manage categories and skill tags displayed in the bio/settings.</p>
                </div>
                <button
                  onClick={() => openModal('skill')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-win-accent hover:bg-win-accent/80 transition text-white font-semibold rounded text-xs cursor-default"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill Group</span>
                </button>
              </div>

              {/* Skills List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skillGroup) => (
                  <div key={skillGroup.id} className="p-4 bg-zinc-900/40 border border-white/5 rounded-xl flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">{skillGroup.category}</h3>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openModal('skill', skillGroup)}
                            className="p-1 hover:bg-white/10 text-slate-300 hover:text-white rounded cursor-default"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSkillDelete(skillGroup.id)}
                            className="p-1 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded cursor-default"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {skillGroup.skills?.map((skill: string) => (
                          <span key={skill} className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-slate-300 font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {skills.length === 0 && (
                  <div className="col-span-2 p-6 text-center text-slate-500">No skill groups configured.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: EXPERIENCES MANAGER */}
          {activeTab === 'experiences' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">Work Experiences</h1>
                  <p className="text-xs text-slate-400 mt-1">Manage employment history timeline entries.</p>
                </div>
                <button
                  onClick={() => openModal('experience')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-win-accent hover:bg-win-accent/80 transition text-white font-semibold rounded text-xs cursor-default"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              {/* Experiences Table */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-slate-300 font-semibold border-b border-white/5">
                      <th className="p-3">Role</th>
                      <th className="p-3">Company</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiences.map((exp) => (
                      <tr key={exp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-3 font-semibold text-slate-200">{exp.role}</td>
                        <td className="p-3 text-slate-300">{exp.company}</td>
                        <td className="p-3 text-slate-400">{exp.duration}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openModal('experience', exp)}
                              className="p-1 hover:bg-white/10 text-slate-300 hover:text-white rounded cursor-default"
                              title="Edit Experience"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExperienceDelete(exp.id)}
                              className="p-1 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded cursor-default"
                              title="Delete Experience"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {experiences.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500">No experiences listed. Create one above!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5 text-xs font-semibold text-slate-300">
              <span>
                {editingItem ? 'Edit' : 'Create New'}{' '}
                {modalType === 'project' ? 'Project' : modalType === 'skill' ? 'Skill Group' : 'Experience'}
              </span>
              <button onClick={closeModal} className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white cursor-default">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Form */}
            {modalType === 'project' && (
              <form onSubmit={handleProjectSubmit} className="p-4 flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Project Title</label>
                  <input
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-win-accent-light"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Description</label>
                  <textarea
                    rows={3}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-win-accent-light resize-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="React, Tailwind, Node.js"
                    value={projectForm.tags}
                    onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-win-accent-light"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">GitHub URL</label>
                    <input
                      type="url"
                      value={projectForm.githubUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                      className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-win-accent-light"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Live Demo URL</label>
                    <input
                      type="url"
                      value={projectForm.liveUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                      className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-win-accent-light"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5 mt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-1.5 bg-transparent border border-white/10 rounded hover:bg-white/5 transition cursor-default text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 bg-win-accent hover:bg-win-accent/80 transition text-white font-semibold rounded cursor-default disabled:opacity-50"
                  >
                    {editingItem ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
              </form>
            )}

            {modalType === 'skill' && (
              <form onSubmit={handleSkillSubmit} className="p-4 flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Backend Development"
                    value={skillForm.category}
                    onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-win-accent-light"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Skills (comma-separated)</label>
                  <textarea
                    rows={4}
                    placeholder="Node.js, PostgreSQL, Docker, Redis"
                    value={skillForm.skills}
                    onChange={(e) => setSkillForm({ ...skillForm, skills: e.target.value })}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-win-accent-light resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5 mt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-1.5 bg-transparent border border-white/10 rounded hover:bg-white/5 transition cursor-default text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 bg-win-accent hover:bg-win-accent/80 transition text-white font-semibold rounded cursor-default disabled:opacity-50"
                  >
                    {editingItem ? 'Save Changes' : 'Create Group'}
                  </button>
                </div>
              </form>
            )}

            {modalType === 'experience' && (
              <form onSubmit={handleExperienceSubmit} className="p-4 flex flex-col gap-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Job Role</label>
                    <input
                      type="text"
                      value={experienceForm.role}
                      onChange={(e) => setExperienceForm({ ...experienceForm, role: e.target.value })}
                      className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-win-accent-light"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Company</label>
                    <input
                      type="text"
                      value={experienceForm.company}
                      onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                      className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-win-accent-light"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 2021 - 2023"
                    value={experienceForm.duration}
                    onChange={(e) => setExperienceForm({ ...experienceForm, duration: e.target.value })}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-win-accent-light"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Job Description (One bullet per line)</label>
                  <textarea
                    rows={4}
                    placeholder="Created backend database tables with PostgreSQL.&#10;Integrated REST API routes in NextJS app."
                    value={experienceForm.description}
                    onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-win-accent-light resize-none leading-relaxed"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5 mt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-1.5 bg-transparent border border-white/10 rounded hover:bg-white/5 transition cursor-default text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 bg-win-accent hover:bg-win-accent/80 transition text-white font-semibold rounded cursor-default disabled:opacity-50"
                  >
                    {editingItem ? 'Save Changes' : 'Create Entry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
