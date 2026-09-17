import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dark, light } from './palette.mjs';
import { buildTheme } from './template.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const themesDir = join(root, 'themes');

const variants = [
  { palette: dark, file: 'cita-dark-color-theme.json' },
  { palette: light, file: 'cita-light-color-theme.json' },
];

// WCAG 2.x relative luminance and contrast ratio.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function checkContrast(p, theme) {
  const c = theme.colors;
  const checks = [
    ['editor foreground', p.fg, p.bg, 7],
    ['muted text on sidebar', p.fgMuted, p.bgAlt, 4.5],
    ['status bar text', c['statusBar.foreground'], c['statusBar.background'], 4.5],
    ['button text', c['button.foreground'], c['button.background'], 4.5],
    ['badge text', c['badge.foreground'], c['badge.background'], 4.5],
    ['debug status bar', c['statusBar.debuggingForeground'], c['statusBar.debuggingBackground'], 4.5],
    ['remote indicator', c['statusBarItem.remoteForeground'], c['statusBarItem.remoteBackground'], 4.5],
    ['activity bar badge', c['activityBarBadge.foreground'], c['activityBarBadge.background'], 4.5],
    ['activity bar icons', c['activityBar.foreground'], c['activityBar.background'], 4.5],
    ...Object.entries(p.syntax).map(([role, color]) => [
      `syntax: ${role}`,
      color,
      p.bg,
      role === 'comment' ? 3.5 : 4.5,
    ]),
  ];

  let failed = 0;
  console.log(`\n${p.name}`);
  for (const [label, fg, bg, min] of checks) {
    const ratio = contrast(fg, bg);
    const ok = ratio >= min;
    if (!ok) failed++;
    console.log(
      `  ${ok ? '✓' : '✗'} ${label.padEnd(24)} ${fg} on ${bg}  ${ratio.toFixed(2)}:1 (min ${min})`,
    );
  }
  return failed;
}

mkdirSync(themesDir, { recursive: true });

let failures = 0;
for (const { palette, file } of variants) {
  const theme = buildTheme(palette);
  failures += checkContrast(palette, theme);
  writeFileSync(join(themesDir, file), `${JSON.stringify(theme, null, 2)}\n`);
  console.log(`  → themes/${file}`);
}

if (failures) {
  console.error(`\n${failures} contrast check(s) failed.`);
  process.exit(1);
}
console.log('\nAll contrast checks passed.');
