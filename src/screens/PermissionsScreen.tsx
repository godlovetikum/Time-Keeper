import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { checkAll, open, PermissionStatus } from '../utils/permissions';
import Button from '../components/Button';
import DeviceAdmin from '../native/DeviceAdmin';

export default function PermissionsScreen() {
  const { tokens } = useTheme();
  const [s, setS] = useState<PermissionStatus>({ usageAccess: false, overlay: false, deviceAdmin: false });

  const refresh = useCallback(() => { checkAll().then(setS); }, []);
  useFocusEffect(useCallback(() => { refresh(); const t = setInterval(refresh, 1500); return () => clearInterval(t); }, [refresh]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={[styles.intro, { color: tokens.textMuted }]}>
          TimeKeeper needs these to track and enforce timers. All processing stays on your device.
        </Text>

        <Item
          title="Usage access"
          desc="Required. Lets TimeKeeper see which app is in the foreground and how long."
          granted={s.usageAccess}
          onPress={() => open.openUsageAccessSettings()}
          tokens={tokens}
        />
        <Item
          title="Display over other apps"
          desc="Required. Used to show the blocking overlay when a timer expires."
          granted={s.overlay}
          onPress={() => open.openOverlaySettings()}
          tokens={tokens}
        />
        <Item
          title="Accessibility service"
          desc="Required. Detects foreground app changes to enforce blocks."
          granted={null}
          onPress={() => open.openAccessibilitySettings()}
          tokens={tokens}
          ctaLabel="Open accessibility settings"
        />
        <Item
          title="Device admin (lock screen)"
          desc="Optional. Allows TimeKeeper to lock the screen on expiry."
          granted={s.deviceAdmin}
          onPress={() => DeviceAdmin.requestActivation('TimeKeeper uses this to lock your screen when a timer expires.')}
          tokens={tokens}
        />
        <Item
          title="Disable battery optimization"
          desc="Recommended. Keeps the timer service alive in the background."
          granted={null}
          onPress={() => open.openBatteryOptimizationSettings()}
          tokens={tokens}
          ctaLabel="Open battery settings"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Item({ title, desc, granted, onPress, tokens, ctaLabel }: {
  title: string; desc: string; granted: boolean | null; onPress: () => void; tokens: any; ctaLabel?: string;
}) {
  return (
    <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: tokens.text }]}>{title}</Text>
        {granted === true && <Text style={[styles.tag, { color: '#fff', backgroundColor: tokens.success }]}>GRANTED</Text>}
        {granted === false && <Text style={[styles.tag, { color: '#fff', backgroundColor: tokens.danger }]}>MISSING</Text>}
      </View>
      <Text style={[styles.desc, { color: tokens.textMuted }]}>{desc}</Text>
      <Button title={ctaLabel ?? (granted ? 'Open settings' : 'Grant')} variant={granted ? 'secondary' : 'primary'} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 13, lineHeight: 18 },
  tag: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
});
