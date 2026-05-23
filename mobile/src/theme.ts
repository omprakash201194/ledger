// Design tokens — Ledger dark theme
export const darkTheme = {
  bg:      '#0C1119',
  surf:    '#121A26',
  surf2:   '#182130',
  surf3:   '#1E2A3C',
  bdr:     '#243248',
  bdrF:    '#182030',
  tx:      '#DCE6F0',
  txS:     '#7A96B2',
  txM:     '#465C74',
  brand:   '#3D6E9E',
  brandL:  '#4D85BB',
  gold:    '#C9A96E',
  goldL:   '#D8BB80',
  green:   '#3A9664',
  greenL:  '#48BE7D',
  red:     '#BE4444',
  redL:    '#D96060',
  amber:   '#BE8828',
  amberL:  '#D4A038',
  highBg:  'rgba(190,68,68,0.13)',
  highBdr: 'rgba(190,68,68,0.32)',
  highTx:  '#D96060',
  medBg:   'rgba(190,136,40,0.13)',
  medBdr:  'rgba(190,136,40,0.32)',
  medTx:   '#D4A040',
  lowBg:   'rgba(61,97,140,0.11)',
  lowBdr:  'rgba(61,97,140,0.28)',
  lowTx:   '#6090BA',
} as const;

// Design tokens — Ledger light theme
export const lightTheme = {
  bg:      '#EEF2F7',
  surf:    '#FFFFFF',
  surf2:   '#F5F8FC',
  surf3:   '#EBF0F6',
  bdr:     '#C8D4E0',
  bdrF:    '#DDE5EE',
  tx:      '#1A2A3A',
  txS:     '#4E6478',
  txM:     '#8A9EB0',
  brand:   '#3D6E9E',
  brandL:  '#2D5A8E',
  gold:    '#9A7020',
  goldL:   '#7A5810',
  green:   '#277A4A',
  greenL:  '#1A6038',
  red:     '#B83030',
  redL:    '#982020',
  amber:   '#9A6818',
  amberL:  '#7A5010',
  highBg:  'rgba(184,48,48,0.09)',
  highBdr: 'rgba(184,48,48,0.22)',
  highTx:  '#B83030',
  medBg:   'rgba(154,104,24,0.09)',
  medBdr:  'rgba(154,104,24,0.22)',
  medTx:   '#9A6818',
  lowBg:   'rgba(61,110,158,0.09)',
  lowBdr:  'rgba(61,110,158,0.22)',
  lowTx:   '#3D6E9E',
} as const;

export type AppTheme = {
  bg: string; surf: string; surf2: string; surf3: string;
  bdr: string; bdrF: string; tx: string; txS: string; txM: string;
  brand: string; brandL: string; gold: string; goldL: string;
  green: string; greenL: string; red: string; redL: string;
  amber: string; amberL: string;
  highBg: string; highBdr: string; highTx: string;
  medBg: string; medBdr: string; medTx: string;
  lowBg: string; lowBdr: string; lowTx: string;
};

// Backward-compat — screens import { T } until fully migrated
export const T = darkTheme;

// Category badge colors
export const CC: Record<string, { bg: string; tx: string }> = {
  Bank:             { bg: 'rgba(61,110,158,0.18)',  tx: '#6AAED4' },
  Retirement:       { bg: 'rgba(201,169,110,0.18)', tx: '#C9A96E' },
  Investments:      { bg: 'rgba(58,150,100,0.18)',  tx: '#4DBD7F' },
  Physical:         { bg: 'rgba(190,104,48,0.18)',  tx: '#D48555' },
  Other:            { bg: 'rgba(128,80,192,0.18)',  tx: '#A870E0' },
  TERM_LIFE:        { bg: 'rgba(61,110,158,0.18)',  tx: '#6AAED4' },
  HEALTH:           { bg: 'rgba(58,150,100,0.18)',  tx: '#4DBD7F' },
  VEHICLE:          { bg: 'rgba(190,136,40,0.18)',  tx: '#D4A040' },
  HOME_LOAN:        { bg: 'rgba(61,110,158,0.18)',  tx: '#6AAED4' },
  CAR_LOAN:         { bg: 'rgba(190,136,40,0.18)',  tx: '#D4A040' },
  PERSONAL_LOAN:    { bg: 'rgba(190,68,68,0.18)',   tx: '#D06060' },
  EDUCATION_LOAN:   { bg: 'rgba(58,150,100,0.18)',  tx: '#4DBD7F' },
  CREDIT_CARD:      { bg: 'rgba(165,60,100,0.18)',  tx: '#D070A0' },
  FAMILY:           { bg: 'rgba(61,110,158,0.18)',  tx: '#6AAED4' },
  ADVISOR:          { bg: 'rgba(58,150,100,0.18)',  tx: '#4DBD7F' },
  EXECUTOR:         { bg: 'rgba(201,169,110,0.18)', tx: '#C9A96E' },
  EMAIL:            { bg: 'rgba(190,68,68,0.14)',   tx: '#D06060' },
  BANKING:          { bg: 'rgba(61,110,158,0.18)',  tx: '#6AAED4' },
  INVESTMENT:       { bg: 'rgba(58,150,100,0.18)',  tx: '#4DBD7F' },
  PASSWORD_MANAGER: { bg: 'rgba(128,80,192,0.18)',  tx: '#A870E0' },
  SOCIAL_MEDIA:     { bg: 'rgba(190,136,40,0.18)',  tx: '#D4A040' },
  GOVERNMENT:       { bg: 'rgba(201,169,110,0.18)', tx: '#C9A96E' },
  SUBSCRIPTION:     { bg: 'rgba(165,60,100,0.18)',  tx: '#D070A0' },
  WHOLE_LIFE:       { bg: 'rgba(40,120,100,0.18)',  tx: '#40B890' },
};

// Asset type metadata: label + category
export const assetMeta: Record<string, { label: string; cat: string }> = {
  SAVINGS_ACCOUNT:   { label: 'Savings A/C',   cat: 'Bank' },
  CURRENT_ACCOUNT:   { label: 'Current A/C',   cat: 'Bank' },
  FIXED_DEPOSIT:     { label: 'Fixed Deposit', cat: 'Bank' },
  RECURRING_DEPOSIT: { label: 'RD',            cat: 'Bank' },
  PPF:               { label: 'PPF',           cat: 'Retirement' },
  EPF:               { label: 'EPF',           cat: 'Retirement' },
  NPS:               { label: 'NPS',           cat: 'Retirement' },
  MUTUAL_FUND:       { label: 'Mutual Fund',   cat: 'Investments' },
  EQUITY:            { label: 'Equity',        cat: 'Investments' },
  GOLD:              { label: 'Gold',          cat: 'Physical' },
  REAL_ESTATE:       { label: 'Real Estate',   cat: 'Physical' },
  VEHICLE:           { label: 'Vehicle',       cat: 'Physical' },
  BANK_LOCKER:       { label: 'Bank Locker',   cat: 'Physical' },
  OTHER:             { label: 'Other',         cat: 'Other' },
};

// Liability type labels
export const liabMeta: Record<string, string> = {
  HOME_LOAN:      'Home Loan',
  CAR_LOAN:       'Car Loan',
  PERSONAL_LOAN:  'Personal Loan',
  EDUCATION_LOAN: 'Education Loan',
  CREDIT_CARD:    'Credit Card',
  OTHER:          'Other',
};

// Insurance type labels
export const insMeta: Record<string, string> = {
  TERM_LIFE:  'Term Life',
  WHOLE_LIFE: 'Whole Life',
  HEALTH:     'Health',
  VEHICLE:    'Vehicle',
  PROPERTY:   'Property',
  OTHER:      'Other',
};

// Format a number as INR with Cr/L/K suffixes
export function fmtINR(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return '₹0';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (abs >= 1_00_000) {
    return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  }
  if (abs >= 1_000) {
    return `${sign}₹${(abs / 1_000).toFixed(1)} K`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}
