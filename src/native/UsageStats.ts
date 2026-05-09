import { NativeModules } from 'react-native';
import { InstalledApp } from '../types';

const { UsageStats } = NativeModules;

export default {
  hasPermission: (): Promise<boolean> => UsageStats.hasPermission(),
  listInstalledApps: (includeSystem = false): Promise<InstalledApp[]> =>
    UsageStats.listInstalledApps(includeSystem),
  queryForegroundMs: (startMs: number, endMs: number): Promise<Record<string, number>> =>
    UsageStats.queryForegroundMs(startMs, endMs),
  currentForegroundPackage: (): Promise<string | null> => UsageStats.currentForegroundPackage(),
};
