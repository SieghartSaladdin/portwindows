import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="w-screen h-dvh bg-doodle-paper flex items-center justify-center p-4 font-doodle text-fg">
      <div className="w-full max-w-md rounded-2xl border-[2.5px] border-line bg-surface shadow-doodle-lg p-6 flex flex-col items-center text-center gap-3 rotate-[0.6deg]">
        <span className="px-4 py-1 rounded-xl border-[2.5px] border-ink bg-highlight text-ink text-4xl font-bold shadow-doodle-sm -rotate-2">
          404
        </span>
        <h1 className="text-xl font-bold mt-2">This page is not in the notebook</h1>
        <p className="text-sm text-fg-muted leading-relaxed">
          The page you are looking for was erased, moved, or never drawn in the first place.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center justify-center h-9 px-4 rounded-xl border-2 border-ink bg-highlight text-ink text-xs font-bold shadow-doodle-sm hover:bg-highlight-strong transition"
        >
          Back to the desktop
        </Link>
      </div>
    </main>
  );
}
