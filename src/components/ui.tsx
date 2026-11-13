import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

export const colors = {
  ink: '#19152B', purple: '#5B2BF5', green: '#5B2BF5', purpleDark: '#4217C9',
  purpleSoft: '#F1EDFF', muted: '#777287', light: '#F7F5FC', border: '#E8E3F1',
  cream: '#FBFAFE', white: '#FFFFFF', error: '#C53B50', success: '#27A36A', orange: '#FF8A4C',
};

export function Button({ title, onPress, secondary, disabled, icon }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.buttonSecondary, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>{icon && <MaterialCommunityIcons name={icon} size={20} color={secondary ? colors.purple : '#fff'}/>}<Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text></Pressable>;
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor="#AAA4B7" {...props} style={[styles.input, props.multiline && styles.multiline, props.style]}/></View>;
}

export function Select({ label, value, options, placeholder, onChange, disabled }: { label: string; value: string; options: { value: string; label: string }[]; placeholder: string; onChange: (value: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false); const selected = options.find(option => option.value === value);
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><Pressable accessibilityRole="button" disabled={disabled} onPress={() => setOpen(previous => !previous)} style={[styles.input, styles.select, disabled && styles.disabled]}><Text style={selected ? styles.selectText : styles.selectPlaceholder}>{selected?.label || placeholder}</Text><MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={21} color={colors.muted}/></Pressable>{open && !disabled && <View style={styles.selectMenu}>{options.map(option => <Pressable accessibilityRole="button" key={option.value} onPress={() => { onChange(option.value); setOpen(false); }} style={styles.selectOption}><Text style={styles.selectText}>{option.label}</Text>{option.value === value && <MaterialCommunityIcons name="check-circle" size={19} color={colors.purple}/>}</Pressable>)}</View>}</View>;
}

export function ErrorText({ message }: { message: string }) { return message ? <Text accessibilityRole="alert" style={styles.error}>{message}</Text> : null; }

export function ScreenModal({ visible, title, subtitle, onClose, children }: { visible: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}><SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.modalHeader}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onClose} style={styles.close}><MaterialCommunityIcons name="arrow-left" size={24} color={colors.ink}/></Pressable><View style={styles.headerCopy}><Text style={styles.modalTitle}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View><View style={styles.headerSpacer}/></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalBody}>{children}</ScrollView></KeyboardAvoidingView></SafeAreaView></Modal>;
}

export function Loading({ text = 'Loading...' }: { text?: string }) { return <View style={styles.loading}><ActivityIndicator color={colors.purple}/><Text style={styles.muted}>{text}</Text></View>; }
export function Note({ children }: { children: React.ReactNode }) { return <Text style={styles.note}>{children}</Text>; }
export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>; }

export const styles = StyleSheet.create({
  flex: { flex: 1 }, safe: { flex: 1, backgroundColor: colors.white },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 28 : 10, paddingBottom: 16, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  headerCopy: { flex: 1, alignItems: 'center', paddingHorizontal: 8 }, headerSpacer: { width: 42 },
  modalTitle: { color: colors.ink, fontSize: 21, fontWeight: '800', letterSpacing: -.4, textAlign: 'center' }, subtitle: { color: colors.muted, lineHeight: 18, marginTop: 3, fontSize: 12, textAlign: 'center' }, close: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.light, alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: 20, gap: 16, paddingBottom: 56, backgroundColor: colors.cream },
  button: { minHeight: 52, borderRadius: 16, backgroundColor: colors.purple, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 13, shadowColor: colors.purple, shadowOpacity: .16, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  buttonSecondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#DCD5EE', shadowOpacity: 0, elevation: 0 }, buttonText: { fontSize: 15, fontWeight: '800', color: colors.white }, secondaryText: { color: colors.purple }, disabled: { opacity: .5 }, pressed: { transform: [{ scale: .99 }], opacity: .9 },
  field: { gap: 8 }, label: { fontSize: 13, fontWeight: '800', color: '#413B50' }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: colors.ink, backgroundColor: colors.white, fontSize: 15, minHeight: 50 }, multiline: { minHeight: 112, textAlignVertical: 'top' }, select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, selectText: { color: colors.ink, fontSize: 15 }, selectPlaceholder: { color: '#AAA4B7', fontSize: 15 }, selectMenu: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.white }, selectOption: { minHeight: 48, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  error: { backgroundColor: '#FFF0F3', color: colors.error, padding: 13, borderRadius: 12, overflow: 'hidden', lineHeight: 20 }, note: { fontSize: 12, color: colors.muted, lineHeight: 19 }, muted: { color: colors.muted }, loading: { padding: 32, alignItems: 'center', gap: 10 },
  chip: { borderRadius: 22, paddingHorizontal: 15, paddingVertical: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginRight: 8 }, chipActive: { backgroundColor: colors.purple, borderColor: colors.purple }, chipText: { color: colors.muted, fontSize: 12, fontWeight: '800' }, chipTextActive: { color: colors.white },
});
