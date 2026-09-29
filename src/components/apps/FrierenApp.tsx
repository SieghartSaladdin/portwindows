'use client';

import React from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Keyboard, MessageCircle } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { Button, Card } from '@/components/ui/primitives';
import { DoodlePetIcon } from '@/components/ui/DoodleIcons';
import { CompanionControls } from './settings/CompanionControls';

const KEYS: Array<{ action: string; keys: string; icon: React.ReactNode }> = [
  { action: 'Walk left', keys: 'A', icon: <ArrowLeft className="w-3 h-3" aria-hidden /> },
  { action: 'Walk right', keys: 'D', icon: <ArrowRight className="w-3 h-3" aria-hidden /> },
  { action: 'Face away', keys: 'W', icon: <ArrowUp className="w-3 h-3" aria-hidden /> },
  { action: 'Face forward', keys: 'S', icon: <ArrowDown className="w-3 h-3" aria-hidden /> },
];

export function FrierenApp() {
  const setFrierenSpeech = useOSStore((s) => s.setFrierenSpeech);
  const setFernSpeech = useOSStore((s) => s.setFernSpeech);
  const setStarkSpeech = useOSStore((s) => s.setStarkSpeech);
  const { isSpawned, spawnFern, spawnStark } = useOSStore((s) => s.frierenConfig);

  return (
    <div className="h-full overflow-y-auto bg-surface text-fg font-doodle">
      <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-5">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <header className="flex items-center gap-2.5 pb-2 border-b-2 border-dashed border-line">
            <DoodlePetIcon className="w-7 h-7" aria-hidden />
            <div>
              <h2 className="text-base font-bold">Frieren.exe</h2>
              <p className="text-xs text-fg-muted">Desktop companions: who&apos;s out, how big, how fast, how loud.</p>
            </div>
          </header>

          <CompanionControls />

          <Card shadow="sm" className="p-4 flex flex-col gap-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" aria-hidden />
              Say something
            </h3>
            <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2">
              <Button variant="primary" disabled={!isSpawned} onClick={() => setFrierenSpeech("Hmm... let me take a look at this code magic.")}>
                Frieren
              </Button>
              <Button disabled={!spawnFern} className="bg-sky text-ink border-ink hover:bg-sky" onClick={() => setFernSpeech('Frieren-sama, please focus on the portfolio.')}>
                Fern
              </Button>
              <Button disabled={!spawnStark} className="bg-rose text-ink border-ink hover:bg-rose" onClick={() => setStarkSpeech("I'll guard this desktop with my axe!")}>
                Stark
              </Button>
            </div>
            <p className="text-2xs text-fg-muted">A companion has to be on the desktop to talk.</p>
          </Card>
        </div>

        {/* Keyboard help — hidden on touch devices where it doesn't apply */}
        <aside className="md:w-64 shrink-0 pointer-coarse:hidden">
          <Card shadow="sm" className="p-4 flex flex-col gap-3">
            <h3 className="text-sm font-bold flex items-center gap-2 pb-2 border-b-2 border-dashed border-line">
              <Keyboard className="w-4 h-4" aria-hidden />
              Keyboard controls
            </h3>
            <p className="text-xs text-fg-muted leading-relaxed">
              While Frieren is on the desktop and no text field is focused, use the arrow keys or WASD:
            </p>
            <dl className="flex flex-col gap-2">
              {KEYS.map((k) => (
                <div key={k.action} className="flex items-center justify-between gap-2">
                  <dt className="text-xs">{k.action}</dt>
                  <dd className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center w-6 h-6 rounded-lg border-2 border-ink bg-highlight text-ink shadow-doodle-xs">{k.icon}</kbd>
                    <span className="text-2xs text-fg-muted">or</span>
                    <kbd className="inline-flex items-center justify-center w-6 h-6 rounded-lg border-2 border-line bg-surface-2 text-2xs font-mono font-bold shadow-doodle-xs">
                      {k.keys}
                    </kbd>
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}
