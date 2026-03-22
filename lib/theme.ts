// lib/theme.ts
// Single source of truth for light/dark colors.
// Add new tokens here — never hardcode colors in components.

export type Theme = typeof darkTheme;

export const darkTheme = {
  // Page / container backgrounds
  pageBg:        'bg-[#0A0C10]',
  cardBg:        'bg-[#0A0C10]',
  cardBgHover:   'hover:bg-[#0f1117]',
  cardBorder:    'border-[#1C2029]',
  cardBorderHover:'hover:border-blue-500/50',
  innerBg:       'bg-[#161B22]/50',
  innerBorder:   'border-[#1C2029]',
  toolbarBg:     'bg-slate-800',
  toolbarBorder: 'border-slate-700',
  tableBg:       'bg-slate-900',
  tableHeadBg:   'bg-[#1e293b]',
  tableRowHover: 'hover:bg-slate-800/60',
  tableRowProject:'bg-emerald-900/10 hover:bg-emerald-900/20',
  tableRowSelected:'bg-indigo-900/20',
  tableDivide:   'divide-slate-800',
  tableBorderCol:'border-slate-700',
  dropdownBg:    'bg-slate-800',
  dropdownBorder:'border-slate-700',
  dropdownHover: 'hover:bg-slate-700',

  // Text
  textPrimary:   'text-white',
  textSecondary: 'text-gray-500',
  textMuted:     'text-slate-400',
  textEmpty:     'text-slate-600',
  textHeading:   'text-white',

  // Scroll hint
  scrollHint:    'bg-slate-800/60 text-slate-400 border-slate-700',
};

export const lightTheme: Theme = {
  // Page / container backgrounds
  pageBg:        'bg-gray-50',
  cardBg:        'bg-white',
  cardBgHover:   'hover:bg-gray-50',
  cardBorder:    'border-gray-200',
  cardBorderHover:'hover:border-blue-400',
  innerBg:       'bg-gray-100/70',
  innerBorder:   'border-gray-200',
  toolbarBg:     'bg-gray-100',
  toolbarBorder: 'border-gray-200',
  tableBg:       'bg-white',
  tableHeadBg:   'bg-gray-50',
  tableRowHover: 'hover:bg-gray-50',
  tableRowProject:'bg-emerald-50 hover:bg-emerald-100/60',
  tableRowSelected:'bg-indigo-50',
  tableDivide:   'divide-gray-100',
  tableBorderCol:'border-gray-200',
  dropdownBg:    'bg-white',
  dropdownBorder:'border-gray-200',
  dropdownHover: 'hover:bg-gray-100',

  // Text
  textPrimary:   'text-gray-900',
  textSecondary: 'text-gray-500',
  textMuted:     'text-gray-400',
  textEmpty:     'text-gray-300',
  textHeading:   'text-gray-900',

  // Scroll hint
  scrollHint:    'bg-gray-100 text-gray-500 border-gray-200',
};

export function getTheme(isDark: boolean): Theme {
  return isDark ? darkTheme : lightTheme;
}