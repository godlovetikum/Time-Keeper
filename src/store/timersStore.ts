import { create } from 'zustand';
import { getJSON, setJSON, storage } from './storage';
import { Timer } from '../types';
import TimerService from '../native/TimerService';

const KEY = 'timers';

type TimersState = {
  timers: Timer[];
  hydrate: () => void;
  upsert: (t: Timer) => void;
  remove: (id: string) => void;
  extend: (id: string, addMs: number) => void;
  syncToService: () => void;
};

export const useTimers = create<TimersState>((set, get) => ({
  timers: getJSON<Timer[]>(KEY, []),
  hydrate: () => set({ timers: getJSON<Timer[]>(KEY, []) }),
  upsert: t => {
    const list = get().timers.slice();
    const i = list.findIndex(x => x.id === t.id);
    if (i >= 0) list[i] = t; else list.push(t);
    set({ timers: list });
    setJSON(KEY, list);
    get().syncToService();
  },
  remove: id => {
    const list = get().timers.filter(x => x.id !== id);
    set({ timers: list });
    setJSON(KEY, list);
    get().syncToService();
  },
  extend: (id, addMs) => {
    const list = get().timers.map(t => {
      if (t.id !== id) return t;
      if (t.extension?.used) return t;
      const capped = Math.min(addMs, 60 * 60_000);
      return { ...t, warned: false, expired: false, extension: { used: true, addedMs: capped, extendedAt: Date.now() } };
    });
    set({ timers: list });
    setJSON(KEY, list);
    get().syncToService();
  },
  syncToService: () => {
    const json = JSON.stringify(get().timers);
    // Mirror to SharedPreferences via native module
    TimerService.update(json).catch(() => {});
  },
}));

/** Re-pulls counters/flags written by the native service. Call on screen focus. */
export function refreshFromNative() {
  // The native side writes back into the same key when polling; storage is shared file.
  useTimers.getState().hydrate();
}

// Ensure storage exists even on first run
storage.contains(KEY) || setJSON(KEY, []);
