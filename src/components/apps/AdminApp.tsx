'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOSStore, type DataStatus } from '@/lib/store';
import type { ContactMessage } from '@/lib/types';
import { Spinner, cx } from '@/components/ui/primitives';
import { AdminLogin } from './admin/AdminLogin';
import { AdminSidebar, type AdminTab } from './admin/AdminSidebar';
import { OverviewTab } from './admin/OverviewTab';
import { ProfileEditorTab } from './admin/ProfileEditorTab';
import { ProjectsTab } from './admin/ProjectsTab';
import { SkillsTab } from './admin/SkillsTab';
import { ExperiencesTab } from './admin/ExperiencesTab';
import { EducationTab } from './admin/EducationTab';
import { CertificationsTab } from './admin/CertificationsTab';
import { MessagesTab } from './admin/MessagesTab';
import { ConfirmModal } from './admin/AdminShared';
import { IconAlert, IconCheck, IconClose } from './admin/AdminIcons';
import {
  ADMIN_TOKEN_KEY,
  AdminContext,
  ApiError,
  SESSION_EXPIRED_MESSAGE,
  createAdminApi,
  errorMessage,
  type AdminContextValue,
  type ConfirmOptions,
  type ToastTone,
} from './admin/useAdminApi';

type AuthStatus = 'checking' | 'anon' | 'authed';

function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
    else window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    /* storage unavailable (private mode); the session just won't persist */
  }
}

function sortNewestFirst(list: ContactMessage[]) {
  return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function AdminApp() {
  // --- Auth ---------------------------------------------------------------
  const [token, setToken] = useState<string | null>(readToken);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() => (readToken() ? 'checking' : 'anon'));
  const [username, setUsername] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);

  // --- UI -----------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [toast, setToast] = useState<{ id: number; text: string; tone: ToastTone } | null>(null);
  const [confirmState, setConfirmState] = useState<{ options: ConfirmOptions; busy: boolean } | null>(null);
  const [syncing, setSyncing] = useState(false);

  // --- Messages (admin-only data, not in the global store) ---------------
  const [messages, setMessagesState] = useState<ContactMessage[]>([]);
  const [messagesStatus, setMessagesStatus] = useState<DataStatus>('loading');

  // --- Global portfolio data (for counts) ----------------------------------
  const projectsCount = useOSStore((s) => s.projects.length);
  const skillsCount = useOSStore((s) => s.skills.length);
  const experiencesCount = useOSStore((s) => s.experiences.length);
  const educationsCount = useOSStore((s) => s.educations.length);
  const certificationsCount = useOSStore((s) => s.certifications.length);

  const logout = useCallback((message?: string) => {
    writeToken(null);
    setToken(null);
    setUsername(null);
    setAuthStatus('anon');
    setLoginNotice(message ?? null);
    setMessagesState([]);
    setMessagesStatus('loading');
    setConfirmState(null);
  }, []);

  const api = useMemo(() => createAdminApi(token ?? '', (msg) => logout(msg)), [token, logout]);

  const notify = useCallback((text: string, tone: ToastTone = 'success') => {
    setToast({ id: Date.now(), text, tone });
  }, []);

  // Auto-dismiss the toast.
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast((cur) => (cur?.id === toast.id ? null : cur)), toast.tone === 'error' ? 7000 : 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Verify a stored token on mount / after sign-in.
  useEffect(() => {
    if (authStatus !== 'checking' || !token) return;
    let cancelled = false;
    fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) {
          logout(SESSION_EXPIRED_MESSAGE);
          return;
        }
        const data: { username?: unknown } | null = await res.json().catch(() => null);
        if (cancelled) return;
        setUsername(typeof data?.username === 'string' ? data.username : null);
        setAuthStatus('authed');
      })
      .catch(() => {
        // Network hiccup: keep the session; any write that fails with 401 will sign out.
        if (!cancelled) setAuthStatus('authed');
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, token, logout]);

  const fetchMessages = useCallback(
    (isCancelled: () => boolean = () => false) =>
      api.request<ContactMessage[]>('/api/messages').then(
        (data) => {
          if (isCancelled()) return;
          setMessagesState(sortNewestFirst(Array.isArray(data) ? data : []));
          setMessagesStatus('ready');
        },
        (err) => {
          if (isCancelled()) return;
          if (!(err instanceof ApiError && err.status === 401)) setMessagesStatus('error');
        },
      ),
    [api],
  );

  const reloadMessages = useCallback(async () => {
    setMessagesStatus('loading');
    await fetchMessages();
  }, [fetchMessages]);

  // Load the inbox once signed in (also feeds the unread badge).
  useEffect(() => {
    if (authStatus !== 'authed') return;
    let cancelled = false;
    void fetchMessages(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [authStatus, fetchMessages]);

  const refreshPortfolio = useCallback(() => useOSStore.getState().fetchDatabaseData(), []);

  const setMessages = useCallback((updater: (prev: ContactMessage[]) => ContactMessage[]) => setMessagesState(updater), []);

  const confirm = useCallback((options: ConfirmOptions) => setConfirmState({ options, busy: false }), []);
  const cancelConfirm = useCallback(() => setConfirmState(null), []);

  const runConfirm = async () => {
    if (!confirmState) return;
    setConfirmState({ ...confirmState, busy: true });
    try {
      await confirmState.options.onConfirm();
      setConfirmState(null);
    } catch (err) {
      setConfirmState(null);
      notify(errorMessage(err), 'error');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await Promise.all([refreshPortfolio(), reloadMessages()]);
    setSyncing(false);
    if (useOSStore.getState().dataStatus === 'error') notify('Could not reload portfolio data. Is the server running?', 'error');
    else notify('Data reloaded.');
  };

  const ctx: AdminContextValue = useMemo(
    () => ({ api, username, notify, confirm, refreshPortfolio, messages, messagesStatus, reloadMessages, setMessages }),
    [api, username, notify, confirm, refreshPortfolio, messages, messagesStatus, reloadMessages, setMessages],
  );

  // --- Views ----------------------------------------------------------------
  if (authStatus === 'checking') {
    return (
      <div className="flex h-full items-center justify-center gap-2 bg-surface text-fg-muted font-doodle text-xs">
        <Spinner /> Checking your session…
      </div>
    );
  }

  if (authStatus === 'anon' || !token) {
    return (
      <AdminLogin
        notice={loginNotice}
        onLoggedIn={(newToken) => {
          writeToken(newToken);
          setLoginNotice(null);
          setToken(newToken);
          setAuthStatus('checking');
          setActiveTab('overview');
        }}
      />
    );
  }

  const unreadMessages = messages.filter((m) => !m.read).length;

  return (
    <AdminContext.Provider value={ctx}>
      <div className="@container h-full bg-surface text-fg font-doodle">
        <div className="flex flex-col @3xl:flex-row h-full min-h-0">
          <AdminSidebar
            activeTab={activeTab}
            onSelect={setActiveTab}
            counts={{
              projects: projectsCount,
              skills: skillsCount,
              experiences: experiencesCount,
              educations: educationsCount,
              certifications: certificationsCount,
            }}
            unreadMessages={unreadMessages}
            syncing={syncing}
            onSync={() => void handleSync()}
            onSignOut={() => logout()}
          />

          <main className="flex-1 min-w-0 min-h-0 flex flex-col">
            {toast && (
              <div
                role={toast.tone === 'error' ? 'alert' : 'status'}
                className={cx(
                  'mx-3 mt-3 @3xl:mx-6 flex items-center gap-2 rounded-xl border-2 border-ink text-ink px-3 py-2 text-xs font-bold shadow-doodle-sm',
                  toast.tone === 'error' ? 'bg-rose' : 'bg-mint',
                )}
              >
                {toast.tone === 'error' ? <IconAlert className="w-4 h-4 shrink-0" /> : <IconCheck className="w-4 h-4 shrink-0" />}
                <span className="flex-1">{toast.text}</span>
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  aria-label="Dismiss notification"
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-surface/50 cursor-pointer"
                >
                  <IconClose className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto p-3 @md:p-4 @3xl:p-6">
              {activeTab === 'overview' && <OverviewTab onNavigate={setActiveTab} />}
              {activeTab === 'profile' && <ProfileEditorTab />}
              {activeTab === 'projects' && <ProjectsTab />}
              {activeTab === 'skills' && <SkillsTab />}
              {activeTab === 'experiences' && <ExperiencesTab />}
              {activeTab === 'educations' && <EducationTab />}
              {activeTab === 'certifications' && <CertificationsTab />}
              {activeTab === 'messages' && <MessagesTab />}
            </div>
          </main>
        </div>

        <ConfirmModal
          open={!!confirmState}
          title={confirmState?.options.title ?? ''}
          message={confirmState?.options.message ?? ''}
          confirmLabel={confirmState?.options.confirmLabel}
          busy={!!confirmState?.busy}
          onCancel={cancelConfirm}
          onConfirm={() => void runConfirm()}
        />
      </div>
    </AdminContext.Provider>
  );
}
