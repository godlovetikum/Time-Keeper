import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Timer } from '../types';
import { formatMs } from '../utils/time';

export default function UsageBar({ timer }: { timer: Timer }) {
  const { tokens } = useTheme();
  const budget = timer.budgetMs + (timer.extension?.used ? (timer.extension.addedMs ?? 0) : 0);
  const pct = Math.min(100, (timer.usedMs / Math.max(1, budget)) * 100);
  const danger = pct >= 90;
  const color = timer.expired ? tokens.danger : danger ? tokens.warn : tokens.accent;
  return (
    <View>
      <View style={[styles.track, { backgroundColor: tokens.surfaceAlt }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.row}>
        <Text style={[styles.lbl, { color: tokens.textMuted }]}>{formatMs(timer.usedMs)} used</Text>
        <Text style={[styles.lbl, { color: tokens.textMuted }]}>of {formatMs(budget)}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  lbl: { fontSize: 12 },
});
