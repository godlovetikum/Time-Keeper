import { create } from 'zustand';
import { getJSON, setJSON } from './storage';

type ThemePref = 'system' | 'light' | 'dark';

type SettingsState = {
  themePref: ThemePref;
  rootShutdownEnabled: boolean;
  defaultExtendMinutes: number; // 5..60
  setThemePref: (p: ThemePref) => void;
  setRootShutdown: (v: boolean) => void;
  setDefaultExtend: (m: number) => void;
};

const KEY = 'settings';
const initial = getJSON(KEY, {
  themePref: 'system' as ThemePref,
  rootShutdownEnabled: false,
  defaultExtendMinutes: 30,
});

export const useSettings = create<SettingsState>((set, get) => ({
  ...initial,
  setThemePref: p => { set({ themePref: p }); setJSON(KEY, { ...get(), themePref: p }); },
  setRootShutdown: v => { set({ rootShutdownEnabled: v }); setJSON(KEY, { ...get(), rootShutdownEnabled: v }); },
  setDefaultExtend: m => { const c = Math.max(5, Math.min(60, Math.round(m))); set({ defaultExtendMinutes: c }); setJSON(KEY, { ...get(), defaultExtendMinutes: c }); },
}));
