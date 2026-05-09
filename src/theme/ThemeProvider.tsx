import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkTokens, lightTokens, ThemeTokens } from './tokens';
import { useSettings } from '../store/settingsStore';

type Ctx = { tokens: ThemeTokens; isDark: boolean };
const ThemeCtx = createContext<Ctx>({ tokens: lightTokens, isDark: false });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sys = useColorScheme();
  const themePref = useSettings(s => s.themePref);
  const isDark = themePref === 'system' ? sys === 'dark' : themePref === 'dark';
  const value = useMemo(() => ({ tokens: isDark ? darkTokens : lightTokens, isDark }), [isDark]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
