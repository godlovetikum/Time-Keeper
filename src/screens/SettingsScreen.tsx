import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { useSettings } from '../store/settingsStore';
import Button from '../components/Button';
import Root from '../native/Root';
import { formatMinutes } from '../utils/time';

export default function SettingsScreen() {
  const { tokens } = useTheme();
  const nav = useNavigation<any>();
  const s = useSettings();
  const [rooted, setRooted] = useState<boolean | null>(null);

  useEffect(() => { Root.isRooted().then(setRooted); }, []);

  const toggleRoot = (v: boolean) => {
    if (!v) { s.setRootShutdown(false); return; }
    if (!rooted) { Alert.alert('Not rooted', 'Force shutdown requires a rooted device.'); return; }
    Alert.alert('Enable root shutdown?', 'Timers configured for force shutdown will power off your device on expiry.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Enable', style: 'destructive', onPress: () => s.setRootShutdown(true) }]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={[styles.h1, { color: tokens.text }]}>Settings</Text>

        <Section title="Appearance" tokens={tokens}>
          <ThemePicker tokens={tokens} value={s.themePref} onChange={s.setThemePref} />
        </Section>

        <Section title="Extension" tokens={tokens}>
          <Text style={[styles.label, { color: tokens.text }]}>Default extension: {formatMinutes(s.defaultExtendMinutes)}</Text>
          <Slider minimumValue={5} maximumValue={60} step={5}
            value={s.defaultExtendMinutes} onValueChange={s.setDefaultExtend}
            minimumTrackTintColor={tokens.accent} maximumTrackTintColor={tokens.border} thumbTintColor={tokens.accent} />
          <Text style={[styles.hint, { color: tokens.textMuted }]}>Maximum 60 min. Each timer can be extended once per period.</Text>
        </Section>

        <Section title="Enforcement" tokens={tokens}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: tokens.text }]}>Root force-shutdown</Text>
              <Text style={[styles.hint, { color: tokens.textMuted }]}>{rooted === null ? 'Checking…' : rooted ? 'Available' : 'Device is not rooted'}</Text>
            </View>
            <Switch value={s.rootShutdownEnabled} onValueChange={toggleRoot} trackColor={{ true: tokens.danger, false: tokens.border }} />
          </View>
        </Section>

        <Button title="Manage permissions" variant="secondary" onPress={() => nav.navigate('Permissions')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, tokens }: any) {
  return (
    <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      <Text style={[styles.section, { color: tokens.textMuted }]}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function ThemePicker({ tokens, value, onChange }: { tokens: any; value: 'system' | 'light' | 'dark'; onChange: (v: any) => void }) {
  const opts: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {opts.map(o => {
        const active = value === o;
        return (
          <View key={o} style={{ flex: 1 }}>
            <Button title={o[0].toUpperCase() + o.slice(1)} variant={active ? 'primary' : 'ghost'} onPress={() => onChange(o)} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  section: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 4 },
  label: { fontSize: 15, fontWeight: '600' },
  hint: { fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
});
