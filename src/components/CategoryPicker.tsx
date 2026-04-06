import React, { useState, useRef } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useColors } from '../hooks/useColors';
import { spacing, typography, radius, AppColors } from '../theme';
import {
  useCategoryStore,
  BASE_CATEGORIES,
  categoryLabel,
} from '../store/categoryStore';

interface Props {
  selected: string;
  onChange: (cat: string) => void;
}

export function CategoryPicker({ selected, onChange }: Props) {
  const c = useColors();
  const styles = makeStyles(c);
  const { customCategories, addCustomCategory } = useCategoryStore();
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<TextInput>(null);

  const allCategories = [...BASE_CATEGORIES, ...customCategories];

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) {
      addCustomCategory(trimmed);
      // auto-select the new category
      const key = trimmed.toLowerCase().replace(/\s+/g, '_');
      onChange(key);
    }
    setInput('');
    setAdding(false);
  };

  const handleStartAdding = () => {
    setAdding(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <View style={styles.container}>
      {allCategories.map((cat) => (
        <Pressable
          key={cat}
          style={[styles.item, selected === cat && styles.itemSelected]}
          onPress={() => onChange(cat)}
        >
          <Text style={[styles.itemText, selected === cat && styles.itemTextSelected]}>
            {categoryLabel(cat)}
          </Text>
        </Pressable>
      ))}

      {adding ? (
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Category name..."
            placeholderTextColor={c.textSecondary}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            autoCapitalize="words"
          />
          <Pressable
            style={[styles.addConfirmBtn, !input.trim() && styles.addConfirmBtnDisabled]}
            onPress={handleAdd}
          >
            <Text style={styles.addConfirmText}>Add</Text>
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={() => { setAdding(false); setInput(''); }}>
            <Text style={styles.cancelText}>✕</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.addBtn} onPress={handleStartAdding}>
          <Text style={styles.addBtnText}>＋ Add category</Text>
        </Pressable>
      )}
    </View>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { gap: spacing.sm },
    item: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    itemSelected: { borderColor: c.primary, backgroundColor: c.primary },
    itemText: { ...typography.body, color: c.text },
    itemTextSelected: { color: c.background, fontWeight: '600' },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      ...typography.body,
      color: c.text,
      backgroundColor: c.surface,
    },
    addConfirmBtn: {
      backgroundColor: c.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
    },
    addConfirmBtnDisabled: { backgroundColor: c.muted },
    addConfirmText: { ...typography.caption, color: c.background, fontWeight: '600' },
    cancelBtn: { padding: spacing.xs },
    cancelText: { color: c.textSecondary, fontSize: 16 },
    addBtn: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      borderStyle: 'dashed',
      alignItems: 'center',
    },
    addBtnText: { ...typography.body, color: c.textSecondary },
  });
}
