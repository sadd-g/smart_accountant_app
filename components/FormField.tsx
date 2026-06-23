import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useColors } from '../hooks/useColors';

interface Props extends TextInputProps {
  label: string;
  required?: boolean;
}

export default function FormField({ label, required, ...rest }: Props) {
  const colors = useColors();
  const { isRTL } = useApp();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
        {label}{required ? ' *' : ''}
      </Text>
      <TextInput
        style={[styles.input, {
          backgroundColor: colors.background,
          borderColor: colors.border,
          color: colors.foreground,
          textAlign: isRTL ? 'right' : 'left',
        }]}
        placeholderTextColor={colors.mutedForeground}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15 },
});
