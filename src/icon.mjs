// Renders icon.png (256×256) from src/icon.svg, the footer logo on silvestar.codes.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'src', 'icon.svg'));

const png = new Resvg(svg, { fitTo: { mode: 'width', value: 256 } }).render().asPng();
writeFileSync(join(root, 'icon.png'), png);
console.log('→ icon.png');
