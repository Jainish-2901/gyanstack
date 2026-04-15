import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://gyanstack.vercel.app';

/**
 * SEOHead – sets page-specific Open Graph / Twitter Card meta tags.
 *
 * Props:
 *  title        – page title (appended with "| GyanStack")
 *  description  – page description
 *  image        – absolute image URL (defaults to logo for inner pages, banner for home)
 *  url          – canonical URL (defaults to current path)
 *  type         – og:type, default "website"
 *  isHomePage   – when true, uses og-banner.png; otherwise uses logo.png
 */
export default function SEOHead({
  title,
  description,
  image,
  url,
  type = 'website',
  isHomePage = false,
}) {
  const defaultImage = isHomePage
    ? `${BASE_URL}/og-banner.png`
    : `${BASE_URL}/logo.png`;

  const resolvedImage  = image || defaultImage;
  const resolvedTitle  = title
    ? `${title} | GyanStack`
    : 'GyanStack: College Study Partner | Notes & PYQs';
  const resolvedDesc   = description ||
    'The ultimate MERN stack resource hub for Gujarat University students. Access NEP 2020 Study Material, Notes, Assignments, and PYQs.';
  const resolvedUrl    = url || (typeof window !== 'undefined' ? window.location.href : BASE_URL);

  // Image dimensions: banner is 1200×630, logo is square (500×500)
  const imgWidth  = isHomePage && !image ? '1200' : '500';
  const imgHeight = isHomePage && !image ? '630'  : '500';

  return (
    <Helmet>
      {/* Standard */}
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDesc} />
      <link rel="canonical" href={resolvedUrl} />
      <meta itemprop="image" content={resolvedImage} />

      {/* Open Graph */}
      <meta property="og:title"       content={resolvedTitle} />
      <meta property="og:description" content={resolvedDesc} />
      <meta property="og:type"        content={type} />
      <meta property="og:url"         content={resolvedUrl} />
      <meta property="og:image"       content={resolvedImage} />
      <meta property="og:image:width" content={imgWidth} />
      <meta property="og:image:height"content={imgHeight} />
      <meta property="og:site_name"   content="GyanStack" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content={isHomePage && !image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title"       content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDesc} />
      <meta name="twitter:image"       content={resolvedImage} />
    </Helmet>
  );
}
