/**
 * 生成默认 OG 图 public/og.png（1200×630，hardware 纸面）。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(root, 'public/og.png');
const avatarPath = path.join(root, 'public/avatar.png');
const fontMono = path.join(root, 'public/fonts/BerkeleyMonoVariable.ttf');

const W = 1200;
const H = 630;
const AVATAR = 280;

const avatarLeft = 108;
const avatarTop = Math.round((H - AVATAR) / 2);
const contentLeft = 440;

// 右侧文案块与头像垂直居中对齐
const titleSize = 92;
const navSize = 22;
const barH = 8;
const gapTitleNav = 28;
const gapNavBar = 28;
const stackH = titleSize + gapTitleNav + navSize + gapNavBar + barH;
const stackTop = Math.round((H - stackH) / 2);
const titleY = stackTop + Math.round(titleSize * 0.78);
const navY = stackTop + titleSize + gapTitleNav + Math.round(navSize * 0.78);
const barY = stackTop + titleSize + gapTitleNav + navSize + gapNavBar;

const avatar = await sharp(avatarPath)
  .resize(AVATAR, AVATAR, { fit: 'cover' })
  .png()
  .toBuffer();

const roundedAvatar = await sharp(avatar)
  .composite([
    {
      input: Buffer.from(
        `<svg width="${AVATAR}" height="${AVATAR}"><rect width="${AVATAR}" height="${AVATAR}" rx="18" fill="#fff"/></svg>`,
      ),
      blend: 'dest-in',
    },
  ])
  .png()
  .toBuffer();

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#eeeeec"/>
  <rect x="36" y="36" width="${W - 72}" height="${H - 72}" fill="#f9f9f8" stroke="#d2d2cc" stroke-width="2" rx="18"/>
  <path d="M72 96 H240" stroke="#d2d2cc" stroke-width="2"/>
  <path d="M72 96 V132" stroke="#d2d2cc" stroke-width="2"/>
  <path d="M${W - 72} 96 H${W - 240}" stroke="#d2d2cc" stroke-width="2"/>
  <path d="M${W - 72} 96 V132" stroke="#d2d2cc" stroke-width="2"/>
  <circle cx="96" cy="118" r="5" fill="#1b1b19"/>
  <circle cx="118" cy="118" r="5" fill="#cfcdc7"/>
  <circle cx="140" cy="118" r="5" fill="#cfcdc7"/>
  <text x="168" y="124" font-family="Berkeley Mono" font-size="18" fill="#6b6b69" letter-spacing="0.18em">STATION · ABEI.ME</text>
  <text x="${contentLeft}" y="${titleY}" font-family="Berkeley Mono" font-size="${titleSize}" font-weight="700" fill="#181817">ABEI</text>
  <text x="${contentLeft}" y="${navY}" font-family="Berkeley Mono" font-size="${navSize}" fill="#4c4c4b">Diary · Blog · Project · Use</text>
  <rect x="${contentLeft}" y="${barY}" width="120" height="${barH}" fill="#1b1b19" rx="2"/>
  <path d="M72 ${H - 96} H240" stroke="#d2d2cc" stroke-width="2"/>
  <path d="M72 ${H - 96} V${H - 132}" stroke="#d2d2cc" stroke-width="2"/>
  <path d="M${W - 72} ${H - 96} H${W - 240}" stroke="#d2d2cc" stroke-width="2"/>
  <path d="M${W - 72} ${H - 96} V${H - 132}" stroke="#d2d2cc" stroke-width="2"/>
</svg>
`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: W },
  font: {
    fontFiles: [fontMono],
    loadSystemFonts: false,
    defaultFontFamily: 'Berkeley Mono',
  },
});

const png = await sharp(resvg.render().asPng())
  .composite([
    {
      input: roundedAvatar,
      left: avatarLeft,
      top: avatarTop,
    },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

await fs.writeFile(outPath, png);
const stat = await fs.stat(outPath);
console.log(`[og] wrote ${path.relative(root, outPath)} (${Math.round(stat.size / 1024)}KB)`);
