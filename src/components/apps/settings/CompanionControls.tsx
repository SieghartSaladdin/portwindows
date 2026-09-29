'use client';

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { playTextBlip } from '@/lib/audio';
import { Button, Card, cx } from '@/components/ui/primitives';

/* Ranges match what the pet components actually use: scale = sprite px, speed = px per animation frame. */
export const SCALE_RANGE = { min: 48, max: 128, step: 4 };
export const SPEED_RANGE = { min: 1, max: 12, step: 1 };

/** Accessible on/off switch. */
export function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative w-11 h-6 shrink-0 rounded-full border-2 transition cursor-pointer shadow-doodle-xs',
        checked ? 'bg-mint border-ink' : 'bg-surface-3 border-line',
      )}
    >
      <span
        aria-hidden
        className={cx(
          'absolute top-0.5 w-4 h-4 rounded-full border-2 transition-all',
          checked ? 'left-[22px] bg-ink border-ink' : 'left-0.5 bg-surface border-line',
        )}
      />
    </button>
  );
}

function ToggleRow({ title, hint, checked, onChange }: { title: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = React.useId();
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b-2 border-dashed border-line last:border-b-0">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-bold cursor-pointer">
          {title}
        </label>
        <p className="text-2xs text-fg-muted mt-0.5">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

function SliderRow({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  const id = React.useId();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold">
          {label}
        </label>
        <output htmlFor={id} className="text-2xs font-bold rounded-full border-2 border-ink bg-highlight text-ink px-2 py-0.5">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-highlight-strong"
        aria-valuetext={display}
      />
      {hint && <p className="text-2xs text-fg-muted">{hint}</p>}
    </div>
  );
}

/** Pet spawn toggles, size, speed and speech volume. Used by Settings → Companions and Frieren.exe. */
export function CompanionControls() {
  const frierenConfig = useOSStore((s) => s.frierenConfig);
  const updateFrierenConfig = useOSStore((s) => s.updateFrierenConfig);
  const { isSpawned, spawnFern, spawnStark, scale, speed, speechVolume } = frierenConfig;
  const volumePct = Math.round(speechVolume * 100);

  return (
    <div className="flex flex-col gap-4">
      <Card shadow="sm" className="px-4 py-1">
        <ToggleRow
          title="Frieren"
          hint="Playable character. The helper robot follows her."
          checked={isSpawned}
          onChange={(v) => updateFrierenConfig({ isSpawned: v })}
        />
        <ToggleRow title="Fern" hint="Wanders the desktop on her own." checked={spawnFern} onChange={(v) => updateFrierenConfig({ spawnFern: v })} />
        <ToggleRow title="Stark" hint="Wanders the desktop on his own." checked={spawnStark} onChange={(v) => updateFrierenConfig({ spawnStark: v })} />
      </Card>

      <Card shadow="sm" className="p-4 flex flex-col gap-5">
        <SliderRow
          label="Character size"
          value={scale}
          display={`${scale}px`}
          {...SCALE_RANGE}
          onChange={(v) => updateFrierenConfig({ scale: v })}
        />
        <SliderRow
          label="Walking speed"
          value={speed}
          display={`${speed} / ${SPEED_RANGE.max}`}
          {...SPEED_RANGE}
          onChange={(v) => updateFrierenConfig({ speed: v })}
        />
        <div className="flex flex-col gap-2">
          <SliderRow
            label="Speech volume"
            value={volumePct}
            display={volumePct === 0 ? 'Muted' : `${volumePct}%`}
            min={0}
            max={100}
            step={5}
            onChange={(v) => updateFrierenConfig({ speechVolume: v / 100 })}
            hint="Volume of the little blips played while companions talk."
          />
          <div>
            <Button
              size="sm"
              onClick={() => playTextBlip('frieren', speechVolume)}
              disabled={speechVolume <= 0}
              icon={speechVolume > 0 ? <Volume2 className="w-3.5 h-3.5" aria-hidden /> : <VolumeX className="w-3.5 h-3.5" aria-hidden />}
            >
              Test sound
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
