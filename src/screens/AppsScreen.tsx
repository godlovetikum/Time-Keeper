import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import UsageStats from '../native/UsageStats';
import { InstalledApp } from '../types';
import { useTimers } from '../store/timersStore';
import { RootStackParamList } from '../navigation/RootNavigator';

export default function AppsScreen() {
  const { tokens } = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [apps, setApps] = useState<InstalledApp[] | null>(null);
  const [q, setQ] = useState('');
  const tracked = useTimers(s => new Set(s.timers.map(t => t.packageName)));

  useEffect(() => {
    UsageStats.listInstalledApps(false).then(list => {
      list.sort((a, b) => a.label.localeCompare(b.label));
      setApps(list);
    }).catch(() => setApps([]));
  }, []);

  const filtered = useMemo(() =>
    (apps ?? []).filter(a => a.label.toLowerCase().includes(q.toLowerCase()) || a.packageName.toLowerCase().includes(q.toLowerCase())),
  [apps, q]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tokens.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.h1, { color: tokens.text }]}>Apps</Text>
        <TextInput
          placeholder="Search apps"
          placeholderTextColor={tokens.textMuted}
          value={q}
          onChangeText={setQ}
          style={[styles.input, { backgroundColor: tokens.surface, borderColor: tokens.border, color: tokens.text }]}
        />
      </View>
      {!apps ? (
        <ActivityIndicator color={tokens.accent} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={a => a.packageName}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => nav.navigate('TimerEdit', { packageName: item.packageName, appLabel: item.label })}
              style={({ pressed }) => [styles.row, { backgroundColor: tokens.surface, borderColor: tokens.border, opacity: pressed ? 0.8 : 1 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: tokens.text }]}>{item.label}</Text>
                <Text style={[styles.pkg, { color: tokens.textMuted }]}>{item.packageName}</Text>
              </View>
              {tracked.has(item.packageName) && (
                <Text style={[styles.badge, { color: tokens.accent, borderColor: tokens.accent }]}>TRACKED</Text>
              )}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  h1: { fontSize: 32, fontWeight: '800', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  label: { fontSize: 15, fontWeight: '600' },
  pkg: { fontSize: 11, marginTop: 2 },
  badge: { fontSize: 10, fontWeight: '700', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
});
