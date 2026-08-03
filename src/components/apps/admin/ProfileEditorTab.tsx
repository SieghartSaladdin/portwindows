'use client';

import React from 'react';
import { Save } from 'lucide-react';

interface ProfileEditorTabProps {
  isDark: boolean;
  profileForm: {
    name: string;
    title: string;
    location: string;
    email: string;
    bio: string;
    githubUrl: string;
    linkedinUrl: string;
  };
  setProfileForm: (val: any) => void;
  loading: boolean;
  onProfileSave: (e: React.FormEvent) => void;
}

export function ProfileEditorTab({
  isDark,
  profileForm,
  setProfileForm,
  loading,
  onProfileSave,
}: ProfileEditorTabProps) {
  return (
    <div className="flex flex-col gap-5 font-mono">
      <div className="pb-3 border-b-2 border-[#2d2a26] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-lg font-bold">✏</span>
          <div>
            <h1 className={`text-base font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#2d2a26]'}`}>Profile Editor</h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Manage public developer information.</p>
          </div>
        </div>

        <span className="bg-[#fef08a] text-[#2d2a26] border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] font-extrabold rounded-full px-3 py-1 text-xs">
          ✦ Profile Form
        </span>
      </div>

      {/* Profile Form */}
      <form onSubmit={onProfileSave} className={`border-[2.5px] border-[#2d2a26] rounded-2xl p-6 flex flex-col gap-4 max-w-3xl shadow-[4px_4px_0px_0px_#2d2a26] ${
        isDark ? 'bg-zinc-900/90 text-white' : 'bg-[#fcf9f2] text-[#2d2a26]'
      }`}>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={`text-[11px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Full Name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] shadow-[2px_2px_0px_0px_#2d2a26] ${
                isDark ? 'bg-zinc-950 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
              }`}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-[11px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Job Title</label>
            <input
              type="text"
              value={profileForm.title}
              onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
              className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] shadow-[2px_2px_0px_0px_#2d2a26] ${
                isDark ? 'bg-zinc-950 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
              }`}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={`text-[11px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Location</label>
            <input
              type="text"
              value={profileForm.location}
              onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
              className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] shadow-[2px_2px_0px_0px_#2d2a26] ${
                isDark ? 'bg-zinc-950 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
              }`}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-[11px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Email Address</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] shadow-[2px_2px_0px_0px_#2d2a26] ${
                isDark ? 'bg-zinc-950 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
              }`}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={`text-[11px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>GitHub URL</label>
            <input
              type="url"
              placeholder="https://github.com/username"
              value={profileForm.githubUrl}
              onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
              className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] shadow-[2px_2px_0px_0px_#2d2a26] ${
                isDark ? 'bg-zinc-950 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
              }`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-[11px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>LinkedIn URL</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={profileForm.linkedinUrl}
              onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
              className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] shadow-[2px_2px_0px_0px_#2d2a26] ${
                isDark ? 'bg-zinc-950 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
              }`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={`text-[11px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Biography Text</label>
          <textarea
            rows={5}
            value={profileForm.bio}
            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] resize-none leading-relaxed shadow-[2px_2px_0px_0px_#2d2a26] ${
              isDark ? 'bg-zinc-950 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
            }`}
            required
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#fef08a] hover:bg-yellow-300 border-2 border-[#2d2a26] text-[#2d2a26] font-extrabold rounded-full text-xs disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26] transition-all"
          >
            <Save className="w-4 h-4 text-[#2d2a26]" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
