'use client';

import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface ExperiencesTabProps {
  isDark: boolean;
  experiences: any[];
  onOpenModal: (type: 'experience', item?: any) => void;
  onExperienceDelete: (id: string) => void;
}

export function ExperiencesTab({
  isDark,
  experiences,
  onOpenModal,
  onExperienceDelete,
}: ExperiencesTabProps) {
  return (
    <div className="flex flex-col gap-5 font-mono">
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#2d2a26]">
        <div>
          <h1 className={`text-base font-extrabold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#2d2a26]'}`}>
            <span className="text-amber-500">✏</span> Work Experiences
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Manage employment timeline entries.</p>
        </div>
        <button
          onClick={() => onOpenModal('experience')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#fef08a] hover:bg-yellow-300 border-2 border-[#2d2a26] text-[#2d2a26] font-extrabold rounded-full text-xs cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26] transition-all"
        >
          <Plus className="w-4 h-4 text-[#2d2a26]" />
          <span>Tambah Pengalaman</span>
        </button>
      </div>

      {/* Experiences Table */}
      <div className={`border-[2.5px] border-[#2d2a26] rounded-2xl font-mono overflow-hidden shadow-[4px_4px_0px_0px_#2d2a26] ${
        isDark ? 'bg-zinc-900/90' : 'bg-[#fcf9f2]'
      }`}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`border-b-2 border-[#2d2a26] font-extrabold ${
              isDark ? 'bg-zinc-950 text-[#fef08a]' : 'bg-[#fef08a] text-[#2d2a26]'
            }`}>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Company</th>
              <th className="p-3.5">Duration</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map((exp) => (
              <tr key={exp.id} className="border-b-2 border-[#2d2a26] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className={`p-3.5 font-bold ${isDark ? 'text-slate-100' : 'text-[#2d2a26]'}`}>{exp.role}</td>
                <td className={`p-3.5 ${isDark ? 'text-slate-300' : 'text-zinc-700'}`}>{exp.company}</td>
                <td className={`p-3.5 font-mono text-xs ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>{exp.duration}</td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onOpenModal('experience', exp)}
                      className="p-2 border-2 border-[#2d2a26] bg-[#fef08a] rounded-xl text-[#2d2a26] cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26]"
                      title="Edit Experience"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#2d2a26]" />
                    </button>
                    <button
                      onClick={() => onExperienceDelete(exp.id)}
                      className="p-2 border-2 border-[#2d2a26] bg-rose-200 rounded-xl text-rose-900 cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26]"
                      title="Delete Experience"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-900" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
