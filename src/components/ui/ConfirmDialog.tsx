'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { Modal, Button } from '@/components/ui/primitives';

/**
 * Global confirm dialog driven by store.showConfirm(). Rendered on the "system" layer so it
 * also appears above the lock screen (e.g. the power button there).
 */
export function ConfirmDialog() {
  const confirmDialog = useOSStore((s) => s.confirmDialog);
  const closeConfirm = useOSStore((s) => s.closeConfirm);

  const open = !!confirmDialog?.isOpen;

  return (
    <Modal
      open={open}
      onClose={closeConfirm}
      title={confirmDialog?.title ?? ''}
      icon={<HelpCircle className="w-4 h-4" />}
      size="sm"
      layer="system"
      footer={
        <>
          <Button variant="secondary" onClick={closeConfirm}>
            {confirmDialog?.cancelLabel || 'Cancel'}
          </Button>
          <Button
            variant={confirmDialog?.tone === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              const fn = confirmDialog?.onConfirm;
              closeConfirm();
              fn?.();
            }}
          >
            {confirmDialog?.confirmLabel || 'Confirm'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-fg leading-relaxed">{confirmDialog?.message}</p>
    </Modal>
  );
}
