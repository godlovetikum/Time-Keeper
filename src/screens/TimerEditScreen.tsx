import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { useTimers } from '../store/timersStore';
import { useSettings } from '../store/settingsStore';
import Button from '../components/Button';
import { RootStackParamList } from '../navigation/RootNavigator';
import { formatMinutes } from '../utils/time';
import Root from '../native/Root';

type RP = RouteProp<RootStackParamList, 'TimerEdit'>;

export default function TimerEditScreen() {
  const { tokens } = useTheme();
  const nav = useNavigation();
  const route = useRoute<RP>();
  const timers = useTimers(s => s.timers);
  const upsert = useTimers(s => s.upsert);
  const remove = useTimers(s => s.remove);
  const extend = useTimers(s => s.extend);
  const rootEnabled = useSettings(s => s.rootShutdownEnabled);
  const defaultExtend = useSettings(s => s.defaultExtendMinutes);

  const existing = useMemo(() => timers.find(t => t.id === route.params?.id), [timers, route.params]);

  const [budgetMin, setBudgetMin] = useState(existing ? Math.round(existing.budgetMs / 60_000) : 60);
  const [overlay, setOverlay] = useState(existing?.expiryActions.overlay ?? true);
  const [lockScreen, setLockScreen] = useState(existing?.expiryActions.lockScreen ?? false);
  const [rootShutdown, setRootShutdown] = useState(existing?.expiryActions.rootShutdown ?? false);

  const pkg = existing?.packageName ?? route.params?.packageName ?? '';
  const label = existing?.appLabel ?? route.params?.appLabel ?? pkg;

  const save = () => {
    if (!pkg) return;
    upsert({
      id: existing?.id ?? `${pkg}-${Date.now()}`,
      packageName: pkg,
      appLabel: label,
      mode: 'daily-quota',
      budgetMs: budgetMin * 60_000,
      resetCron: 'daily-midnight',
      expiryActions: { overlay, lockScreen, rootShutdown: rootShutdown && rootEnabled },
      extension: existing?.extension ?? { used: false },
      usedMs: existing?.usedMs ?? 0,
      periodStart: existing?.periodStart ?? Date.now(),
      warned: existing?.warned ?? false,
      expired: existing?.expired ?? false,
    });
    nav.goBack();
  };

  const onExtend = () => {
    if (!existing) return;
    if (existing.extension?.used) {
      Alert.alert('Already extended', 'You can extend a timer only once per period.');
      return;
    }
    Alert.alert(
      `Extend by ${defaultExtend} min?`,
      'You can only extend once per period (max 60 min).',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Extend', onPress: () => extend(existing.id, defaultExtend * 60_000) },
      ]
    );
  };

  const confirmRoot = (val: boolean) => {
    if (!val) { setRootShutdown(false); return; }
    Root.isRooted().then(rooted => {
      if (!rooted) { Alert.alert('Not rooted', 'Force shutdown is only available on rooted devices.'); return; }
      Alert.alert(
        'Force shutdown on expiry?',
        'When this timer expires, the device will power off via su. You will lose unsaved work.',
        [{ text: 'Cancel', style: 'cancel' }, { text: 'I understand', style: 'destructive', onPress: () => setRootShutdown(true) }]
      );
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <Text style={[styles.label, { color: tokens.textMuted }]}>App</Text>
          <Text style={[styles.value, { color: tokens.text }]}>{label}</Text>
          <Text style={[styles.pkg, { color: tokens.textMuted }]}>{pkg}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <Text style={[styles.label, { color: tokens.textMuted }]}>Daily budget</Text>
          <Text style={[styles.value, { color: tokens.text }]}>{formatMinutes(budgetMin)}</Text>
          <Slider
            minimumValue={5} maximumValue={480} step={5}
            value={budgetMin} onValueChange={setBudgetMin}
            minimumTrackTintColor={tokens.accent}
            maximumTrackTintColor={tokens.border}
            thumbTintColor={tokens.accent}
          />
        </View>

        <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <Text style={[styles.label, { color: tokens.textMuted, marginBottom: 8 }]}>When time is up</Text>
          <Row label="Show blocking overlay" value={overlay} onChange={setOverlay} tokens={tokens} />
          <Row label="Lock the screen" value={lockScreen} onChange={setLockScreen} tokens={tokens} />
          {rootEnabled && <Row label="Force shutdown (root)" value={rootShutdown} onChange={confirmRoot} tokens={tokens} danger />}
        </View>

        {existing && (
          <Button title={existing.extension?.used ? 'Extension already used' : `Extend ${defaultExtend} min (one-time)`} variant="secondary" onPress={onExtend} disabled={existing.extension?.used} />
        )}

        <Button title={existing ? 'Save changes' : 'Create timer'} onPress={save} />
        {existing && <Button title="Delete timer" variant="danger" onPress={() => { remove(existing.id); nav.goBack(); }} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, onChange, tokens, danger }: { label: string; value: boolean; onChange: (v: boolean) => void; tokens: any; danger?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: danger ? tokens.danger : tokens.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: tokens.accent, false: tokens.border }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  pkg: { fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
});
