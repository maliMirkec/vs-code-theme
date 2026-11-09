// Renders README preview images from the generated themes: code is tokenized
// with Shiki (VS Code's TextMate grammars) and drawn into a VS Code-like window.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { createHighlighter } from 'shiki';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));

const shots = [
  {
    theme: readJson('themes/cita-dark-color-theme.json'),
    sample: 'app.js',
    lang: 'javascript',
    selection: { line: 16, text: 'MAX_ITEMS' },
    out: 'cita-dark.png',
  },
  {
    theme: readJson('themes/cita-light-color-theme.json'),
    sample: 'types.ts',
    lang: 'typescript',
    selection: { line: 16, text: 'Palette' },
    out: 'cita-light.png',
  },
];

// Layout (logical px; rendered at 2x).
const W = 1280;
const H = 800;
const SCALE = 2;
const TITLE_H = 30;
const ACTIVITY_W = 48;
const SIDEBAR_W = 230;
const TABS_H = 35;
const STATUS_H = 22;
const PANEL_H = 170;
const LINE_H = 20;
const CODE_SIZE = 13;
const UI_SIZE = 13;
const MONO = 'Menlo';
const SANS = 'Helvetica Neue';
const CHAR_W = CODE_SIZE * 0.602;

// WCAG contrast ratio, matching src/build.mjs.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (fg, bg) => {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// SVG paint from #RRGGBB or #RRGGBBAA.
function paint(hex, attr = 'fill') {
  if (!hex) return `${attr}="none"`;
  const rgb = hex.slice(0, 7);
  if (hex.length === 9) {
    const opacity = (parseInt(hex.slice(7, 9), 16) / 255).toFixed(3);
    return `${attr}="${rgb}" ${attr}-opacity="${opacity}"`;
  }
  return `${attr}="${rgb}"`;
}

const rect = (x, y, w, h, color, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${paint(color)} ${extra}/>`;

const text = (x, y, content, color, { size = UI_SIZE, family = SANS, weight = 400, anchor = 'start', style = 'normal' } = {}) =>
  `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" font-style="${style}" text-anchor="${anchor}" ${paint(color)}>${esc(content)}</text>`;

// Monospace spaces render reliably as no-break spaces.
const nbsp = (s) => s.replace(/ /g, ' ');

function renderShot({ theme, sample, lang, selection, out: file }, highlighter) {
  const c = theme.colors;
  const isDark = theme.type === 'dark';
  const code = readFileSync(join(root, 'samples', sample), 'utf8').replace(/\n$/, '');
  const lines = highlighter.codeToTokensBase(code, { lang, theme: theme.name });

  const out = [];
  const editorX = ACTIVITY_W + SIDEBAR_W;
  const editorW = W - editorX;
  const bodyY = TITLE_H;
  const bodyH = H - TITLE_H - STATUS_H;
  const panelY = H - STATUS_H - PANEL_H;

  // Window background
  out.push(rect(0, 0, W, H, c['editor.background']));

  // Title bar
  out.push(rect(0, 0, W, TITLE_H, c['titleBar.activeBackground']));
  out.push(rect(0, TITLE_H - 1, W, 1, c['titleBar.border']));
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach((dot, i) => out.push(`<circle cx="${18 + i * 20}" cy="15" r="6" fill="${dot}"/>`));
  out.push(rect(W / 2 - 170, 5, 340, 20, c['commandCenter.background'], `rx="5" ${paint(c['commandCenter.border'], 'stroke')}`));
  out.push(text(W / 2, 19, 'vs-code-theme', c['commandCenter.foreground'], { size: 12, anchor: 'middle' }));

  // Activity bar
  out.push(rect(0, bodyY, ACTIVITY_W, bodyH, c['activityBar.background']));
  out.push(rect(ACTIVITY_W - 1, bodyY, 1, bodyH, c['activityBar.border']));
  const icons = ['files', 'search', 'git', 'debug', 'extensions'];
  icons.forEach((icon, i) => {
    const cy = bodyY + 26 + i * 48;
    const active = i === 0;
    const col = active ? c['activityBar.foreground'] : c['activityBar.inactiveForeground'];
    if (active) out.push(rect(0, cy - 24, 2, 48, c['activityBar.activeBorder']));
    const stroke = `${paint(col, 'stroke')} stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
    const x = ACTIVITY_W / 2;
    if (icon === 'files') out.push(`<path d="M${x - 7} ${cy - 10}h9l5 5v15h-14z M${x + 2} ${cy - 10}v5h5" ${stroke}/>`);
    if (icon === 'search') out.push(`<circle cx="${x - 1}" cy="${cy - 2}" r="6.5" ${stroke}/><path d="M${x + 4} ${cy + 3}l5 5" ${stroke}/>`);
    if (icon === 'git') out.push(`<circle cx="${x - 5}" cy="${cy - 8}" r="2.5" ${stroke}/><circle cx="${x - 5}" cy="${cy + 8}" r="2.5" ${stroke}/><circle cx="${x + 6}" cy="${cy - 3}" r="2.5" ${stroke}/><path d="M${x - 5} ${cy - 5.5}v11 M${x + 6} ${cy - 0.5}c0 5-11 3-11 6" ${stroke}/>`);
    if (icon === 'debug') out.push(`<path d="M${x - 6} ${cy - 9}l13 9-13 9z" ${stroke}/>`);
    if (icon === 'extensions') out.push(`<path d="M${x - 9} ${cy - 3}h7v7h-7z M${x - 2} ${cy - 3}h7v7h-7z M${x - 9} ${cy + 4}h7v7h-7z M${x + 1} ${cy - 13}h7v7h-7z" ${stroke}/>`);
  });
  // Badge on the git icon
  const badgeY = bodyY + 26 + 2 * 48 + 8;
  out.push(`<circle cx="${ACTIVITY_W / 2 + 9}" cy="${badgeY}" r="7" ${paint(c['activityBarBadge.background'])}/>`);
  out.push(text(ACTIVITY_W / 2 + 9, badgeY + 3.5, '3', c['activityBarBadge.foreground'], { size: 9, weight: 700, anchor: 'middle' }));

  // Side bar
  out.push(rect(ACTIVITY_W, bodyY, SIDEBAR_W, bodyH, c['sideBar.background']));
  out.push(rect(editorX - 1, bodyY, 1, bodyH, c['sideBar.border']));
  out.push(text(ACTIVITY_W + 20, bodyY + 23, 'EXPLORER', c['sideBarTitle.foreground'], { size: 11 }));
  out.push(text(ACTIVITY_W + 12, bodyY + 50, '⌄  VS-CODE-THEME', c['sideBarSectionHeader.foreground'], { size: 11, weight: 700 }));
  const tree = [
    { depth: 0, label: '›  .github' },
    { depth: 0, label: '⌄  samples', git: 'modified' },
    { depth: 1, label: 'app.js', git: sample === 'app.js' ? 'modified' : null },
    { depth: 1, label: 'contrast.py' },
    { depth: 1, label: 'data.json' },
    { depth: 1, label: 'index.html' },
    { depth: 1, label: 'README.md', git: 'untracked' },
    { depth: 1, label: 'style.css' },
    { depth: 1, label: 'types.ts', git: sample === 'types.ts' ? 'modified' : null },
    { depth: 0, label: '›  src' },
    { depth: 0, label: '›  themes' },
    { depth: 0, label: 'CHANGELOG.md' },
    { depth: 0, label: 'icon.png' },
    { depth: 0, label: 'LICENSE' },
    { depth: 0, label: 'package.json', git: 'modified' },
    { depth: 0, label: 'README.md' },
  ];
  tree.forEach((item, i) => {
    const y = bodyY + 62 + i * 22;
    const selected = item.label === sample;
    if (selected) {
      out.push(rect(ACTIVITY_W, y, SIDEBAR_W - 1, 22, c['list.activeSelectionBackground']));
      out.push(rect(ACTIVITY_W, y, SIDEBAR_W - 1, 22, null, `${paint(c['list.focusOutline'], 'stroke')} stroke-width="1"`));
    }
    const gitColor =
      item.git === 'modified'
        ? c['gitDecoration.modifiedResourceForeground']
        : item.git === 'untracked'
          ? c['gitDecoration.untrackedResourceForeground']
          : null;
    const color = gitColor ?? (selected ? c['list.activeSelectionForeground'] : c['sideBar.foreground']);
    out.push(text(ACTIVITY_W + 20 + item.depth * 16, y + 15, item.label, color));
    if (item.git && !item.label.startsWith('⌄')) {
      out.push(text(editorX - 16, y + 15, item.git === 'modified' ? 'M' : 'U', gitColor, { size: 11, anchor: 'end' }));
    }
  });

  // Tabs
  out.push(rect(editorX, bodyY, editorW, TABS_H, c['editorGroupHeader.tabsBackground']));
  out.push(rect(editorX, bodyY + TABS_H - 1, editorW, 1, c['editorGroupHeader.tabsBorder']));
  const other = sample === 'app.js' ? 'style.css' : 'index.html';
  const tabs = [
    { label: sample, active: true },
    { label: other, active: false },
    { label: 'README.md', active: false },
  ];
  let tabX = editorX;
  tabs.forEach((tab) => {
    const tw = 44 + tab.label.length * 7.2;
    out.push(rect(tabX, bodyY, tw, TABS_H - (tab.active ? 0 : 1), tab.active ? c['tab.activeBackground'] : c['tab.inactiveBackground']));
    if (tab.active) out.push(rect(tabX, bodyY, tw, 2, c['tab.activeBorderTop']));
    out.push(rect(tabX + tw - 1, bodyY, 1, TABS_H, c['tab.border']));
    out.push(text(tabX + 14, bodyY + 22, tab.label, tab.active ? c['tab.activeForeground'] : c['tab.inactiveForeground']));
    out.push(text(tabX + tw - 18, bodyY + 22, tab.active ? '×' : '', c['tab.activeForeground'], { size: 15, anchor: 'middle' }));
    tabX += tw;
  });

  // Editor
  const codeTop = bodyY + TABS_H + 8;
  const gutterW = 56;
  const codeX = editorX + gutterW + 18;
  const maxLines = Math.floor((panelY - codeTop - 4) / LINE_H);
  const activeLine = 14;
  const selLine = code.split('\n')[selection.line - 1];
  const selFrom = selLine.indexOf(selection.text);
  const selTo = selFrom + selection.text.length;

  lines.slice(0, maxLines).forEach((tokens, i) => {
    const lineNo = i + 1;
    const top = codeTop + i * LINE_H;
    const baseline = top + 14.5;

    if (lineNo === activeLine) out.push(rect(editorX, top, editorW, LINE_H, c['editor.lineHighlightBackground']));
    if (lineNo === selection.line) {
      out.push(rect(codeX + selFrom * CHAR_W, top, (selTo - selFrom) * CHAR_W, LINE_H, c['editor.selectionBackground']));
    }

    out.push(
      text(editorX + gutterW, baseline, String(lineNo), lineNo === activeLine ? c['editorLineNumber.activeForeground'] : c['editorLineNumber.foreground'], {
        size: CODE_SIZE,
        family: MONO,
        anchor: 'end',
      }),
    );

    // Indent guides
    const indent = (tokens.map((t) => t.content).join('').match(/^ */) ?? [''])[0].length;
    for (let level = 2; level <= indent; level += 2) {
      out.push(rect(codeX + (level - 2) * CHAR_W, top, 1, LINE_H, c['editorIndentGuide.background1']));
    }

    const spans = tokens
      .map((t) => {
        const italic = t.fontStyle & 1 ? ' font-style="italic"' : '';
        const bold = t.fontStyle & 2 ? ' font-weight="700"' : '';
        return `<tspan ${paint(t.color ?? theme.colors['editor.foreground'])}${italic}${bold}>${esc(nbsp(t.content))}</tspan>`;
      })
      .join('');
    out.push(`<text x="${codeX}" y="${baseline}" font-family="${MONO}" font-size="${CODE_SIZE}">${spans}</text>`);

    if (lineNo === activeLine) {
      const len = tokens.map((t) => t.content).join('').length;
      out.push(rect(codeX + len * CHAR_W + 1, top + 2, 2, LINE_H - 4, c['editorCursor.foreground']));
    }
  });

  // Scrollbar thumb
  out.push(rect(W - 14, codeTop, 10, 120, c['scrollbarSlider.background']));

  // Panel with terminal
  out.push(rect(editorX, panelY, editorW, PANEL_H, c['panel.background']));
  out.push(rect(editorX, panelY, editorW, 1, c['panel.border']));
  ['PROBLEMS', 'OUTPUT', 'TERMINAL'].forEach((label, i) => {
    const x = editorX + 20 + i * 90;
    const active = label === 'TERMINAL';
    out.push(text(x, panelY + 24, label, active ? c['panelTitle.activeForeground'] : c['panelTitle.inactiveForeground'], { size: 11 }));
    if (active) out.push(rect(x, panelY + 31, 62, 1, c['panelTitle.activeBorder']));
  });
  const ansi = (name) => c[`terminal.ansi${name}`];
  const ratio = (fg) => `${contrast(fg, c['editor.background']).toFixed(2)}:1`;
  const kw = ratio(theme.tokenColors.find((r) => r.name === 'Keywords & storage').settings.foreground);
  const str = ratio(theme.tokenColors.find((r) => r.name === 'Strings').settings.foreground);
  const themeFile = file.replace('.png', '-color-theme.json');
  const term = [
    [['~/vs-code-theme', ansi('Blue')], [' on ', c['terminal.foreground']], ['main', ansi('Magenta')], [' ❯ ', ansi('Green')], ['npm run build', c['terminal.foreground']]],
    [['  ✓ ', ansi('Green')], ['syntax: keyword     ', c['terminal.foreground']], [kw, ansi('Yellow')], [' (min 4.5)', ansi('BrightBlack')]],
    [['  ✓ ', ansi('Green')], ['syntax: string      ', c['terminal.foreground']], [str, ansi('Yellow')], [' (min 4.5)', ansi('BrightBlack')]],
    [['  → ', ansi('Cyan')], [`themes/${themeFile}`, c['terminal.foreground']]],
    [['All contrast checks passed.', ansi('Green')]],
    [['~/vs-code-theme', ansi('Blue')], [' on ', c['terminal.foreground']], ['main', ansi('Magenta')], [' ❯ ', ansi('Green')]],
  ];
  term.forEach((parts, i) => {
    const y = panelY + 54 + i * 18;
    const spans = parts.map(([s, col]) => `<tspan ${paint(col)}>${esc(nbsp(s))}</tspan>`).join('');
    out.push(`<text x="${editorX + 20}" y="${y}" font-family="${MONO}" font-size="12">${spans}</text>`);
  });
  const lastLen = '~/vs-code-theme on main ❯ '.length;
  out.push(rect(editorX + 20 + lastLen * 12 * 0.602, panelY + 54 + 5 * 18 - 12, 7, 15, c['terminalCursor.foreground']));

  // Status bar
  const sbY = H - STATUS_H;
  out.push(rect(0, sbY, W, STATUS_H, c['statusBar.background']));
  out.push(rect(0, sbY, W, 1, c['statusBar.border']));
  out.push(rect(0, sbY, 36, STATUS_H, c['statusBarItem.remoteBackground']));
  out.push(text(18, sbY + 15, '><', c['statusBarItem.remoteForeground'], { size: 11, weight: 700, anchor: 'middle' }));
  const sbFg = c['statusBar.foreground'];
  const sbStroke = `${paint(sbFg, 'stroke')} stroke-width="1.2" fill="none" stroke-linecap="round"`;
  out.push(`<circle cx="52" cy="${sbY + 7}" r="1.8" ${sbStroke}/><circle cx="52" cy="${sbY + 16}" r="1.8" ${sbStroke}/><circle cx="59" cy="${sbY + 9}" r="1.8" ${sbStroke}/><path d="M52 ${sbY + 9}v5 M59 ${sbY + 11}c0 3-7 2-7 3" ${sbStroke}/>`);
  out.push(text(66, sbY + 15, 'main*', sbFg, { size: 12 }));
  out.push(`<circle cx="130" cy="${sbY + 11}" r="5" ${sbStroke}/><path d="M128 ${sbY + 9}l4 4 M132 ${sbY + 9}l-4 4" ${sbStroke}/>`);
  out.push(text(140, sbY + 15, '0', sbFg, { size: 12 }));
  out.push(`<path d="M160 ${sbY + 5}l6 11h-12z M160 ${sbY + 9}v3" ${sbStroke} stroke-linejoin="round"/>`);
  out.push(text(170, sbY + 15, '0', sbFg, { size: 12 }));
  const right = [`Ln ${activeLine}, Col 1`, 'Spaces: 2', 'UTF-8', 'LF', lang === 'javascript' ? 'JavaScript' : 'TypeScript', isDark ? 'Cita Dark' : 'Cita Light'];
  let rx = W - 16;
  right.reverse().forEach((label) => {
    out.push(text(rx, sbY + 15, label, sbFg, { size: 12, anchor: 'end' }));
    rx -= label.length * 6.6 + 22;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out.join('')}</svg>`;
}

const highlighter = await createHighlighter({
  themes: shots.map((s) => s.theme),
  langs: [...new Set(shots.map((s) => s.lang))],
});

const imagesDir = join(root, 'images');
mkdirSync(imagesDir, { recursive: true });

for (const shot of shots) {
  const svg = renderShot(shot, highlighter);
  const png = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: SCALE },
    font: { loadSystemFonts: true, defaultFontFamily: SANS, monospaceFamily: MONO },
  })
    .render()
    .asPng();
  writeFileSync(join(imagesDir, shot.out), png);
  console.log(`→ images/${shot.out} (${Math.round(png.length / 1024)} KB)`);
}
