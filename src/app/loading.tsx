export default function Loading() {
  return (
    <main className="w-screen h-dvh bg-doodle-paper flex items-center justify-center font-doodle text-fg">
      <div role="status" className="flex flex-col items-center gap-3">
        <span aria-hidden className="w-12 h-12 rounded-full border-[3px] border-line border-t-transparent animate-spin" />
        <span className="text-sm font-bold">Booting Aura OS...</span>
      </div>
    </main>
  );
}
