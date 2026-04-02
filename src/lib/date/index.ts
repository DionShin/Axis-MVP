export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function today(): string {
  return toDateString(new Date());
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
}

// Returns array of date strings for a given range (inclusive)
export function dateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(toDateString(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// Returns last N weeks as array of week objects
export function getLastNWeeks(n: number): { weekStart: string; days: string[] }[] {
  const result = [];
  const now = new Date();
  for (let w = n - 1; w >= 0; w--) {
    const ref = new Date(now);
    ref.setDate(now.getDate() - w * 7);
    const { start, end } = getWeekRange(ref);
    result.push({ weekStart: toDateString(start), days: dateRange(start, end) });
  }
  return result;
}

// Returns all days in a given month
export function getMonthDays(year: number, month: number): string[] {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return dateRange(start, end);
}

export function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function dayOfWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()];
}
