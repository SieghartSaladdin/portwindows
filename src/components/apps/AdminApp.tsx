'use client';

import React, { useState, useEffect } from 'react';
import { useOSStore } from '@/lib/store';
import { ShieldAlert, Check, X } from 'lucide-react';
import { AdminLogin } from './admin/AdminLogin';
import { AdminSidebar } from './admin/AdminSidebar';
import { OverviewTab } from './admin/OverviewTab';
import { ProfileEditorTab } from './admin/ProfileEditorTab';
import { ProjectsTab } from './admin/ProjectsTab';
import { SkillsTab } from './admin/SkillsTab';
import { ExperiencesTab } from './admin/ExperiencesTab';
import { AdminCrudModal } from './admin/AdminCrudModal';

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
    themeMode,
    fetchDatabaseData,
    showConfirm
  } = useOSStore();

  const isDark = themeMode === 'dark';

  // Status/Loading States
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form States
  const [profileForm, setProfileForm] = useState({
    name: '',
    title: '',
    location: '',
    email: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
  });

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tags: '',
    githubUrl: '',
    liveUrl: '',
    images: '',
    featured: false,
  });

  const [skillForm, setSkillForm] = useState({
    category: '',
    skills: '',
  });

  const [experienceForm, setExperienceForm] = useState({
    role: '',
    company: '',
    duration: '',
    description: '',
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'project' | 'skill' | 'experience' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Check saved admin token
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

  // Authentication logic
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
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      setToken(data.token);
      setIsAuthorized(true);
      localStorage.setItem('admin_token', data.token);
      showStatus('Successfully logged into Developer Hub!');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleLockSession = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setIsAuthorized(false);
    showStatus('Developer Hub session locked.');
  };

  // Profile Update
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
      const imagesArray = projectForm.images.split(',').map(img => img.trim()).filter(Boolean);
      const payload = {
        ...projectForm,
        tags: tagsArray,
        images: imagesArray,
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

  const handleProjectDelete = (id: string) => {
    showConfirm('Hapus Proyek', 'Apakah Anda yakin ingin menghapus proyek ini secara permanen?', async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error('Failed to delete project');

        setProjects(projects.filter(p => p.id !== id));
        showStatus('Project deleted successfully!');
      } catch (err: any) {
        showStatus(err.message || 'Error deleting project', 'error');
      } finally {
        setLoading(false);
      }
    });
  };

  // Skill CRUD
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = skillForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        category: skillForm.category,
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
      showStatus(err.message || 'Error processing skill group', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillDelete = (id: string) => {
    showConfirm('Hapus Skill Group', 'Apakah Anda yakin ingin menghapus grup skill ini?', async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/skills/${id}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error('Failed to delete skill group');

        setSkills(skills.filter(s => s.id !== id));
        showStatus('Skill group deleted successfully!');
      } catch (err: any) {
        showStatus(err.message || 'Error deleting skill group', 'error');
      } finally {
        setLoading(false);
      }
    });
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

  const handleExperienceDelete = (id: string) => {
    showConfirm('Hapus Pengalaman Kerja', 'Apakah Anda yakin ingin menghapus entri pengalaman kerja ini?', async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/experiences/${id}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error('Failed to delete experience');

        setExperiences(experiences.filter(exp => exp.id !== id));
        showStatus('Experience deleted successfully!');
      } catch (err: any) {
        showStatus(err.message || 'Error deleting experience', 'error');
      } finally {
        setLoading(false);
      }
    });
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
        images: item?.images ? (Array.isArray(item.images) ? item.images.join(', ') : item.images) : '',
        featured: item?.featured || false,
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
      showStatus('Database synced successfully!');
    } catch (err: any) {
      showStatus('Failed to sync database', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Login form view
  if (!isAuthorized) {
    return (
      <AdminLogin
        isDark={isDark}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        loginError={loginError}
        loading={loading}
        onLoginSubmit={handleLoginSubmit}
      />
    );
  }

  // Authorized Admin View
  return (
    <div className={`flex h-full font-mono select-none overflow-hidden ${
      isDark ? 'bg-[#18181b] text-slate-100' : 'bg-[#fdfbf7] text-[#2d2a26]'
    }`}>
      {/* Sidebar navigation */}
      <AdminSidebar
        isDark={isDark}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectsCount={projects.length}
        skillsCount={skills.length}
        experiencesCount={experiences.length}
        loading={loading}
        onDbRefresh={handleDbRefresh}
        onLockSession={handleLockSession}
      />

      {/* Main Workspace content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isDark ? 'bg-zinc-950/60' : 'bg-[#fdfbf7]'}`}>
        {/* Header notification bar */}
        {statusMessage && (
          <div className={`px-4 py-2.5 text-xs flex items-center justify-between font-mono border-b-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] ${
            statusMessage.type === 'error' ? 'bg-rose-950/80 text-rose-300' : 'bg-emerald-950/80 text-emerald-300'
          }`}>
            <span className="flex items-center gap-2 font-bold">
              {statusMessage.type === 'error' ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
              {statusMessage.text}
            </span>
            <button onClick={() => setStatusMessage(null)} className="p-1 hover:bg-white/10 rounded cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Dynamic content view */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              isDark={isDark}
              projectsCount={projects.length}
              skillsCount={skills.length}
              experiencesCount={experiences.length}
              profileName={profileForm.name}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileEditorTab
              isDark={isDark}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              loading={loading}
              onProfileSave={handleProfileSave}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsTab
              isDark={isDark}
              projects={projects}
              onOpenModal={openModal}
              onProjectDelete={handleProjectDelete}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsTab
              isDark={isDark}
              skills={skills}
              onOpenModal={openModal}
              onSkillDelete={handleSkillDelete}
            />
          )}

          {activeTab === 'experiences' && (
            <ExperiencesTab
              isDark={isDark}
              experiences={experiences}
              onOpenModal={openModal}
              onExperienceDelete={handleExperienceDelete}
            />
          )}
        </div>
      </div>

      {/* CRUD MODAL */}
      <AdminCrudModal
        isDark={isDark}
        modalType={modalType}
        editingItem={editingItem}
        closeModal={closeModal}
        loading={loading}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        handleProjectSubmit={handleProjectSubmit}
        skillForm={skillForm}
        setSkillForm={setSkillForm}
        handleSkillSubmit={handleSkillSubmit}
        experienceForm={experienceForm}
        setExperienceForm={setExperienceForm}
        handleExperienceSubmit={handleExperienceSubmit}
      />
    </div>
  );
}
