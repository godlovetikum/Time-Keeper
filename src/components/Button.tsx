import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
};

export default function Button({ title, onPress, variant = 'primary', disabled, style }: Props) {
  const { tokens } = useTheme();
  const bg =
    variant === 'primary' ? tokens.accent :
    variant === 'danger' ? tokens.danger :
    variant === 'secondary' ? tokens.surfaceAlt : 'transparent';
  const fg =
    variant === 'primary' || variant === 'danger' ? '#fff' :
    variant === 'secondary' ? tokens.text : tokens.accent;
  const border = variant === 'ghost' ? tokens.border : 'transparent';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, borderColor: border, borderWidth: variant === 'ghost' ? 1 : 0, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={[styles.txt, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  txt: { fontSize: 15, fontWeight: '600' },
});
