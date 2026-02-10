export const normalizeTime = (time: any): string => {
  if (!time) return '';
  if (typeof time === 'string') return time.slice(0, 5); // "14:30:00" → "14:30"
  if (time instanceof Date) return time.toISOString().substring(11, 16);
  return '';
};
