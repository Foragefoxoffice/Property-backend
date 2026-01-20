// Meta Tag Injection Middleware for Social Media Crawlers
// This middleware intercepts requests from social media bots and injects dynamic meta tags
// DIRECT DB ACCESS VERSION - No Loopback HTTP Requests
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import Models
const HomePage = require('../models/HomePage');
const AboutPage = require('../models/AboutPage');
const ContactPage = require('../models/ContactPage');
const Blog = require('../models/Blog');
const CreateProperty = require('../models/CreateProperty');
const TermsConditionsPage = require('../models/TermsConditionsPage');
const PrivacyPolicyPage = require('../models/PrivacyPolicyPage');

// List of user agents that are social media crawlers
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
  'bingbot'
];

// Check if request is from a social media crawler
function isCrawler(userAgent) {
  if (!userAgent) return false;
  return CRAWLER_USER_AGENTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
}

// Fetch SEO data directly from MongoDB
async function fetchSEOData(reqPath) {
  try {
    let seoData = null;
    
    // Home page
    if (reqPath === '/' || reqPath === '') {
      const data = await HomePage.findOne().lean();
      if (data) {
        console.log('✅ Fetched Home Page SEO Data (DB):', {
          title: data.homeSeoOgTitle_en,
        });
        seoData = {
          title: data.homeSeoOgTitle_en || 'Property Frontend',
          description: data.homeSeoOgDescription_en || 'Find and manage properties easily with our platform.',
          image: data.homeSeoOgImages?.[0], // Can be undefined, handled in injection
          url: reqPath,
          type: 'website'
        };
      }
    }
    
    // About page
    else if (reqPath.startsWith('/about')) {
      const data = await AboutPage.findOne().lean();
      if (data) {
        seoData = {
          title: data.aboutSeoMetaTitle_en || 'About Us',
          description: data.aboutSeoMetaDescription_en || '',
          image: data.aboutSeoOgImages?.[0],
          url: reqPath,
          type: 'website'
        };
      }
    }
    
    // Contact page
    else if (reqPath.startsWith('/contact')) {
      const data = await ContactPage.findOne().lean();
      if (data) {
        seoData = {
          title: data.contactSeoMetaTitle_en || 'Contact Us',
          description: data.contactSeoMetaDescription_en || '',
          image: data.contactSeoOgImages?.[0],
          url: reqPath,
          type: 'website'
        };
      }
    }
    
    // Blog detail page
    else if (reqPath.match(/^\/blog\/[^/]+$/)) {
      const slug = reqPath.split('/blog/')[1];
      // Try finding by English or Vietnamese slug
      const blog = await Blog.findOne({
        $or: [
          { 'slug.en': slug },
          { 'slug.vi': slug },
          { 'seoInformation.slugUrl.en': slug },
          { 'seoInformation.slugUrl.vi': slug }
        ]
      }).lean();

      if (blog) {
        seoData = {
          title: blog.seoInformation?.metaTitle?.en || blog.title?.en || 'Blog Post',
          description: blog.seoInformation?.metaDescription?.en || '',
          image: blog.seoInformation?.ogImages?.[0] || blog.mainImage,
          url: reqPath,
          type: 'article'
        };
      }
    }
    
    // Property showcase page
    else if (reqPath.match(/^\/property\/[^/]+$/)) {
      const propertyId = reqPath.split('/property/')[1];
      const property = await CreateProperty.findOne({
        "listingInformation.listingInformationPropertyId": propertyId,
      }).lean();

      if (property) {
        const seoInfo = property.seoInformation || {};
        seoData = {
          title: seoInfo.metaTitle?.en || property.listingInformation?.listingInformationPropertyTitle?.en || 'Property Details',
          description: seoInfo.metaDescription?.en || property.propertyInformation?.informationView?.en || '',
          image: seoInfo.ogImages?.[0] || property.imagesVideos?.propertyImages?.[0],
          url: reqPath,
          type: 'website'
        };
      }
    }
    
    // Terms & Conditions
    else if (reqPath.startsWith('/terms')) {
      const data = await TermsConditionsPage.findOne().lean();
      if (data) {
        seoData = {
          title: data.termsConditionSeoMetaTitle_en || 'Terms & Conditions',
          description: data.termsConditionSeoMetaDescription_en || '',
          image: data.termsConditionSeoOgImages?.[0],
          url: reqPath,
          type: 'website'
        };
      }
    }
    
    // Privacy Policy
    else if (reqPath.startsWith('/privacy')) {
      const data = await PrivacyPolicyPage.findOne().lean();
      if (data) {
        seoData = {
          title: data.privacyPolicySeoMetaTitle_en || 'Privacy Policy',
          description: data.privacyPolicySeoMetaDescription_en || '',
          image: data.privacyPolicySeoOgImages?.[0],
          url: reqPath,
          type: 'website'
        };
      }
    }
    
    return seoData;
  } catch (error) {
    console.error('Error fetching SEO data from DB:', error.message);
    return null;
  }
}

// Inject meta tags into HTML
function injectMetaTags(html, seoData, baseUrl) {
  if (!seoData) return html;
  
  // LOGIC FIX: Handle Image URLs
  let imageUrl = '/images/favicon.png'; // Default fallback
  
  if (seoData.image) {
    // Check if it's a Base64 string (starts with data: or is very long)
    if (seoData.image.length > 500 && !seoData.image.startsWith('http') && !seoData.image.startsWith('/')) {
       // Likely base64 or invalid long string - ignore
       imageUrl = '/images/favicon.png';
    } else {
      // It's a likely valid path/URL or legacy filename
      let rawImage = seoData.image;

      // HARD FIX: If image is just a filename (no slashes), try to guess the folder based on page type
      // This fixes the issue where DB has "image.jpg" but file is in "/uploads/aboutpage/image.jpg"
      if (!rawImage.includes('/') && !rawImage.startsWith('http')) {
         if (seoData.url.includes('about')) rawImage = `/uploads/aboutpage/${rawImage}`;
         else if (seoData.url.includes('contact')) rawImage = `/uploads/contactpage/${rawImage}`;
         else if (seoData.url === '/' || seoData.url === '') rawImage = `/uploads/homepage/${rawImage}`;
         else if (seoData.url.includes('terms')) rawImage = `/uploads/termsconditionspage/${rawImage}`;
         else if (seoData.url.includes('privacy')) rawImage = `/uploads/privacypolicypage/${rawImage}`;
         // Blog images usually come with full path from their API, but just in case
         else if (seoData.url.includes('blog')) rawImage = `/uploads/misc/${rawImage}`;
      }

      if (rawImage.startsWith('http')) {
         // Fix Mixed Content: Force HTTPS for absolute URLs
         imageUrl = rawImage.replace(/^http:\/\//i, 'https://');
      } else {
         // Ensure baseUrl doesn't have a trailing slash before appending
         const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
         const cleanPath = rawImage.startsWith('/') ? rawImage : `/${rawImage}`;
         imageUrl = `${cleanBaseUrl}${cleanPath}`;
      }
    }
  }
  
  // Ensure we have a full URL for the default fallback too
  if (!imageUrl.startsWith('http')) {
     const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
     const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
     imageUrl = `${cleanBaseUrl}${cleanPath}`;
  }
  
  // Ensure baseUrl doesn't have a trailing slash
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  // Ensure seoData.url starts with a slash
  const cleanUrlPath = seoData.url.startsWith('/') ? seoData.url : `/${seoData.url}`;
  
  const fullUrl = `${cleanBaseUrl}${cleanUrlPath}`;
  
  // Create meta tags
  const metaTags = `
    <!-- Dynamic Meta Tags for ${seoData.title} -->
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
  
  // ROBUST REMOVAL OF EXISTING TAGS
  // Matches <title>...</title> with any attributes
  let cleanedHtml = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
  
  // Matches <meta name="title" ...> allowing for different attribute orders/spacing
  cleanedHtml = cleanedHtml.replace(/<meta[^>]*name\s*=\s*["']title["'][^>]*>/gi, '');
  cleanedHtml = cleanedHtml.replace(/<meta[^>]*name\s*=\s*["']description["'][^>]*>/gi, '');
  
  // Matches <meta property="og:..." ...>
  cleanedHtml = cleanedHtml.replace(/<meta[^>]*property\s*=\s*["']og:[^"']*["'][^>]*>/gi, '');
  
  // Matches <meta name="twitter:..." ...>
  cleanedHtml = cleanedHtml.replace(/<meta[^>]*name\s*=\s*["']twitter:[^"']*["'][^>]*>/gi, '');

  // Inject into head
  return cleanedHtml.replace('</head>', `${metaTags}\n  </head>`);
}

// Main middleware function
async function metaTagMiddleware(req, res, next) {
  const userAgent = req.headers['user-agent'] || '';
  const debugMode = req.query.debug_seo === 'true'; // Allow debugging
  
  // IGNORE STATIC FILES (Images, CSS, JS, JSON)
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg|css|js|json|xml|ico|woff|woff2|ttf|eot)$/i) || req.path.startsWith('/uploads')) {
    return next();
  }

  // Debug or Crawler check
  if (debugMode) {
    console.log(`🔍 Debug SEO Mode (DB) enabled for: ${req.path}`);
  } else {
    // If you want to enable for ALL users (good for debugging without query param), comment out the check
    // But for performance, it is better to limit to bots.
    // However, if the user complains about "sharing", we MUST support bots.
    // To enable "Open Graph" previews in Discord/Slack/WhatsApp, we MUST intercept those User Agents.
    // The previous code had it enabled for everyone.
    // I will enable for everyone for now to ensure consistency, but log only bots.
    if (isCrawler(userAgent)) {
      console.log(`🤖 Crawler detected: ${userAgent.substring(0, 50)}... for path: ${req.path}`);
    }
  }
  
  try {
    const protocol = req.protocol || 'https';
    const host = req.get('host');
    const baseUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
    
    // Fetch SEO data for this route (FROM DB)
    const seoData = await fetchSEOData(req.path);
    
    if (!seoData) {
      if (debugMode) {
        return res.status(404).json({ error: 'No SEO data found for this route', path: req.path });
      }
      return next();
    }
    
    if (debugMode) {
      // return raw JSON in debug mode
      return res.json({ 
        message: 'Debug SEO Data (DB Source)', 
        seoData, 
        userAgent,
        baseUrl
      });
    }
    
    // Define Index Paths
    const possiblePaths = [
      path.join(__dirname, '../../Property-frontend/dist/index.html'),
      path.join(__dirname, '../dist/index.html'),
      path.join(__dirname, '../public/index.html'),
      path.join(__dirname, '../crawler_template.html'), // Fallback for specialized deployments
    ];
    
    let html = null;
    let indexPath = null;
    
    for (const tryPath of possiblePaths) {
      if (fs.existsSync(tryPath)) {
        indexPath = tryPath;
        html = fs.readFileSync(tryPath, 'utf8');
        break;
      }
    }
    
    if (!html) {
      console.error('❌ Could not find index.html in any expected location');
      return next();
    }
    
    // Inject meta tags
    html = injectMetaTags(html, seoData, baseUrl);
    
    // Send the modified HTML
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); 
    res.send(html);
  } catch (error) {
    console.error('Error in meta tag middleware:', error);
    next();
  }
}

module.exports = metaTagMiddleware;
