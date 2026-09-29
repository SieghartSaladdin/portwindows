'use client';

/**
 * Doodle design-system primitives. Every app should build on these instead of
 * re-declaring border/shadow/colour class strings. Colours come from the semantic
 * tokens in globals.css (surface, fg, line, highlight...), so light/dark is automatic.
 */

import React from 'react';

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-highlight text-ink border-ink hover:bg-highlight-strong',
  secondary: 'bg-surface text-fg border-line hover:bg-surface-3',
  danger: 'bg-rose text-ink border-ink hover:bg-rose-300',
  ghost: 'bg-transparent text-fg border-transparent shadow-none hover:bg-surface-3 hover:border-line',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-2xs gap-1',
  md: 'h-9 px-3.5 text-xs gap-1.5',
  lg: 'h-11 px-5 text-sm gap-2',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'inline-flex items-center justify-center rounded-xl border-2 font-doodle font-bold shadow-doodle-sm',
        'transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] active:shadow-doodle-xs',
        'disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
}

/** Square button for a single icon. `label` is required for screen readers. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'secondary', size = 'md', className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex items-center justify-center rounded-xl border-2 shadow-doodle-sm transition-all duration-150',
        'active:translate-x-[1px] active:translate-y-[1px] active:shadow-doodle-xs cursor-pointer',
        'disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' ? 'w-7 h-7' : 'w-9 h-9',
        buttonVariants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

const fieldBase =
  'w-full rounded-xl border-2 border-line bg-surface-2 text-fg placeholder:text-fg-muted/70 font-mono text-xs ' +
  'px-3 py-2 shadow-doodle-xs outline-none transition focus:bg-surface focus:shadow-doodle-sm ' +
  'disabled:opacity-60 aria-[invalid=true]:border-danger';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cx(fieldBase, 'h-9', className)} {...rest} />;
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cx(fieldBase, 'min-h-[88px] resize-y leading-relaxed', className)} {...rest} />;
  },
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref} className={cx(fieldBase, 'h-9 cursor-pointer', className)} {...rest}>
        {children}
      </select>
    );
  },
);

export interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + hint/error, consistently spaced. */
export function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-2xs font-bold uppercase tracking-wider text-fg-muted font-doodle">
        {label}
        {required && <span className="text-danger ml-0.5" aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-2xs font-bold text-danger">{error}</p>
      ) : hint ? (
        <p className="text-2xs text-fg-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'surface' | 'surface-2' | 'highlight';
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  interactive?: boolean;
}

export function Card({ tone = 'surface', shadow = 'md', interactive, className, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        'rounded-2xl border-[2.5px] border-line',
        tone === 'surface' && 'bg-surface text-fg',
        tone === 'surface-2' && 'bg-surface-2 text-fg',
        tone === 'highlight' && 'bg-highlight text-ink border-ink',
        shadow === 'sm' && 'shadow-doodle-sm',
        shadow === 'md' && 'shadow-doodle-md',
        shadow === 'lg' && 'shadow-doodle-lg',
        interactive && 'transition-all duration-200 hover:-translate-y-0.5 hover:-rotate-[0.4deg] hover:shadow-doodle-lg cursor-pointer',
        className,
      )}
      {...rest}
    />
  );
}

type BadgeTone = 'neutral' | 'highlight' | 'sky' | 'mint' | 'rose' | 'lilac' | 'peach';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-fg border-line',
  highlight: 'bg-highlight text-ink border-ink',
  sky: 'bg-sky text-ink border-ink',
  mint: 'bg-mint text-ink border-ink',
  rose: 'bg-rose text-ink border-ink',
  lilac: 'bg-lilac text-ink border-ink',
  peach: 'bg-peach text-ink border-ink',
};

export function Badge({ tone = 'neutral', className, ...rest }: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-2xs font-bold font-doodle shadow-doodle-xs whitespace-nowrap',
        badgeTones[tone],
        className,
      )}
      {...rest}
    />
  );
}

/** Centered placeholder for empty lists / missing data. */
export function EmptyState({ icon, title, message, action }: { icon?: React.ReactNode; title: string; message?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 py-10 px-6 text-fg-muted">
      {icon && <div className="mb-1 opacity-80">{icon}</div>}
      <p className="font-doodle font-bold text-sm text-fg">{title}</p>
      {message && <p className="text-xs max-w-xs leading-relaxed">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Small hand-drawn spinner for loading states. */
export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className={cx('inline-block w-5 h-5 rounded-full border-[2.5px] border-line border-t-transparent animate-spin', className)} />
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Stacking layer. Use 'system' for dialogs that must appear above the lock screen. */
  layer?: 'app' | 'system';
}

/** Accessible doodle modal: Escape closes, backdrop click closes, focus moves into the dialog. */
export function Modal({ open, onClose, title, icon, children, footer, size = 'md', layer = 'app' }: ModalProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const first = dialogRef.current?.querySelector<HTMLElement>('input, textarea, select, button');
    first?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cx('fixed inset-0 flex items-center justify-center p-4 bg-ink/40', layer === 'system' ? 'z-[100001]' : 'z-[9999]')}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          'w-full max-h-[90vh] flex flex-col rounded-2xl border-[2.5px] border-line bg-surface text-fg shadow-doodle-lg font-doodle',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-lg',
          size === 'lg' && 'max-w-2xl',
        )}
      >
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b-2 border-line">
          {icon && <span className="w-8 h-8 rounded-lg border-2 border-ink bg-highlight text-ink flex items-center justify-center shadow-doodle-xs">{icon}</span>}
          <h2 id={titleId} className="text-sm font-bold flex-1">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-7 h-7 rounded-lg border-2 border-line bg-surface-2 hover:bg-rose hover:text-ink flex items-center justify-center text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && <div className="flex justify-end gap-2.5 px-5 py-3.5 border-t-2 border-line bg-surface-2 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}
