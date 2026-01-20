export const REGION_COLOR_PALETTE = [
  '#0ea5e9',
  '#22c55e',
  '#eab308',
  '#f97316',
  '#ef4444',
  '#a855f7',
  '#14b8a6',
  '#3b82f6',
  '#84cc16',
  '#f43f5e',
  '#64748b',
  '#d97706',
];

export const pickRandomRegionColor = () => {
  const index = Math.floor(Math.random() * REGION_COLOR_PALETTE.length);
  return REGION_COLOR_PALETTE[index];
};
