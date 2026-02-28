export const toLLMDate = (date: Date) => ({
  isoDate: date.toISOString(),
  timestamp: Math.round(date.getTime() / 1000),
});

export const getSecondsRemaining = (date: Date) =>
  Math.max(Math.round((date.getTime() - Date.now()) / 1000), 0);
