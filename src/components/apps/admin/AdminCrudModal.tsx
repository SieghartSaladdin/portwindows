'use client';

import React from 'react';
import { X } from 'lucide-react';

interface AdminCrudModalProps {
  isDark: boolean;
  modalType: 'project' | 'skill' | 'experience' | null;
  editingItem: any;
  closeModal: () => void;
  loading: boolean;
  projectForm: any;
  setProjectForm: (val: any) => void;
  handleProjectSubmit: (e: React.FormEvent) => void;
  skillForm: any;
  setSkillForm: (val: any) => void;
  handleSkillSubmit: (e: React.FormEvent) => void;
  experienceForm: any;
  setExperienceForm: (val: any) => void;
  handleExperienceSubmit: (e: React.FormEvent) => void;
}

export function AdminCrudModal({
  isDark,
  modalType,
  editingItem,
  closeModal,
  loading,
  projectForm,
  setProjectForm,
  handleProjectSubmit,
  skillForm,
  setSkillForm,
  handleSkillSubmit,
  experienceForm,
  setExperienceForm,
  handleExperienceSubmit,
}: AdminCrudModalProps) {
  if (!modalType) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in font-mono">
      <div className={`w-full max-w-lg border-[2.5px] border-[#2d2a26] rounded-2xl shadow-[6px_6px_0px_0px_#2d2a26] flex flex-col overflow-hidden ${
        isDark ? 'bg-zinc-950 text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#fef08a] border-b-2 border-[#2d2a26] text-xs font-extrabold text-[#2d2a26]">
          <span className="flex items-center gap-2">
            <span className="text-sm">✏</span>
            {editingItem ? 'Edit' : 'Tambah'}{' '}
            {modalType === 'project' ? 'Proyek' : modalType === 'skill' ? 'Skill Group' : 'Pengalaman Kerja'}
          </span>
          <button onClick={closeModal} className="p-1 hover:bg-yellow-300 rounded-lg transition text-[#2d2a26] cursor-pointer">
            <X className="w-4 h-4 text-[#2d2a26]" />
          </button>
        </div>

        {/* Modal Form */}
        {modalType === 'project' && (
          <form onSubmit={handleProjectSubmit} className="p-5 flex flex-col gap-3.5 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Judul Proyek</label>
              <input
                type="text"
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] ${
                  isDark ? 'bg-zinc-900 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Deskripsi</label>
              <textarea
                rows={3}
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] resize-none ${
                  isDark ? 'bg-zinc-900 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Tags (pisahkan koma)</label>
              <input
                type="text"
                placeholder="Next.js, Node.js, PostgreSQL"
                value={projectForm.tags}
                onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] ${
                  isDark ? 'bg-zinc-900 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
                }`}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>GitHub URL</label>
                <input
                  type="url"
                  value={projectForm.githubUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                  className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] ${
                    isDark ? 'bg-zinc-900 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Live Demo URL</label>
                <input
                  type="url"
                  value={projectForm.liveUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                  className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] ${
                    isDark ? 'bg-zinc-900 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
                  }`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>URLs Gambar (pisahkan koma)</label>
              <input
                type="text"
                placeholder="https://example.com/img1.png, https://example.com/img2.png"
                value={projectForm.images}
                onChange={(e) => setProjectForm({ ...projectForm, images: e.target.value })}
                className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] ${
                  isDark ? 'bg-zinc-900 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="project-featured"
                checked={projectForm.featured}
                onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                className="accent-[#fef08a] rounded border-[#2d2a26] cursor-pointer w-4 h-4"
              />
              <label htmlFor="project-featured" className={`text-[10px] font-extrabold uppercase cursor-pointer ${
                isDark ? 'text-slate-300' : 'text-zinc-700'
              }`}>
                Featured (Rekomendasi Proyek Utama)
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-[#2d2a26] mt-2">
              <button
                type="button"
                onClick={closeModal}
                className={`px-4 py-2 border-2 border-[#2d2a26] rounded-full transition cursor-pointer font-bold ${
                  isDark ? 'bg-zinc-900 text-slate-300 hover:bg-zinc-800' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#fef08a] hover:bg-yellow-300 border-2 border-[#2d2a26] text-[#2d2a26] font-extrabold rounded-full cursor-pointer disabled:opacity-50 shadow-[2px_2px_0px_0px_#2d2a26]"
              >
                {editingItem ? 'Simpan Perubahan' : 'Buat Proyek'}
              </button>
            </div>
          </form>
        )}

        {modalType === 'skill' && (
          <form onSubmit={handleSkillSubmit} className="p-5 flex flex-col gap-3.5 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Nama Kategori</label>
              <input
                type="text"
                placeholder="Contoh: Backend Development"
                value={skillForm.category}
                onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] ${
                  isDark ? 'bg-zinc-900 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Daftar Skill (pisahkan koma)</label>
              <textarea
                rows={4}
                placeholder="Node.js, PostgreSQL, Docker, Redis"
                value={skillForm.skills}
                onChange={(e) => setSkillForm({ ...skillForm, skills: e.target.value })}
                className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] resize-none ${
                  isDark ? 'bg-zinc-900 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
                }`}
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-[#2d2a26] mt-2">
              <button
                type="button"
                onClick={closeModal}
                className={`px-4 py-2 border-2 border-[#2d2a26] rounded-full transition cursor-pointer font-bold ${
                  isDark ? 'bg-zinc-900 text-slate-300 hover:bg-zinc-800' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#fef08a] hover:bg-yellow-300 border-2 border-[#2d2a26] text-[#2d2a26] font-extrabold rounded-full cursor-pointer disabled:opacity-50 shadow-[2px_2px_0px_0px_#2d2a26]"
              >
                {editingItem ? 'Simpan Perubahan' : 'Buat Skill Group'}
              </button>
            </div>
          </form>
        )}

        {modalType === 'experience' && (
          <form onSubmit={handleExperienceSubmit} className="p-5 flex flex-col gap-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Peran / Role</label>
                <input
                  type="text"
                  value={experienceForm.role}
                  onChange={(e) => setExperienceForm({ ...experienceForm, role: e.target.value })}
                  className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] ${
                    isDark ? 'bg-zinc-900 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
                  }`}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Perusahaan</label>
                <input
                  type="text"
                  value={experienceForm.company}
                  onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                  className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] ${
                    isDark ? 'bg-zinc-900 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Durasi</label>
              <input
                type="text"
                placeholder="Contoh: 2023 - Sekarang"
                value={experienceForm.duration}
                onChange={(e) => setExperienceForm({ ...experienceForm, duration: e.target.value })}
                className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] ${
                  isDark ? 'bg-zinc-900 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Deskripsi Pekerjaan (Satu poin per baris)</label>
              <textarea
                rows={4}
                placeholder="Membuat sistem backend dengan PostgreSQL.&#10;Mengembangkan fitur REST API NextJS."
                value={experienceForm.description}
                onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                className={`px-3.5 py-2 border-2 border-[#2d2a26] rounded-xl font-mono text-xs focus:outline-none focus:border-[#fef08a] resize-none leading-relaxed ${
                  isDark ? 'bg-zinc-900 text-white' : 'bg-[#fffdfa] text-[#2d2a26]'
                }`}
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-[#2d2a26] mt-2">
              <button
                type="button"
                onClick={closeModal}
                className={`px-4 py-2 border-2 border-[#2d2a26] rounded-full transition cursor-pointer font-bold ${
                  isDark ? 'bg-zinc-900 text-slate-300 hover:bg-zinc-800' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#fef08a] hover:bg-yellow-300 border-2 border-[#2d2a26] text-[#2d2a26] font-extrabold rounded-full cursor-pointer disabled:opacity-50 shadow-[2px_2px_0px_0px_#2d2a26]"
              >
                {editingItem ? 'Simpan Perubahan' : 'Buat Entry'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
