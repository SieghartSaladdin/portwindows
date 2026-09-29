'use client';

import React, { useState } from 'react';
import type { ContactMessage } from '@/lib/types';
import { Badge, Button, Card, EmptyState, IconButton, Spinner, cx } from '@/components/ui/primitives';
import { DoodleTrashIcon } from '@/components/ui/DoodleIcons';
import { ButtonSpinner, SectionHeader } from './AdminShared';
import { DoodleMailIcon, IconAlert, IconMailClosed, IconMailOpen, IconRefresh, IconReply } from './AdminIcons';
import { errorMessage, useAdminApi } from './useAdminApi';

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

function replyHref(m: ContactMessage) {
  const subject = encodeURIComponent('Re: your message');
  const quoted = m.message
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
  const body = encodeURIComponent(`Hi ${m.name},\n\n\n\n${quoted}`);
  return `mailto:${m.email}?subject=${subject}&body=${body}`;
}

export function MessagesTab() {
  const { api, notify, confirm, messages, messagesStatus, reloadMessages, setMessages } = useAdminApi();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const unread = messages.filter((m) => !m.read).length;
  const visible = filter === 'unread' ? messages.filter((m) => !m.read) : messages;

  const toggleRead = async (m: ContactMessage) => {
    const read = !m.read;
    setPendingId(m.id);
    setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, read } : x)));
    try {
      await api.request(`/api/messages/${m.id}`, { method: 'PATCH', body: { read } });
    } catch (err) {
      setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, read: m.read } : x)));
      notify(`Could not update the message. ${errorMessage(err)}`, 'error');
    } finally {
      setPendingId(null);
    }
  };

  const remove = (m: ContactMessage) =>
    confirm({
      title: 'Delete message?',
      message: `The message from ${m.name} will be removed permanently. This cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await api.request(`/api/messages/${m.id}`, { method: 'DELETE' });
        setMessages((list) => list.filter((x) => x.id !== m.id));
        notify('Message deleted.');
      },
    });

  const filterButton = (value: 'all' | 'unread', label: string) => (
    <button
      type="button"
      onClick={() => setFilter(value)}
      aria-pressed={filter === value}
      className={cx(
        'h-8 px-3 rounded-full border-2 text-xs font-bold font-doodle cursor-pointer transition-colors',
        filter === value ? 'bg-highlight text-ink border-ink shadow-doodle-xs' : 'bg-surface text-fg border-line hover:bg-surface-3',
      )}
    >
      {label}
    </button>
  );

  let content: React.ReactNode;
  if (messagesStatus === 'loading' && messages.length === 0) {
    content = (
      <div className="flex items-center justify-center gap-2 py-12 text-xs text-fg-muted">
        <Spinner /> Loading messages…
      </div>
    );
  } else if (messagesStatus === 'error' && messages.length === 0) {
    content = (
      <Card shadow="sm" className="border-dashed">
        <EmptyState
          icon={<IconAlert className="w-7 h-7 text-danger" />}
          title="Could not load messages"
          message="The inbox did not respond. Try again in a moment."
          action={<Button onClick={() => void reloadMessages()}>Try again</Button>}
        />
      </Card>
    );
  } else if (visible.length === 0) {
    content = (
      <Card shadow="sm" className="border-dashed">
        <EmptyState
          icon={<DoodleMailIcon className="w-10 h-10" />}
          title={filter === 'unread' ? 'No unread messages' : 'Your inbox is empty'}
          message={filter === 'unread' ? 'You are all caught up.' : 'Messages sent through the contact form will appear here.'}
        />
      </Card>
    );
  } else {
    content = (
      <ul className="flex flex-col gap-3" aria-label="Messages">
        {visible.map((m) => (
          <li key={m.id}>
            <Card shadow="sm" tone={m.read ? 'surface' : 'surface-2'} className="p-3.5 flex flex-col gap-2.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex flex-col">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className={cx('text-sm text-fg', m.read ? 'font-normal' : 'font-bold')}>{m.name}</h3>
                    {!m.read && <Badge tone="highlight">New</Badge>}
                  </div>
                  <a href={`mailto:${m.email}`} className="text-2xs font-mono text-fg-muted hover:text-fg underline decoration-dashed underline-offset-2 break-all" data-selectable>
                    {m.email}
                  </a>
                </div>
                <time dateTime={m.createdAt} className="text-2xs text-fg-muted whitespace-nowrap">
                  {formatDate(m.createdAt)}
                </time>
              </div>

              <p className="text-xs text-fg leading-relaxed whitespace-pre-wrap break-words" data-selectable>
                {m.message}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-dashed border-line">
                <a
                  href={replyHref(m)}
                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-xl border-2 border-ink bg-highlight text-ink text-2xs font-bold font-doodle shadow-doodle-sm hover:bg-highlight-strong"
                >
                  <IconReply className="w-3.5 h-3.5" /> Reply
                </a>
                <Button
                  size="sm"
                  disabled={pendingId === m.id}
                  onClick={() => void toggleRead(m)}
                  icon={m.read ? <IconMailClosed className="w-3.5 h-3.5" /> : <IconMailOpen className="w-3.5 h-3.5" />}
                >
                  {m.read ? 'Mark as unread' : 'Mark as read'}
                </Button>
                <IconButton size="sm" label={`Delete message from ${m.name}`} onClick={() => remove(m)} className="ml-auto">
                  <DoodleTrashIcon className="w-4 h-4" />
                </IconButton>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Messages"
        description={unread ? `${unread} unread of ${messages.length}` : `${messages.length} message${messages.length === 1 ? '' : 's'} from the contact form`}
        icon={<DoodleMailIcon className="w-6 h-6" />}
        action={
          <Button
            icon={messagesStatus === 'loading' ? <ButtonSpinner /> : <IconRefresh className="w-3.5 h-3.5" />}
            onClick={() => void reloadMessages()}
            disabled={messagesStatus === 'loading'}
          >
            Refresh
          </Button>
        }
      />
      <div className="flex gap-2" role="group" aria-label="Filter messages">
        {filterButton('all', `All (${messages.length})`)}
        {filterButton('unread', `Unread (${unread})`)}
      </div>
      {content}
    </div>
  );
}
