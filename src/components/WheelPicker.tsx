import React, { useRef, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useColors } from '../hooks/useColors';

const ITEM_HEIGHT = 46;
const VISIBLE_ITEMS = 5;
export const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface Props {
  items: string[];
  initialIndex?: number;
  onChange: (index: number) => void;
  width?: number;
}

export function WheelPicker({ items, initialIndex = 0, onChange, width = 80 }: Props) {
  const c = useColors();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const handleContentSizeChange = useCallback(() => {
    scrollRef.current?.scrollTo({ y: initialIndex * ITEM_HEIGHT, animated: false });
  }, [initialIndex]);

  const snapToIndex = (y: number) => {
    const index = Math.max(0, Math.min(Math.round(y / ITEM_HEIGHT), items.length - 1));
    setActiveIndex(index);
    onChange(index);
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapToIndex(e.nativeEvent.contentOffset.y);
  };

  const handleScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setTimeout(() => snapToIndex(y), 50);
  };

  // Fade overlay color matches the background
  const fadeColor = c.background;

  return (
    <View style={[styles.container, { width }]}>
      <View style={[styles.selectionBar, { borderColor: c.border }]} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollEndDrag={handleScrollEndDrag}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        scrollEventThrottle={16}
      >
        {items.map((label, i) => {
          const distance = Math.abs(i - activeIndex);
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.4 : 0.15;
          const fontSize = distance === 0 ? 22 : 17;
          const fontWeight = distance === 0 ? ('600' as const) : ('400' as const);
          return (
            <View key={i} style={styles.item}>
              <Text style={[styles.itemText, { opacity, fontSize, fontWeight, color: c.text }]}>
                {label}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.fadeTop, { backgroundColor: fadeColor + 'BF' }]} pointerEvents="none" />
      <View style={[styles.fadeBottom, { backgroundColor: fadeColor + 'BF' }]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: PICKER_HEIGHT, overflow: 'hidden' },
  selectionBar: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 1,
  },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  itemText: {},
  fadeTop: { position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_HEIGHT * 2 },
  fadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_HEIGHT * 2 },
});
