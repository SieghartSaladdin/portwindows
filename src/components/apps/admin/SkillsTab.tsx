'use client';

import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface SkillsTabProps {
  isDark: boolean;
  skills: any[];
  onOpenModal: (type: 'skill', item?: any) => void;
  onSkillDelete: (id: string) => void;
}

export function SkillsTab({
  isDark,
  skills,
  onOpenModal,
  onSkillDelete,
}: SkillsTabProps) {
  return (
    <div className="flex flex-col gap-5 font-mono">
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#2d2a26]">
        <div>
          <h1 className={`text-base font-extrabold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#2d2a26]'}`}>
            <span className="text-amber-500">✏</span> Skills Matrix
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Manage skill groups displayed across apps.</p>
        </div>
        <button
          onClick={() => onOpenModal('skill')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#fef08a] hover:bg-yellow-300 border-2 border-[#2d2a26] text-[#2d2a26] font-extrabold rounded-full text-xs cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26] transition-all"
        >
          <Plus className="w-4 h-4 text-[#2d2a26]" />
          <span>Tambah Skill Group</span>
        </button>
      </div>

      {/* Skills List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {skills.map((skillGroup) => (
          <div key={skillGroup.id} className={`p-5 border-[2.5px] border-[#2d2a26] rounded-2xl flex flex-col justify-between gap-4 shadow-[4px_4px_0px_0px_#2d2a26] ${
            isDark ? 'bg-zinc-900/90' : 'bg-[#fcf9f2]'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#2d2a26]">
                <h3 className={`font-extrabold text-xs uppercase tracking-wider ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>✏ {skillGroup.category}</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenModal('skill', skillGroup)}
                    className="p-1.5 border border-[#2d2a26] bg-[#fef08a] rounded-lg text-[#2d2a26] cursor-pointer shadow-[1px_1px_0px_0px_#2d2a26]"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#2d2a26]" />
                  </button>
                  <button
                    onClick={() => onSkillDelete(skillGroup.id)}
                    className="p-1.5 border border-[#2d2a26] bg-rose-200 rounded-lg text-rose-900 cursor-pointer shadow-[1px_1px_0px_0px_#2d2a26]"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-900" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {skillGroup.skills?.map((skill: string) => (
                  <span key={skill} className={`px-3 py-1 rounded-full border-2 border-[#2d2a26] text-xs font-bold shadow-[2px_2px_0px_0px_#2d2a26] ${
                    isDark ? 'bg-zinc-950 text-amber-300' : 'bg-[#fffdfa] text-[#2d2a26]'
                  }`}>
                    ✦ {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
