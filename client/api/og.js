/**
 * /api/og.js  –  Vercel Serverless Function (BOT-ONLY)
 *
 * Only social-media crawlers reach this function (filtered by vercel.json
 * conditional rewrites that match User-Agent headers). Real users always
 * get index.html directly — no redirect, no loop.
 *
 * This function returns a thin HTML page with the correct og:image baked in:
 *   - Home page  → og-banner.png  (1200×630, summary_large_image)
 *   - All others → logo.png       (500×500, summary card)
 */

const BASE_URL     = 'https://gyanstack.vercel.app';
const API_BASE     = 'https://gyanstack-server.vercel.app/api';
const BANNER_IMG   = `${BASE_URL}/og-banner.png`;
const LOGO_IMG     = `${BASE_URL}/logo.png`;
const DEFAULT_DESC = 'The ultimate resource hub for Gujarat University BCA/MCA students. Access NEP 2020 Study Material, Notes, Assignments, and PYQs.';

// ─── HTML builder ─────────────────────────────────────────────────────────────
function buildHtml({ title, description, image, url, isLargeImage }) {
  const card = isLargeImage ? 'summary_large_image' : 'summary';
  const w    = isLargeImage ? '1200' : '500';
  const h    = isLargeImage ? '630'  : '500';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(description)}" />
  <link rel="canonical" href="${escHtml(url)}" />

  <!-- Open Graph -->
  <meta property="og:title"       content="${escHtml(title)}" />
  <meta property="og:description" content="${escHtml(description)}" />
  <meta property="og:type"        content="website" />
  <meta property="og:url"         content="${escHtml(url)}" />
  <meta property="og:image"       content="${escHtml(image)}" />
  <meta property="og:image:width" content="${w}" />
  <meta property="og:image:height"content="${h}" />
  <meta property="og:site_name"   content="GyanStack" />
  <meta itemprop="image"          content="${escHtml(image)}" />
  <link rel="image_src"           href="${escHtml(image)}" />

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="${card}" />
  <meta name="twitter:title"       content="${escHtml(title)}" />
  <meta name="twitter:description" content="${escHtml(description)}" />
  <meta name="twitter:image"       content="${escHtml(image)}" />
</head>
<body>
  <p>Redirecting to <a href="${escHtml(url)}">GyanStack</a>…</p>
</body>
</html>`;
}

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Main handler ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  const type = req.query.type  || 'page';
  const id   = req.query.id    || '';
  const path = req.query.path  || '/';

  // ── Home page → BANNER image ─────────────────────────────────────────────
  if (type === 'home') {
    const html = buildHtml({
      title       : 'GyanStack: College Study Partner | Notes & PYQs',
      description : DEFAULT_DESC,
      image       : BANNER_IMG,
      url         : BASE_URL,
      isLargeImage: true,
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(html);
  }

  // ── Content detail page → LOGO image ──────────────────────────────────────
  if (type === 'content' && id) {
    let title       = 'GyanStack Resource';
    let description = DEFAULT_DESC;

    try {
      const apiRes = await fetch(`${API_BASE}/content/${id}`, {
        signal: AbortSignal.timeout(5000)
      });
      if (apiRes.ok) {
        const data = await apiRes.json();
        const item = data.content || data;
        if (item?.title) {
          title       = `${item.title} | GyanStack`;
          description = item.description
            || `Access ${item.title} on GyanStack – Notes, PYQs, and study materials for Gujarat University students.`;
        }
      }
    } catch (e) {
      // Silently fall back to defaults
    }

    const html = buildHtml({
      title,
      description,
      image       : LOGO_IMG,
      url         : `${BASE_URL}/content/${id}`,
      isLargeImage: false,
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
    return res.status(200).send(html);
  }

  // ── All other pages (Browse, About, etc.) → LOGO image ────────────────────
  const pageTitles = {
    '/browse'        : 'Browse Resources | GyanStack',
    '/about'         : 'About GyanStack | Notes & PYQs',
    '/contact'       : 'Contact Us | GyanStack',
    '/announcements' : 'Announcements | GyanStack',
    '/login'         : 'Login | GyanStack',
    '/signup'        : 'Sign Up | GyanStack',
    '/privacy'       : 'Privacy Policy | GyanStack',
    '/terms'         : 'Terms of Service | GyanStack',
  };

  const resolvedTitle = pageTitles[path] || 'GyanStack: College Study Partner';
  const html = buildHtml({
    title       : resolvedTitle,
    description : DEFAULT_DESC,
    image       : LOGO_IMG,
    url         : `${BASE_URL}${path}`,
    isLargeImage: false,
  });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800');
  return res.status(200).send(html);
};
