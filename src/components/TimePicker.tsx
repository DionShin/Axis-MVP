import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { WheelPicker, PICKER_HEIGHT } from './WheelPicker';
import { useColors } from '../hooks/useColors';
import { typography } from '../theme';

const PERIODS = ['AM', 'PM'];
const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

function parseTime(time: string): { periodIdx: number; hourIdx: number; minuteIdx: number } {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const periodIdx = h < 12 ? 0 : 1;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { periodIdx, hourIdx: hour12 - 1, minuteIdx: Math.round(m / 5) % 12 };
}

function buildTime(periodIdx: number, hourIdx: number, minuteIdx: number): string {
  const hour12 = hourIdx + 1;
  const hour24 = periodIdx === 0
    ? (hour12 === 12 ? 0 : hour12)
    : (hour12 === 12 ? 12 : hour12 + 12);
  return `${String(hour24).padStart(2, '0')}:${String(minuteIdx * 5).padStart(2, '0')}`;
}

interface Props {
  value: string;
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: Props) {
  const c = useColors();
  const initial = parseTime(value);
  const [state, setState] = useState(initial);

  const update = (next: Partial<typeof state>) => {
    const merged = { ...state, ...next };
    setState(merged);
    onChange(buildTime(merged.periodIdx, merged.hourIdx, merged.minuteIdx));
  };

  return (
    <View style={{ height: PICKER_HEIGHT, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <WheelPicker items={PERIODS} initialIndex={state.periodIdx} onChange={(i) => update({ periodIdx: i })} width={60} />
      <WheelPicker items={HOURS}   initialIndex={state.hourIdx}   onChange={(i) => update({ hourIdx: i })}   width={60} />
      <Text style={{ ...typography.h2, color: c.text, marginBottom: 2 }}>:</Text>
      <WheelPicker items={MINUTES} initialIndex={state.minuteIdx} onChange={(i) => update({ minuteIdx: i })} width={60} />
    </View>
  );
}
