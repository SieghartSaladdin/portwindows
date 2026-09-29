'use client';

import React, { useCallback, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOSStore } from '@/lib/store';
import { Button, Card, EmptyState, IconButton, Modal, Spinner, cx, type ModalProps } from '@/components/ui/primitives';
import { DoodleEditPencilIcon, DoodleTrashIcon } from '@/components/ui/DoodleIcons';
import { IconArrowDown, IconArrowUp, IconClose, IconPlus, IconAlert } from './AdminIcons';
import { errorMessage, useAdminApi, type FieldErrors, type ReorderEntity } from './useAdminApi';

/* ------------------------------------------------------------------ */
/* Layout bits                                                          */
/* ------------------------------------------------------------------ */

export function SectionHeader({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-dashed border-line">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <span className="w-9 h-9 shrink-0 rounded-xl border-2 border-line bg-surface-2 shadow-doodle-xs flex items-center justify-center">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="font-doodle text-base font-bold text-fg">{title}</h1>
          {description && <p className="text-xs text-fg-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Modal rendered at document.body so it is never clipped by the (transformed) window frame. */
export function AdminModal(props: ModalProps) {
  if (typeof document === 'undefined') return null;
  return createPortal(<Modal {...props} />, document.body);
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border-2 border-ink bg-rose text-ink px-3 py-2 text-xs font-bold">
      <IconAlert className="w-4 h-4 shrink-0 mt-px" />
      <span>{message}</span>
    </div>
  );
}

/** Loading / error / empty handling for lists that come from the global store. */
export function ListState({
  count,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
  children,
}: {
  count: number;
  emptyIcon?: React.ReactNode;
  emptyTitle: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  const dataStatus = useOSStore((s) => s.dataStatus);
  const fetchDatabaseData = useOSStore((s) => s.fetchDatabaseData);

  if (count === 0 && dataStatus === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-xs text-fg-muted">
        <Spinner /> Loading…
      </div>
    );
  }
  if (count === 0 && dataStatus === 'error') {
    return (
      <Card shadow="sm" className="border-dashed">
        <EmptyState
          icon={<IconAlert className="w-7 h-7 text-danger" />}
          title="Could not load portfolio data"
          message="The portfolio API did not respond. Check the server and database, then try again."
          action={<Button onClick={() => void fetchDatabaseData()}>Try again</Button>}
        />
      </Card>
    );
  }
  if (count === 0) {
    return (
      <Card shadow="sm" className="border-dashed">
        <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} action={emptyAction} />
      </Card>
    );
  }
  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

/** Tag / chip input. Enter or comma adds a chip, Backspace on an empty field removes the last one. */
export function ChipInput({
  id,
  value,
  onChange,
  placeholder,
  invalid,
  describedBy,
}: {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [draft, setDraft] = useState('');

  const commit = (raw: string) => {
    const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...value];
    for (const part of parts) {
      if (!next.some((v) => v.toLowerCase() === part.toLowerCase())) next.push(part);
    }
    onChange(next);
  };

  return (
    <div
      className={cx(
        'flex flex-wrap items-center gap-1.5 rounded-xl border-2 bg-surface-2 px-2 py-1.5 shadow-doodle-xs min-h-9',
        'focus-within:bg-surface focus-within:shadow-doodle-sm',
        invalid ? 'border-danger' : 'border-line',
      )}
    >
      {value.map((chip) => (
        <span
          key={chip}
          className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-highlight text-ink pl-2 pr-0.5 py-px text-2xs font-bold font-doodle"
        >
          {chip}
          <button
            type="button"
            onClick={() => onChange(value.filter((v) => v !== chip))}
            aria-label={`Remove ${chip}`}
            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-rose cursor-pointer"
          >
            <IconClose className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        placeholder={value.length ? '' : placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          const v = e.target.value;
          if (v.includes(',')) {
            const idx = v.lastIndexOf(',');
            commit(v.slice(0, idx));
            setDraft(v.slice(idx + 1));
          } else {
            setDraft(v);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(draft);
            setDraft('');
          } else if (e.key === 'Backspace' && draft === '' && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => {
          commit(draft);
          setDraft('');
        }}
        className="flex-1 min-w-32 bg-transparent outline-none font-mono text-xs text-fg placeholder:text-fg-muted/70 py-0.5"
      />
    </div>
  );
}

/** Accessible on/off switch. */
export function Switch({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative w-11 h-6 shrink-0 rounded-full border-2 transition-colors cursor-pointer shadow-doodle-xs',
          checked ? 'bg-mint border-ink' : 'bg-surface-3 border-line',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 w-4 h-4 rounded-full border-2 border-ink bg-surface transition-all',
            checked ? 'left-5 bg-highlight' : 'left-0.5',
          )}
        />
      </button>
      <div className="flex flex-col">
        <span id={`${id}-label`} className="text-xs font-bold text-fg">{label}</span>
        {description && <span className="text-2xs text-fg-muted">{description}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confirm dialog                                                      */
/* ------------------------------------------------------------------ */

const noop = () => {};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AdminModal
      open={open}
      onClose={busy ? noop : onCancel}
      title={title}
      icon={<DoodleTrashIcon className="w-5 h-5" />}
      size="sm"
      footer={
        <>
          <Button onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy} icon={busy ? <ButtonSpinner /> : undefined}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-fg leading-relaxed">{message}</p>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Reordering                                                          */
/* ------------------------------------------------------------------ */

/** Optimistic move up/down that persists via POST /api/reorder and reverts on failure. */
export function useReorder<T extends { id?: string }>(entity: ReorderEntity, items: T[], setItems: (items: T[]) => void) {
  const { api, notify, refreshPortfolio } = useAdminApi();
  const [busy, setBusy] = useState(false);

  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (busy || target < 0 || target >= items.length) return;

    const previous = items;
    const next = [...items];
    const moved = next[index];
    next[index] = next[target];
    next[target] = moved;

    const ids = next.map((item) => item.id).filter((id): id is string => typeof id === 'string' && id.length > 0);
    if (ids.length !== next.length) {
      notify('Some items have not been saved yet, so they cannot be reordered.', 'error');
      return;
    }

    setItems(next);
    setBusy(true);
    try {
      await api.request('/api/reorder', { method: 'POST', body: { entity, ids } });
      await refreshPortfolio();
    } catch (err) {
      setItems(previous);
      notify(`Could not save the new order. ${errorMessage(err)}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  return { move, busy };
}

export function ReorderButtons({
  index,
  count,
  busy,
  label,
  onMove,
}: {
  index: number;
  count: number;
  busy: boolean;
  label: string;
  onMove: (index: number, delta: -1 | 1) => void;
}) {
  return (
    <div className="flex flex-col gap-1 shrink-0">
      <IconButton size="sm" label={`Move ${label} up`} disabled={busy || index === 0} onClick={() => onMove(index, -1)}>
        <IconArrowUp className="w-3.5 h-3.5" />
      </IconButton>
      <IconButton size="sm" label={`Move ${label} down`} disabled={busy || index === count - 1} onClick={() => onMove(index, 1)}>
        <IconArrowDown className="w-3.5 h-3.5" />
      </IconButton>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Generic CRUD list tab                                               */
/* ------------------------------------------------------------------ */

export interface EntityFormProps<T> {
  formId: string;
  initial: T | null;
  errors: FieldErrors;
  setErrors: (errors: FieldErrors) => void;
  onSubmit: (payload: Record<string, unknown>) => void;
}

export interface EntityTabProps<T extends { id?: string }> {
  title: string;
  description: string;
  icon: React.ReactNode;
  /** Lower-case singular noun, e.g. "project". */
  noun: string;
  /** Plural form for the empty state; defaults to noun + "s". */
  nounPlural?: string;
  basePath: string;
  entity: ReorderEntity;
  items: T[];
  setItems: (items: T[]) => void;
  getLabel: (item: T) => string;
  renderSummary: (item: T) => React.ReactNode;
  Form: React.ComponentType<EntityFormProps<T>>;
  emptyMessage: string;
  modalSize?: 'md' | 'lg';
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function EntityTab<T extends { id?: string }>({
  title,
  description,
  icon,
  noun,
  nounPlural,
  basePath,
  entity,
  items,
  setItems,
  getLabel,
  renderSummary,
  Form,
  emptyMessage,
  modalSize = 'md',
}: EntityTabProps<T>) {
  const { api, notify, confirm, refreshPortfolio } = useAdminApi();
  const { move, busy: reordering } = useReorder(entity, items, setItems);
  const formId = useId();

  const [modal, setModal] = useState<{ open: boolean; item: T | null; key: number }>({ open: false, item: null, key: 0 });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const openEditor = (item: T | null) => {
    setErrors({});
    setFormError(null);
    setModal((m) => ({ open: true, item, key: m.key + 1 }));
  };
  // Stable identity: Modal re-runs its focus effect whenever onClose changes.
  const closeEditor = useCallback(() => {
    if (saving) return;
    setModal((m) => ({ ...m, open: false }));
  }, [saving]);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setSaving(true);
    setErrors({});
    setFormError(null);
    const editingId = modal.item?.id;
    try {
      if (editingId) {
        await api.request(`${basePath}/${editingId}`, { method: 'PUT', body: payload });
      } else {
        await api.request(basePath, { method: 'POST', body: payload });
      }
      setModal((m) => ({ ...m, open: false }));
      notify(`${capitalise(noun)} ${editingId ? 'updated' : 'added'}.`);
      await refreshPortfolio();
    } catch (err) {
      const details = err && typeof err === 'object' && 'details' in err ? (err as { details: FieldErrors }).details : {};
      setErrors(details);
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: T) => {
    const id = item.id;
    if (!id) return;
    confirm({
      title: `Delete ${noun}?`,
      message: `"${getLabel(item)}" will be removed permanently. This cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await api.request(`${basePath}/${id}`, { method: 'DELETE' });
        notify(`${capitalise(noun)} deleted.`);
        await refreshPortfolio();
      },
    });
  };

  const addButton = (
    <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => openEditor(null)}>
      Add {noun}
    </Button>
  );

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title={title} description={description} icon={icon} action={addButton} />

      <ListState count={items.length} emptyIcon={icon} emptyTitle={`No ${nounPlural ?? `${noun}s`} yet`} emptyMessage={emptyMessage} emptyAction={addButton}>
        <ul className="flex flex-col gap-3" aria-label={title}>
          {items.map((item, index) => {
            const label = getLabel(item);
            return (
              <li key={item.id ?? `${label}-${index}`}>
                <Card shadow="sm" className="flex items-start gap-3 p-3">
                  <ReorderButtons index={index} count={items.length} busy={reordering} label={label} onMove={move} />
                  <div className="flex-1 min-w-0">{renderSummary(item)}</div>
                  <div className="flex flex-col @md:flex-row gap-1.5 shrink-0">
                    <IconButton size="sm" label={`Edit ${label}`} onClick={() => openEditor(item)}>
                      <DoodleEditPencilIcon className="w-4 h-4" />
                    </IconButton>
                    <IconButton size="sm" label={`Delete ${label}`} onClick={() => handleDelete(item)} disabled={!item.id}>
                      <DoodleTrashIcon className="w-4 h-4" />
                    </IconButton>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </ListState>

      <AdminModal
        open={modal.open}
        onClose={closeEditor}
        title={modal.item ? `Edit ${noun}` : `Add ${noun}`}
        icon={modal.item ? <DoodleEditPencilIcon className="w-5 h-5" /> : <IconPlus className="w-4 h-4" />}
        size={modalSize}
        footer={
          <>
            <Button onClick={closeEditor} disabled={saving}>Cancel</Button>
            <Button
              type="submit"
              form={formId}
              variant="primary"
              disabled={saving}
              icon={saving ? <ButtonSpinner /> : undefined}
            >
              {saving ? 'Saving…' : modal.item ? 'Save changes' : `Add ${noun}`}
            </Button>
          </>
        }
      >
        <FormError message={formError} />
        <Form key={modal.key} formId={formId} initial={modal.item} errors={errors} setErrors={setErrors} onSubmit={handleSubmit} />
      </AdminModal>
    </div>
  );
}

/** Compact spinner for use inside buttons (inherits the button's ink colour). */
export function ButtonSpinner() {
  return <span aria-hidden className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />;
}

/** Small muted meta line used in list summaries. */
export function Meta({ children }: { children: React.ReactNode }) {
  return <p className="text-2xs text-fg-muted font-doodle">{children}</p>;
}
