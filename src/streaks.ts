const DAY = 24 * 60 * 60 * 1000;

export const toDateKey = (date: Date): string => date.toISOString().slice(0, 10);

const normalize = (keys: string[]): number[] =>
  Array.from(new Set(keys))
    .map((k) => new Date(`${k}T00:00:00`).getTime())
    .sort((a, b) => a - b);

export const computeBestStreak = (keys: string[]): number => {
  const values = normalize(keys);
  if (!values.length) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < values.length; i += 1) {
    if (values[i] - values[i - 1] === DAY) {
      current += 1;
      if (current > best) best = current;
    } else {
      current = 1;
    }
  }

  return best;
};

export const computeActiveStreak = (keys: string[]): number => {
  const dateSet = new Set(keys);
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (dateSet.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setTime(cursor.getTime() - DAY);
  }

  return streak;
};

export const buildHeatmap = (keys: string[], days = 84): { date: string; done: boolean }[] => {
  const dateSet = new Set(keys);
  const items: { date: string; done: boolean }[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(cursor.getTime() - i * DAY);
    const key = toDateKey(d);
    items.push({ date: key, done: dateSet.has(key) });
  }

  return items;
};
