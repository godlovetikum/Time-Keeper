export type ExpiryActions = {
  overlay: boolean;
  lockScreen: boolean;
  rootShutdown: boolean;
};

export type Extension = {
  used: boolean;
  addedMs?: number;
  extendedAt?: number;
};

export type Timer = {
  id: string;
  packageName: string;
  appLabel: string;
  mode: 'daily-quota' | 'session';
  budgetMs: number;
  resetCron: 'daily-midnight' | 'none';
  expiryActions: ExpiryActions;
  extension: Extension;
  usedMs: number;
  periodStart: number;
  warned?: boolean;
  expired?: boolean;
};

export type InstalledApp = {
  packageName: string;
  label: string;
  isSystem: boolean;
};
