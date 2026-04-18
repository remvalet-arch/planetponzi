/**
 * Sons de jeu via Web Audio (sans assets externes).
 * `AudioContext` peut exiger un geste utilisateur : `resumeAudio()` au premier clic carte / jeu.
 */

let ctx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function resumeAudio(): void {
  const c = getAudioContext();
  if (c?.state === "suspended") void c.resume().catch(() => {});
}

function beep(
  freq: number,
  durationSec: number,
  type: OscillatorType = "sine",
  gain = 0.12,
  when?: number,
): void {
  const c = getAudioContext();
  if (!c) return;
  const t0 = when ?? c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + durationSec + 0.02);
}

/** Placement / démolition validé. */
export function playPlacementPop(): void {
  resumeAudio();
  beep(920, 0.045, "sine", 0.1);
}

/** Marché noir refusé, etc. */
export function playErrorBuzzer(): void {
  resumeAudio();
  beep(140, 0.12, "square", 0.08);
  const c = getAudioContext();
  if (c) beep(110, 0.14, "square", 0.06, c.currentTime + 0.05);
}

/** Au moins 1★ en fin de partie. */
export function playVictoryCash(): void {
  resumeAudio();
  const c = getAudioContext();
  if (!c) return;
  const base = c.currentTime;
  beep(523.25, 0.08, "sine", 0.11, base);
  beep(659.25, 0.09, "sine", 0.1, base + 0.07);
  beep(783.99, 0.12, "sine", 0.12, base + 0.14);
  beep(1046.5, 0.15, "sine", 0.09, base + 0.24);
}

/** Achat réussi sur la Tour. */
export function playEmpirePurchase(): void {
  resumeAudio();
  const c = getAudioContext();
  if (!c) return;
  const base = c.currentTime;
  beep(659, 0.1, "triangle", 0.09, base);
  beep(880, 0.14, "sine", 0.1, base + 0.08);
}

/**
 * Fusion industrielle 2×2 : arpège ascendant + brillante finale (récompense « juice »).
 */
export function playMegaFusion(): void {
  resumeAudio();
  const c = getAudioContext();
  if (!c) return;
  let t = c.currentTime + 0.02;
  const rung: [number, number, OscillatorType, number][] = [
    [392, 0.1, "triangle", 0.085],
    [493.88, 0.1, "triangle", 0.09],
    [523.25, 0.11, "sine", 0.095],
    [659.25, 0.12, "sine", 0.105],
    [783.99, 0.13, "sine", 0.115],
    [987.77, 0.14, "sine", 0.12],
    [1174.66, 0.16, "triangle", 0.125],
  ];
  for (const [f, dur, type, gain] of rung) {
    beep(f, dur, type, gain, t);
    t += 0.072;
  }
  beep(1318.51, 0.32, "sine", 0.095, t + 0.04);
}
