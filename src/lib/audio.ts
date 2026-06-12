let audioCtx: AudioContext | null = null;

/**
 * Plays a retro 2D RPG-style text blip sound using the Web Audio API.
 * Synthesized dynamically with zero dependencies or external audio assets.
 */
export function playTextBlip(character: 'frieren' | 'fern' | 'stark' = 'frieren', volumeSetting: number = 0.5) {
  try {
    if (typeof window === 'undefined') return;
    if (volumeSetting <= 0) return; // Completely muted

    // Lazily initialize AudioContext on user interaction
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Custom frequency configurations for different characters to match personality
    let freq = 180; 
    let type: OscillatorType = 'triangle'; // Soft retro chime

    if (character === 'frieren') {
      freq = 320; // High, calm, and magical
      type = 'sine';
    } else if (character === 'fern') {
      freq = 240; // Soft and quiet
      type = 'triangle';
    } else if (character === 'stark') {
      freq = 145; // Low and slightly blunt
      type = 'triangle'; // triangle is cleaner and less harsh than square
    }

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Quick pitch decay for a snappier "bt" sound
    osc.frequency.exponentialRampToValueAtTime(freq * 0.65, audioCtx.currentTime + 0.04);

    // Snappy gain decay envelope scaled by volumeSetting (max volume 0.22)
    const computedGain = 0.22 * volumeSetting;
    gainNode.gain.setValueAtTime(computedGain, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    // Ignore audio context autoplay blocking/suspension errors
  }
}
