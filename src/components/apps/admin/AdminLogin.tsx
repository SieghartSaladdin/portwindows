'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

const DoodleLockSVG = () => (
  <svg className="w-8 h-8 text-[#2d2a26]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

interface AdminLoginProps {
  isDark: boolean;
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loginError: string | null;
  loading: boolean;
  onLoginSubmit: (e: React.FormEvent) => void;
}

export function AdminLogin({
  isDark,
  username,
  setUsername,
  password,
  setPassword,
  loginError,
  loading,
  onLoginSubmit
}: AdminLoginProps) {
  return (
    <div className={`flex flex-col items-center justify-center h-full p-6 font-mono select-none ${
      isDark ? 'bg-[#18181b] text-slate-100' : 'bg-[#fdfbf7] text-[#2d2a26]'
    }`}>
      <div className={`w-full max-w-sm flex flex-col items-center gap-6 p-6 border-[2.5px] border-[#2d2a26] rounded-2xl shadow-[4px_4px_0px_0px_#2d2a26] ${
        isDark ? 'bg-zinc-900/90 text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
      }`}>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-[#fef08a] border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] flex items-center justify-center text-[#2d2a26] mb-1">
            <DoodleLockSVG />
          </div>
          <h2 className="text-xl font-extrabold tracking-wide text-amber-900 flex items-center gap-2">
            <span>✏</span> Administrator Access
          </h2>
          <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Enter credentials configured in system .env</p>
        </div>

        <form onSubmit={onLoginSubmit} className="w-full flex flex-col gap-4 font-mono">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-amber-900 font-extrabold uppercase">Username</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`px-3 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] shadow-[2px_2px_0px_0px_#2d2a26] ${
                isDark ? 'bg-zinc-950 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
              }`}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-amber-900 font-extrabold uppercase">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`px-3 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] shadow-[2px_2px_0px_0px_#2d2a26] ${
                isDark ? 'bg-zinc-950 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
              }`}
              required
            />
          </div>

          {loginError && (
            <span className="text-xs text-rose-400 font-bold animate-pulse flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> {loginError}
            </span>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 w-full rounded-xl bg-[#fef08a] hover:bg-yellow-300 border-2 border-[#2d2a26] text-[#2d2a26] text-xs font-extrabold shadow-[2px_2px_0px_0px_#2d2a26] transition disabled:opacity-50 cursor-pointer text-center"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
