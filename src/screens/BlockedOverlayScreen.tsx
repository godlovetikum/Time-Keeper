import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Overlay from '../native/Overlay';

/**
 * Headless component rendered inside the system overlay window when a timer
 * has expired for a tracked app. Stand-alone — uses no theme provider since
 * the overlay window is mounted outside the main React tree.
 */
export default function BlockedOverlayScreen({ packageName, message }: { packageName?: string; message?: string }) {
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Time's up</Text>
        <Text style={styles.sub}>{message ?? `Your timer for ${packageName ?? 'this app'} has expired.`}</Text>
        <Pressable onPress={() => Overlay.hide()} style={styles.btn}>
          <Text style={styles.btnText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(8,12,24,0.92)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#141B2D', borderRadius: 24, padding: 24, alignItems: 'center', gap: 12, width: '100%', maxWidth: 360 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  sub: { color: '#B8C0D6', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  btn: { backgroundColor: '#7C9CFF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 8 },
  btnText: { color: '#0B1220', fontWeight: '700' },
});
