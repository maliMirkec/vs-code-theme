// Brand colors from https://www.silvestar.codes (css/style-2024.css).
export const brand = {
  alpha: '#63F2C5', // mint
  alphaLight: '#E0FCF3', // light mint: 20% mint mixed with white (scrollbar track)
  alphaStrong: '#12E09F', // theme-color
  beta: '#FF3366', // pink
  gamma: '#043A73', // navy
  dark: '#000000',
  light: '#FFFFFF',
};

export const dark = {
  name: 'Cita Dark',
  type: 'dark',

  // Surfaces
  bg: '#02264D',
  bgAlt: '#011D3B',
  bgDeep: '#011830',
  bgHighlight: brand.gamma,
  bgHover: '#06447F',
  border: '#0A3A6B',

  // Text
  fg: '#E6F0FA',
  fgMuted: '#9DB4D3',
  fgSubtle: '#5F7FA8',

  // Accents
  accent: brand.alpha,
  accentFg: brand.gamma,
  secondary: '#FF5C85',
  secondaryFg: '#011830',
  cursor: brand.alpha,
  selection: '#63F2C540',
  selectionInactive: '#63F2C51F',
  wordHighlight: '#8FD3FF26',
  findMatch: '#FF336666',
  findMatchHighlight: '#FF33663D',
  lineHighlight: '#043A73',
  activityBarBg: '#011830',
  activityBarFg: brand.light,
  activityBarIndicator: brand.alpha,

  // Status
  error: '#FF5C85',
  warning: '#FFD27A',
  info: '#8FD3FF',
  success: brand.alpha,
  added: brand.alpha,
  modified: '#8FD3FF',
  deleted: '#FF5C85',
  ignored: '#5F7FA8',

  // Syntax
  syntax: {
    comment: '#7F9CC2',
    keyword: '#FF5C85',
    string: brand.alpha,
    func: '#8FD3FF',
    type: '#FFD27A',
    constant: '#FF9EB5',
    property: '#B8E6FF',
    variable: '#E6F0FA',
    punctuation: '#B3C7E0',
    regex: '#FFD27A',
  },

  // Terminal
  ansi: {
    black: '#011830',
    red: '#FF5C85',
    green: '#63F2C5',
    yellow: '#FFD27A',
    blue: '#8FD3FF',
    magenta: '#FF9EB5',
    cyan: '#7FE3F0',
    white: '#E6F0FA',
    brightBlack: '#5F7FA8',
    brightRed: '#FF8AA8',
    brightGreen: '#9BF7DA',
    brightYellow: '#FFE2A8',
    brightBlue: '#B8E6FF',
    brightMagenta: '#FFC2D1',
    brightCyan: '#AFEFF7',
    brightWhite: '#FFFFFF',
  },
};

export const light = {
  name: 'Cita Light',
  type: 'light',

  // Surfaces
  bg: '#FFFFFF',
  bgAlt: '#F3F7FB',
  bgDeep: '#E8EFF6',
  bgHighlight: '#E3ECF5',
  bgHover: '#E8EFF6',
  border: '#D6E1EC',

  // Text
  fg: brand.gamma,
  fgMuted: '#4F6A8C',
  fgSubtle: '#7F93AD',

  // Accents
  accent: brand.gamma,
  accentFg: brand.light,
  secondary: '#D1124A',
  secondaryFg: brand.light,
  cursor: brand.gamma,
  selection: '#63F2C554',
  selectionInactive: '#63F2C533',
  wordHighlight: '#0439711F',
  findMatch: '#FF336659',
  findMatchHighlight: '#FF336629',
  lineHighlight: '#0439710F',
  activityBarBg: brand.alphaLight,
  activityBarFg: brand.gamma,
  activityBarIndicator: brand.gamma,

  // Status
  error: '#D1124A',
  warning: '#945A00',
  info: '#0B5CAD',
  success: '#08805A',
  added: '#0FB883',
  modified: '#1C6FA8',
  deleted: '#D1124A',
  ignored: '#7F93AD',

  // Syntax
  syntax: {
    comment: '#5A7394',
    keyword: '#D1124A',
    string: '#08805A',
    func: '#0B5CAD',
    type: '#945A00',
    constant: '#B3336B',
    property: '#1C6FA8',
    variable: brand.gamma,
    punctuation: '#4F6A8C',
    regex: '#945A00',
  },

  // Terminal
  ansi: {
    black: '#043A73',
    red: '#D1124A',
    green: '#08805A',
    yellow: '#945A00',
    blue: '#0B5CAD',
    magenta: '#B3336B',
    cyan: '#0A7A8A',
    white: '#7F93AD',
    brightBlack: '#4F6A8C',
    brightRed: '#E8325F',
    brightGreen: '#0FA374',
    brightYellow: '#B87400',
    brightBlue: '#1C6FA8',
    brightMagenta: '#C94F84',
    brightCyan: '#1293A5',
    brightWhite: '#A9B8CC',
  },
};
