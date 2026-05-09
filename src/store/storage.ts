import { MMKV } from 'react-native-mmkv';
export const storage = new MMKV({ id: 'timekeeper' });

export function getJSON<T>(key: string, fallback: T): T {
  const raw = storage.getString(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}
export function setJSON(key: string, value: unknown) {
  storage.set(key, JSON.stringify(value));
}
