const BASE_URL     = 'https://gyanstack.vercel.app';
const API_BASE     = 'https://gyanstack-server.vercel.app/api';
const BANNER_IMG   = BASE_URL + '/og-banner.png';
const LOGO_IMG     = BASE_URL + '/logo.png';
const DEFAULT_DESC = 'The ultimate resource hub for Gujarat University BCA/MCA students. Access NEP 2020 Study Material, Notes, Assignments, and PYQs.';

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function makeHtml(title, desc, image, url, large) {
  var card = large ? 'summary_large_image' : 'summary';
  var w = large ? '1200' : '500';
  var h = large ? '630'  : '500';
  var t = esc(title);
  var d = esc(desc);
  var i = esc(image);
  var u = esc(url);

  return [
    '<!DOCTYPE html>',
    '<html lang="en"><head>',
    '<meta charset="UTF-8"/>',
    '<title>' + t + '</title>',
    '<meta name="description" content="' + d + '"/>',
    '<link rel="canonical" href="' + u + '"/>',
    '<meta property="og:title" content="' + t + '"/>',
    '<meta property="og:description" content="' + d + '"/>',
    '<meta property="og:type" content="website"/>',
    '<meta property="og:url" content="' + u + '"/>',
    '<meta property="og:image" content="' + i + '"/>',
    '<meta property="og:image:width" content="' + w + '"/>',
    '<meta property="og:image:height" content="' + h + '"/>',
    '<meta property="og:site_name" content="GyanStack"/>',
    '<meta itemprop="image" content="' + i + '"/>',
    '<link rel="image_src" href="' + i + '"/>',
    '<meta name="twitter:card" content="' + card + '"/>',
    '<meta name="twitter:title" content="' + t + '"/>',
    '<meta name="twitter:description" content="' + d + '"/>',
    '<meta name="twitter:image" content="' + i + '"/>',
    '</head><body>',
    '<p>Redirecting to <a href="' + u + '">GyanStack</a></p>',
    '</body></html>'
  ].join('\n');
}

export default function handler(req, res) {
  var type = (req.query && req.query.type) || 'page';
  var id   = (req.query && req.query.id)   || '';
  var path = (req.query && req.query.path) || '/';

  try {
    // Home page -> BANNER
    if (type === 'home') {
      var html = makeHtml(
        'GyanStack: College Study Partner | Notes and PYQs',
        DEFAULT_DESC,
        BANNER_IMG,
        BASE_URL,
        true
      );
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.status(200).send(html);
    }

    // Content detail page -> LOGO + fetch title from API
    if (type === 'content' && id) {
      return fetch(API_BASE + '/content/' + id)
        .then(function(apiRes) {
          if (!apiRes.ok) throw new Error('API error');
          return apiRes.json();
        })
        .then(function(data) {
          var item = data.content || data;
          var t = (item && item.title) ? (item.title + ' | GyanStack') : 'GyanStack Resource';
          var d = (item && item.description) || ('Access ' + (item && item.title || 'resources') + ' on GyanStack.');
          var html = makeHtml(t, d, LOGO_IMG, BASE_URL + '/content/' + id, false);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
          return res.status(200).send(html);
        })
        .catch(function() {
          // API failed — serve logo with default title
          var html = makeHtml('GyanStack Resource', DEFAULT_DESC, LOGO_IMG, BASE_URL + '/content/' + id, false);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(200).send(html);
        });
    }

    // All other pages -> LOGO
    var titles = {
      '/browse':        'Browse Resources | GyanStack',
      '/about':         'About GyanStack',
      '/contact':       'Contact Us | GyanStack',
      '/announcements': 'Announcements | GyanStack',
      '/login':         'Login | GyanStack',
      '/signup':        'Sign Up | GyanStack',
      '/privacy':       'Privacy Policy | GyanStack',
      '/terms':         'Terms of Service | GyanStack'
    };
    var pageTitle = titles[path] || 'GyanStack: College Study Partner';
    var html = makeHtml(pageTitle, DEFAULT_DESC, LOGO_IMG, BASE_URL + path, false);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800');
    return res.status(200).send(html);

  } catch (err) {
    // Final safety net — always return SOMETHING valid
    var fallback = makeHtml('GyanStack', DEFAULT_DESC, LOGO_IMG, BASE_URL, false);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(fallback);
  }
};
