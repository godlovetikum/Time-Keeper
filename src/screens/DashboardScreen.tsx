import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { refreshFromNative, useTimers } from '../store/timersStore';
import TimerCard from '../components/TimerCard';
import Button from '../components/Button';
import { checkAll } from '../utils/permissions';
import { RootStackParamList } from '../navigation/RootNavigator';
import { formatMs } from '../utils/time';

export default function DashboardScreen() {
  const { tokens } = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const timers = useTimers(s => s.timers);
  const [needsPerm, setNeedsPerm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    refreshFromNative();
    const p = await checkAll();
    setNeedsPerm(!p.usageAccess || !p.overlay);
  }, []);

  useFocusEffect(useCallback(() => { refresh(); const t = setInterval(refresh, 5000); return () => clearInterval(t); }, [refresh]));

  const totalUsed = timers.reduce((a, t) => a + t.usedMs, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tokens.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.h1, { color: tokens.text }]}>Today</Text>
        <Text style={[styles.h2, { color: tokens.textMuted }]}>{formatMs(totalUsed)} tracked across {timers.length} app{timers.length === 1 ? '' : 's'}</Text>
      </View>
      {needsPerm && (
        <View style={[styles.banner, { backgroundColor: tokens.accentSoft, borderColor: tokens.accent }]}>
          <Text style={[styles.bannerText, { color: tokens.text }]}>TimeKeeper needs Usage Access and Overlay permission to enforce timers.</Text>
          <Button title="Grant permissions" onPress={() => nav.navigate('Permissions')} />
        </View>
      )}
      <FlatList
        data={timers}
        keyExtractor={t => t.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refresh(); setRefreshing(false); }} />}
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={[{ color: tokens.textMuted, textAlign: 'center', marginBottom: 16 }]}>No timers yet. Pick an app to track from the Apps tab.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TimerCard timer={item} onPress={() => nav.navigate('TimerEdit', { id: item.id })} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  h1: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 14, marginTop: 4 },
  banner: { margin: 16, padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  bannerText: { fontSize: 13, lineHeight: 18 },
});
