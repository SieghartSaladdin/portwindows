'use client';

import { useEffect } from 'react';
import './globals.css';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <title>Something went wrong | Aura OS</title>
        <main className="w-screen h-dvh bg-doodle-paper flex items-center justify-center p-4 text-fg" style={{ fontFamily: "'Architects Daughter', 'Caveat', cursive, sans-serif" }}>
          <div role="alert" className="w-full max-w-md rounded-2xl border-[2.5px] border-line bg-surface shadow-doodle-lg p-6 flex flex-col items-center text-center gap-3">
            <span aria-hidden className="w-14 h-14 rounded-2xl border-[2.5px] border-ink bg-rose text-ink flex items-center justify-center text-2xl font-bold shadow-doodle-sm">
              !
            </span>
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-fg-muted leading-relaxed">
              Aura OS could not start. Please try again in a moment.
            </p>
            {error.digest && <p className="text-2xs text-fg-muted">Error ID: {error.digest}</p>}
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="mt-2 inline-flex items-center justify-center h-9 px-4 rounded-xl border-2 border-ink bg-highlight text-ink text-xs font-bold shadow-doodle-sm hover:bg-highlight-strong cursor-pointer"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
