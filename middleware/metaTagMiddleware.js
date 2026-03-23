// Meta Tag Injection Middleware for Social Media Crawlers
// Intercepts crawler requests and injects dynamic OG/Twitter meta tags
// DIRECT DB ACCESS VERSION - No Loopback HTTP Requests
const fs = require('fs');
const path = require('path');

// Import Models
const HomePage = require('../models/HomePage');
const AboutPage = require('../models/AboutPage');
const ContactPage = require('../models/ContactPage');
const Blog = require('../models/Blog');
const BlogPage = require('../models/BlogPage');
const CreateProperty = require('../models/CreateProperty');
const TermsConditionsPage = require('../models/TermsConditionsPage');
const PrivacyPolicyPage = require('../models/PrivacyPolicyPage');
const Project = require('../models/Project');
const ProjectPage = require('../models/ProjectPage');

// Social media and search engine crawlers
const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'WhatsApp',
  'LinkedInBot',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'SkypeUriPreview',
  'Googlebot',
  'bingbot',
  'ia_archiver',
  'Applebot',
];

function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some(bot => ua.includes(bot.toLowerCase()));
}

// Fetch SEO data directly from MongoDB based on the request path
async function fetchSEOData(reqPath) {
  try {
    // Home page
    if (reqPath === '/' || reqPath === '') {
      const data = await HomePage.findOne().lean();
      if (data) {
        return {
          title: data.homeSeoOgTitle_en || '183 Housing Solutions',
          description: data.homeSeoOgDescription_en || 'Find and manage properties easily.',
          image: data.homeSeoOgImage,
          url: reqPath,
          type: 'website',
        };
      }
    }

    // About page
    else if (reqPath.startsWith('/about')) {
      const data = await AboutPage.findOne().lean();
      if (data) {
        return {
          title: data.aboutSeoMetaTitle_en || 'About Us',
          description: data.aboutSeoMetaDescription_en || '',
          image: data.aboutSeoOgImage,
          url: reqPath,
          type: 'website',
        };
      }
    }

    // Contact page
    else if (reqPath.startsWith('/contact')) {
      const data = await ContactPage.findOne().lean();
      if (data) {
        return {
          title: data.contactSeoMetaTitle_en || 'Contact Us',
          description: data.contactSeoMetaDescription_en || '',
          image: data.contactSeoOgImage,
          url: reqPath,
          type: 'website',
        };
      }
    }

    // Blog listing page (/blogs)
    else if (reqPath === '/blogs') {
      const data = await BlogPage.findOne().lean();
      return {
        title: data?.blogTitle?.en || 'Blog',
        description: data?.blogDescription?.en || 'Read our latest articles and news.',
        image: data?.blogBannerbg,
        url: reqPath,
        type: 'website',
      };
    }

    // Blog detail page (/blogs/:slug) — fixed from /blog/:slug
    else if (reqPath.match(/^\/blogs\/[^/]+$/)) {
      const slug = reqPath.split('/blogs/')[1];
      const blog = await Blog.findOne({
        $or: [
          { 'slug.en': slug },
          { 'slug.vi': slug },
          { 'seoInformation.slugUrl.en': slug },
          { 'seoInformation.slugUrl.vi': slug },
        ],
      }).lean();

      if (blog) {
        return {
          title: blog.seoInformation?.metaTitle?.en || blog.title?.en || 'Blog Post',
          description: blog.seoInformation?.metaDescription?.en || '',
          image: blog.seoInformation?.ogImage || blog.mainImage,
          url: reqPath,
          type: 'article',
        };
      }
    }

    // Property showcase page (/property-showcase/:id/:slug?) — fixed from /property/:id
    else if (reqPath.match(/^\/property-showcase\/[^/]+(\/[^/]+)?$/)) {
      const parts = reqPath.split('/');
      const propertyId = parts[2]; // /property-showcase/:id/:slug?
      const property = await CreateProperty.findOne({
        'listingInformation.listingInformationPropertyId': propertyId,
      }).lean();

      if (property) {
        const seoInfo = property.seoInformation || {};
        return {
          title: seoInfo.metaTitle?.en || property.listingInformation?.listingInformationPropertyTitle?.en || 'Property Details',
          description: seoInfo.metaDescription?.en || property.propertyInformation?.informationView?.en || '',
          image: seoInfo.ogImages?.[0] || property.imagesVideos?.propertyImages?.[0],
          url: reqPath,
          type: 'website',
        };
      }
    }

    // Projects listing page (/projects)
    else if (reqPath === '/projects') {
      const data = await ProjectPage.findOne().lean();
      if (data) {
        return {
          title: data.projectSeoMetaTitle_en || data.projectBannerTitle?.en || 'Projects',
          description: data.projectSeoMetaDescription_en || data.projectBannerDesc?.en || 'Explore our property projects.',
          image: data.projectSeoOgImage || data.projectBannerImages?.[0],
          url: reqPath,
          type: 'website',
        };
      }
    }

    // Project detail page (/projects/:slug)
    else if (reqPath.match(/^\/projects\/[^/]+$/)) {
      const slug = reqPath.split('/projects/')[1];
      const project = await Project.findOne({
        $or: [
          { 'slug.en': slug },
          { 'slug.vi': slug },
          { projectSeoSlugUrl_en: slug },
          { projectSeoSlugUrl_vn: slug },
        ],
      }).lean();

      if (project) {
        return {
          title: project.projectSeoOgTitle_en || project.projectSeoMetaTitle_en || project.title?.en || 'Project Details',
          description: project.projectSeoOgDescription_en || project.projectSeoMetaDescription_en || '',
          image: project.projectSeoOgImage,
          url: reqPath,
          type: 'website',
        };
      }
    }

    // Property listing page (/listing)
    else if (reqPath.startsWith('/listing')) {
      return {
        title: '183 Housing Solutions – Property Listings',
        description: 'Browse our full list of properties for sale, lease, and home stay.',
        image: null,
        url: reqPath,
        type: 'website',
      };
    }

    // Terms & Conditions
    else if (reqPath.startsWith('/terms')) {
      const data = await TermsConditionsPage.findOne().lean();
      if (data) {
        return {
          title: data.termsConditionSeoMetaTitle_en || 'Terms & Conditions',
          description: data.termsConditionSeoMetaDescription_en || '',
          image: data.termsConditionSeoOgImage,
          url: reqPath,
          type: 'website',
        };
      }
    }

    // Privacy Policy
    else if (reqPath.startsWith('/privacy')) {
      const data = await PrivacyPolicyPage.findOne().lean();
      if (data) {
        return {
          title: data.privacyPolicySeoMetaTitle_en || 'Privacy Policy',
          description: data.privacyPolicySeoMetaDescription_en || '',
          image: data.privacyPolicySeoOgImage,
          url: reqPath,
          type: 'website',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching SEO data:', error.message);
    return null;
  }
}

// Build the absolute image URL
function resolveImageUrl(image, seoUrl, baseUrl) {
  const fallback = `${baseUrl}/images/favicon.png`;

  if (!image) return fallback;

  // Skip base64 strings
  if (image.length > 500 && !image.startsWith('http') && !image.startsWith('/')) {
    return fallback;
  }

  if (image.startsWith('http')) {
    return image.replace(/^http:\/\//i, 'https://');
  }

  // Bare filename — try to guess the uploads subfolder
  if (!image.includes('/')) {
    if (seoUrl.includes('about'))   image = `/uploads/aboutpage/${image}`;
    else if (seoUrl.includes('contact')) image = `/uploads/contactpage/${image}`;
    else if (seoUrl === '/' || seoUrl === '') image = `/uploads/homepage/${image}`;
    else if (seoUrl.includes('terms'))   image = `/uploads/termsconditionspage/${image}`;
    else if (seoUrl.includes('privacy')) image = `/uploads/privacypolicypage/${image}`;
    else image = `/uploads/misc/${image}`;
  }

  const clean = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = image.startsWith('/') ? image : `/${image}`;
  return `${clean}${cleanPath}`;
}

// Inject meta tags into the HTML string, replacing any existing ones
function injectMetaTags(html, seoData, baseUrl) {
  if (!seoData) return html;

  const imageUrl = resolveImageUrl(seoData.image, seoData.url, baseUrl);
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = seoData.url.startsWith('/') ? seoData.url : `/${seoData.url}`;
  const fullUrl = `${cleanBase}${cleanPath}`;

  const metaTags = `
    <!-- Dynamic OG Meta Tags -->
    <title>${seoData.title}</title>
    <meta name="title" content="${seoData.title}" />
    <meta name="description" content="${seoData.description}" />

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="${seoData.type}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="${seoData.title}" />
    <meta property="og:description" content="${seoData.description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="${seoData.title}" />
    <meta name="twitter:description" content="${seoData.description}" />
    <meta name="twitter:image" content="${imageUrl}" />
  `;

  // Remove existing meta tags before injecting
  let out = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
  out = out.replace(/<meta[^>]*name\s*=\s*["']title["'][^>]*>/gi, '');
  out = out.replace(/<meta[^>]*name\s*=\s*["']description["'][^>]*>/gi, '');
  out = out.replace(/<meta[^>]*property\s*=\s*["']og:[^"']*["'][^>]*>/gi, '');
  out = out.replace(/<meta[^>]*name\s*=\s*["']twitter:[^"']*["'][^>]*>/gi, '');

  return out.replace('</head>', `${metaTags}\n  </head>`);
}

// Cache the index.html content in memory to avoid repeated disk reads
let cachedIndexHtml = null;

function getIndexHtml() {
  if (cachedIndexHtml) return cachedIndexHtml;

  const candidates = [
    path.join(__dirname, '../../Property-frontend/dist/index.html'),
    path.join(__dirname, '../dist/index.html'),
    path.join(__dirname, '../public/index.html'),
    path.join(__dirname, '../crawler_template.html'),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      cachedIndexHtml = fs.readFileSync(p, 'utf8');
      return cachedIndexHtml;
    }
  }

  return null;
}

// Main middleware — only queries DB for crawlers
async function metaTagMiddleware(req, res, next) {
  // Skip static file requests
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg|css|js|json|xml|ico|woff|woff2|ttf|eot|map)$/i)) {
    return next();
  }
  if (req.path.startsWith('/uploads') || req.path.startsWith('/api')) {
    return next();
  }

  const userAgent = req.headers['user-agent'] || '';
  const debugMode = req.query.debug_seo === 'true';

  // Only process crawlers (and debug requests) — skip regular users entirely
  if (!debugMode && !isCrawler(userAgent)) {
    return next();
  }

  if (isCrawler(userAgent)) {
    console.log(`🤖 Crawler: ${userAgent.substring(0, 60)} → ${req.path}`);
  }

  try {
    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const seoData = await fetchSEOData(req.path);

    if (!seoData) {
      if (debugMode) {
        return res.status(404).json({ error: 'No SEO data for this route', path: req.path });
      }
      return next();
    }

    if (debugMode) {
      return res.json({ seoData, userAgent, baseUrl, path: req.path });
    }

    const html = getIndexHtml();
    if (!html) {
      console.error('❌ index.html not found — skipping meta injection');
      return next();
    }

    const injected = injectMetaTags(html, seoData, baseUrl);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=300'); // cache 5 min for crawlers
    return res.send(injected);
  } catch (error) {
    console.error('❌ metaTagMiddleware error:', error.message);
    return next();
  }
}

module.exports = metaTagMiddleware;
