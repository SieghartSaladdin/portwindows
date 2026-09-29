'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/primitives';

export default function ErrorPage({
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
    <main className="w-screen h-dvh bg-doodle-paper flex items-center justify-center p-4 font-doodle text-fg">
      <div role="alert" className="w-full max-w-md rounded-2xl border-[2.5px] border-line bg-surface shadow-doodle-lg p-6 flex flex-col items-center text-center gap-3 -rotate-[0.6deg]">
        <span aria-hidden className="w-14 h-14 rounded-2xl border-[2.5px] border-ink bg-rose text-ink flex items-center justify-center text-2xl font-bold shadow-doodle-sm">
          !
        </span>
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-sm text-fg-muted leading-relaxed">
          Aura OS hit an unexpected error while drawing this page. You can try again, and if it keeps happening, reload the page.
        </p>
        {error.digest && <p className="text-2xs font-mono text-fg-muted">Error ID: {error.digest}</p>}
        <div className="flex gap-2.5 mt-2">
          <Button variant="primary" onClick={() => unstable_retry()}>
            Try again
          </Button>
          <Button variant="secondary" onClick={() => window.location.assign('/')}>
            Reload desktop
          </Button>
        </div>
      </div>
    </main>
  );
}
