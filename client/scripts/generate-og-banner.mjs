/**
 * generate-og-banner.mjs  –  Premium og-banner (1200×630)
 * Run: node scripts/generate-og-banner.mjs
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT   = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

const W = 1200, H = 630;

/* dot grid helper */
function dots(gap = 32, r = 1.3, op = 0.07) {
  const out = [];
  for (let y = gap; y < H; y += gap)
    for (let x = gap; x < W; x += gap)
      out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#10b981" opacity="${op}"/>`);
  return out.join('');
}

/* diagonal mesh lines */
function mesh() {
  const out = [];
  for (let i = -6; i <= 14; i++) {
    const x1 = i * 90, x2 = x1 + H;
    out.push(`<line x1="${x1}" y1="0" x2="${x2}" y2="${H}" stroke="#10b981" stroke-opacity="0.035" stroke-width="1"/>`);
  }
  return out.join('');
}

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs>
  <!-- Background gradient: deep navy → dark slate -->
  <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%"   stop-color="#060d18"/>
    <stop offset="50%"  stop-color="#08192b"/>
    <stop offset="100%" stop-color="#061818"/>
  </linearGradient>

  <!-- Top-right emerald aurora -->
  <radialGradient id="aurora1" cx="85%" cy="5%" r="55%">
    <stop offset="0%"   stop-color="#10b981" stop-opacity="0.25"/>
    <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
  </radialGradient>

  <!-- Bottom-left sapphire aurora -->
  <radialGradient id="aurora2" cx="5%" cy="95%" r="50%">
    <stop offset="0%"   stop-color="#3b82f6" stop-opacity="0.20"/>
    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
  </radialGradient>

  <!-- Logo halo -->
  <radialGradient id="halo" cx="50%" cy="50%" r="50%">
    <stop offset="0%"   stop-color="#10b981" stop-opacity="0.42"/>
    <stop offset="55%"  stop-color="#10b981" stop-opacity="0.10"/>
    <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
  </radialGradient>

  <!-- Glass card -->
  <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.06"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0.015"/>
  </linearGradient>

  <!-- Title gradient (white → soft mint) -->
  <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#ffffff"/>
    <stop offset="100%" stop-color="#dff8f0"/>
  </linearGradient>



  <!-- Ring glow filter -->
  <filter id="rglow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="5" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="haloBlur" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="22"/>
  </filter>
</defs>

<!-- ╔══════════════════════════════════╗ -->
<!-- ║  Base layers                     ║ -->
<!-- ╚══════════════════════════════════╝ -->

<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#aurora1)"/>
<rect width="${W}" height="${H}" fill="url(#aurora2)"/>

<!-- Mesh lines -->
${mesh()}

<!-- Dot grid -->
${dots(28, 1.25, 0.08)}

<!-- Glass card -->
<rect x="42" y="42" width="${W-84}" height="${H-84}"
      rx="26" fill="url(#glass)"
      stroke="#10b981" stroke-opacity="0.20" stroke-width="1.2"/>
<!-- top-edge shine -->
<line x1="68" y1="43" x2="${W-68}" y2="43"
      stroke="#10b981" stroke-opacity="0.30" stroke-width="1"/>

<!-- ╔══════════════════════════════════╗ -->
<!-- ║  LEFT ZONE – Logo (cx=255,cy=315)║ -->
<!-- ╚══════════════════════════════════╝ -->

<!-- Soft background halo (blurred ellipse behind logo) -->
<ellipse cx="255" cy="315" rx="195" ry="195"
         fill="url(#halo)" filter="url(#haloBlur)"/>

<!-- Decorative rings -->
<!-- Ring A: outer dashed-style arcs (top-right segment) -->
<circle cx="255" cy="315" r="188"
        fill="none" stroke="#10b981" stroke-opacity="0.06" stroke-width="1.5"/>
<circle cx="255" cy="315" r="168"
        fill="none" stroke="#10b981" stroke-opacity="0.10" stroke-width="1"/>
<circle cx="255" cy="315" r="145"
        fill="none" stroke="#10b981" stroke-opacity="0.22" stroke-width="1.5"
        filter="url(#rglow)"/>

<!-- Glowing arc accent — top-right quadrant -->
<path d="M 255 170 A 145 145 0 0 1 390 248"
      fill="none" stroke="#10b981" stroke-opacity="0.75" stroke-width="2.5"
      stroke-linecap="round" filter="url(#rglow)"/>
<!-- Small arc — bottom-left -->
<path d="M 125 375 A 145 145 0 0 1 162 430"
      fill="none" stroke="#10b981" stroke-opacity="0.45" stroke-width="2"
      stroke-linecap="round"/>



<!-- ╔══════════════════════════════════╗ -->
<!-- ║  Vertical divider                ║ -->
<!-- ╚══════════════════════════════════╝ -->

<line x1="490" y1="78" x2="490" y2="${H-78}"
      stroke="#10b981" stroke-opacity="0.11" stroke-width="1"/>

<!-- ╔══════════════════════════════════╗ -->
<!-- ║  RIGHT ZONE – Text content       ║ -->
<!-- ╚══════════════════════════════════╝ -->

<!-- 1. Badge pill -->
<rect x="516" y="90" width="168" height="36"
      rx="18"
      fill="#10b981" fill-opacity="0.12"
      stroke="#10b981" stroke-opacity="0.38" stroke-width="1.2"/>
<!-- Green dot inside badge -->
<circle cx="535" cy="108" r="5" fill="#10b981" opacity="0.85"/>
<text x="610" y="114" text-anchor="middle"
      font-family="'Inter','Helvetica Neue',Arial,sans-serif"
      font-weight="600" font-size="15" letter-spacing="0.4"
      fill="#10b981">Study Platform</text>

<!-- Thin rule under badge -->
<line x1="516" y1="144" x2="${W-60}" y2="144"
      stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>

<!-- 2. Main title "GyanStack" -->
<!-- Glow layer -->
<text x="516" y="268"
      font-family="'Inter','Helvetica Neue',Arial,sans-serif"
      font-weight="900" font-size="96" letter-spacing="-3"
      fill="#10b981" fill-opacity="0.06">GyanStack</text>
<!-- Main title -->
<text x="516" y="265"
      font-family="'Inter','Helvetica Neue',Arial,sans-serif"
      font-weight="900" font-size="96" letter-spacing="-3"
      fill="url(#titleGrad)">GyanStack</text>

<!-- 3. Subtitle -->
<text x="516" y="322"
      font-family="'Inter','Helvetica Neue',Arial,sans-serif"
      font-weight="600" font-size="34" letter-spacing="0.2"
      fill="#10b981">College Study Partner</text>

<!-- 4. Bullet/desc line -->
<text x="516" y="374"
      font-family="'Inter','Helvetica Neue',Arial,sans-serif"
      font-weight="400" font-size="22" letter-spacing="0.3"
      fill="#475569">Notes  ·  NEP 2020 Material  ·  PYQs</text>

<!-- 5. Feature pill badges -->
<!-- Pill: 📖 Notes -->
<rect x="516" y="408" width="104" height="36" rx="18"
      fill="#3b82f6" fill-opacity="0.13" stroke="#3b82f6" stroke-opacity="0.38" stroke-width="1.2"/>
<text x="568" y="431" text-anchor="middle"
      font-family="'Inter','Helvetica Neue',Arial,sans-serif"
      font-weight="600" font-size="15" fill="#60a5fa">📖  Notes</text>

<!-- Pill: 📄 Assignments -->
<rect x="632" y="408" width="140" height="36" rx="18"
      fill="#10b981" fill-opacity="0.12" stroke="#10b981" stroke-opacity="0.35" stroke-width="1.2"/>
<text x="702" y="431" text-anchor="middle"
      font-family="'Inter','Helvetica Neue',Arial,sans-serif"
      font-weight="600" font-size="15" fill="#34d399">📄  Assignments</text>

<!-- Pill: 📝 PYQs -->
<rect x="784" y="408" width="94" height="36" rx="18"
      fill="#8b5cf6" fill-opacity="0.12" stroke="#8b5cf6" stroke-opacity="0.35" stroke-width="1.2"/>
<text x="831" y="431" text-anchor="middle"
      font-family="'Inter','Helvetica Neue',Arial,sans-serif"
      font-weight="600" font-size="15" fill="#a78bfa">📝  PYQs</text>

<!-- Pill: 🎓 NEP 2020 -->
<rect x="890" y="408" width="118" height="36" rx="18"
      fill="#f59e0b" fill-opacity="0.12" stroke="#f59e0b" stroke-opacity="0.35" stroke-width="1.2"/>
<text x="949" y="431" text-anchor="middle"
      font-family="'Inter','Helvetica Neue',Arial,sans-serif"
      font-weight="600" font-size="15" fill="#fbbf24">🎓  NEP 2020</text>

<!-- 6. Tagline -->
<text x="516" y="490"
      font-family="'Inter','Helvetica Neue',Arial,sans-serif"
      font-weight="500" font-size="18" letter-spacing="0.2"
      fill="#1e3a3a" opacity="0.7">Free Forever  ·  Ad-Free  ·  Gujarat University</text>

<!-- 7. URL badge (bottom right): dot + text left-aligned with clear gap -->
<rect x="876" y="510" width="268" height="42"
      rx="21"
      fill="#10b981" fill-opacity="0.10"
      stroke="#10b981" stroke-opacity="0.50" stroke-width="1.5"/>
<!-- Live green dot -->
<circle cx="900" cy="531" r="5" fill="#10b981" opacity="0.90"/>
<!-- Text starts 18px after dot right edge -->
<text x="920" y="537"
      text-anchor="start"
      font-family="'Inter','Helvetica Neue',Arial,sans-serif"
      font-weight="600" font-size="18" fill="#10b981">gyanstack.vercel.app</text>

<!-- Sparkle dots -->
<circle cx="1118" cy="84"  r="3.5" fill="#10b981" opacity="0.55"/>
<circle cx="1132" cy="72"  r="2"   fill="#10b981" opacity="0.30"/>
<circle cx="1105" cy="75"  r="1.5" fill="#3b82f6" opacity="0.45"/>
<circle cx="96"   cy="556" r="3"   fill="#3b82f6" opacity="0.38"/>
<circle cx="110"  cy="570" r="1.8" fill="#10b981" opacity="0.28"/>
<circle cx="1128" cy="560" r="2"   fill="#8b5cf6" opacity="0.40"/>

</svg>`;

/* ─── Composite logo onto background ─── */
async function main() {
  console.log('🎨  Generating premium og-banner …');

  const logoBuf = await sharp(path.join(PUBLIC, 'logo.png'))
    .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Logo centred at (255, 315): left = 255-150=105, top = 315-150=165
  await sharp(Buffer.from(SVG))
    .png()
    .composite([{ input: logoBuf, left: 105, top: 165, blend: 'over' }])
    .toFile(path.join(PUBLIC, 'og-banner.png'));

  console.log('✅  public/og-banner.png saved  (1200 × 630)');
}

main().catch(err => { console.error('❌', err); process.exit(1); });
