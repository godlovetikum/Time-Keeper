import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Timer } from '../types';
import UsageBar from './UsageBar';

export default function TimerCard({ timer, onPress }: { timer: Timer; onPress: () => void }) {
  const { tokens } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.card,
      { backgroundColor: tokens.surface, borderColor: tokens.border, opacity: pressed ? 0.85 : 1 },
    ]}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: tokens.text }]} numberOfLines={1}>{timer.appLabel}</Text>
        {timer.expired ? (
          <Text style={[styles.tag, { backgroundColor: tokens.danger, color: '#fff' }]}>BLOCKED</Text>
        ) : timer.extension?.used ? (
          <Text style={[styles.tag, { backgroundColor: tokens.accentSoft, color: tokens.accent }]}>EXTENDED</Text>
        ) : null}
      </View>
      <Text style={[styles.pkg, { color: tokens.textMuted }]} numberOfLines={1}>{timer.packageName}</Text>
      <View style={{ marginTop: 10 }}><UsageBar timer={timer} /></View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  pkg: { fontSize: 12, marginTop: 2 },
  tag: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
});
