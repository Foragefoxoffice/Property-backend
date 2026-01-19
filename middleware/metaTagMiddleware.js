// Meta Tag Injection Middleware for Social Media Crawlers
// This middleware intercepts requests from social media bots and injects dynamic meta tags

const axios = require('axios');

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

// Fetch SEO data from your API based on route
async function fetchSEOData(path, apiBaseUrl) {
  try {
    let seoData = null;
    
    // Home page
    if (path === '/' || path === '') {
      const response = await axios.get(`${apiBaseUrl}/api/v1/home-page`);
      const data = response.data?.data || response.data;
      seoData = {
        title: data.homeSeoMetaTitle_en || 'Property Frontend',
        description: data.homeSeoMetaDescription_en || 'Find and manage properties easily with our platform.',
        image: data.homeSeoOgImages?.[0] || '/images/favicon.png',
        url: path,
        type: 'website'
      };
    }
    
    // About page
    else if (path.startsWith('/about')) {
      const response = await axios.get(`${apiBaseUrl}/api/v1/about-page`);
      const data = response.data?.data || response.data;
      seoData = {
        title: data.aboutSeoMetaTitle_en || 'About Us',
        description: data.aboutSeoMetaDescription_en || '',
        image: data.aboutSeoOgImages?.[0] || '/images/favicon.png',
        url: path,
        type: 'website'
      };
    }
    
    // Contact page
    else if (path.startsWith('/contact')) {
      const response = await axios.get(`${apiBaseUrl}/api/v1/contact-page`);
      const data = response.data?.data || response.data;
      seoData = {
        title: data.contactSeoMetaTitle_en || 'Contact Us',
        description: data.contactSeoMetaDescription_en || '',
        image: data.contactSeoOgImages?.[0] || '/images/favicon.png',
        url: path,
        type: 'website'
      };
    }
    
    // Blog detail page
    else if (path.match(/^\/blog\/[^/]+$/)) {
      const slug = path.split('/blog/')[1];
      const response = await axios.get(`${apiBaseUrl}/api/v1/blogs/slug/${slug}`);
      const blog = response.data?.data;
      if (blog) {
        seoData = {
          title: blog.seoInformation?.metaTitle?.en || blog.title?.en || 'Blog Post',
          description: blog.seoInformation?.metaDescription?.en || '',
          image: blog.seoInformation?.ogImages?.[0] || blog.mainImage || '/images/favicon.png',
          url: path,
          type: 'article'
        };
      }
    }
    
    // Property showcase page
    else if (path.match(/^\/property\/[^/]+$/)) {
      const propertyId = path.split('/property/')[1];
      const response = await axios.get(`${apiBaseUrl}/api/v1/propertyListing/single/${propertyId}`);
      const property = response.data?.data;
      if (property) {
        const seoInfo = property.seoInformation || {};
        seoData = {
          title: seoInfo.metaTitle?.en || property.listingInformation?.listingInformationPropertyTitle?.en || 'Property Details',
          description: seoInfo.metaDescription?.en || property.propertyInformation?.informationView?.en || '',
          image: seoInfo.ogImages?.[0] || property.imagesVideos?.propertyImages?.[0] || '/images/favicon.png',
          url: path,
          type: 'website'
        };
      }
    }
    
    // Terms & Conditions
    else if (path.startsWith('/terms')) {
      const response = await axios.get(`${apiBaseUrl}/api/v1/terms-conditions-page`);
      const data = response.data?.data || response.data;
      seoData = {
        title: data.termsConditionSeoMetaTitle_en || 'Terms & Conditions',
        description: data.termsConditionSeoMetaDescription_en || '',
        image: data.termsConditionSeoOgImages?.[0] || '/images/favicon.png',
        url: path,
        type: 'website'
      };
    }
    
    // Privacy Policy
    else if (path.startsWith('/privacy')) {
      const response = await axios.get(`${apiBaseUrl}/api/v1/privacy-policy-page`);
      const data = response.data?.data || response.data;
      seoData = {
        title: data.privacyPolicySeoMetaTitle_en || 'Privacy Policy',
        description: data.privacyPolicySeoMetaDescription_en || '',
        image: data.privacyPolicySeoOgImages?.[0] || '/images/favicon.png',
        url: path,
        type: 'website'
      };
    }
    
    return seoData;
  } catch (error) {
    console.error('Error fetching SEO data:', error.message);
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
    if (seoData.image.length > 500 || seoData.image.startsWith('data:') || !seoData.image.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      console.log('⚠️ Ignoring Base64/Invalid image for SEO:', seoData.image.substring(0, 20) + '...');
      // fallback to default
      imageUrl = '/images/favicon.png';
    } else {
      // It's a likely valid path/URL
      imageUrl = seoData.image.startsWith('http') 
        ? seoData.image 
        : `${baseUrl}${seoData.image.startsWith('/') ? '' : '/'}${seoData.image}`;
    }
  }
  
  // Ensure we have a full URL for the default fallback too
  if (!imageUrl.startsWith('http')) {
     imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }
  
  const fullUrl = `${baseUrl}${seoData.url}`;
  
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
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="${seoData.title}" />
    <meta name="twitter:description" content="${seoData.description}" />
    <meta name="twitter:image" content="${imageUrl}" />
  `;
  
  // Remove existing tags to avoid duplicates
  let cleanedHtml = html
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta[^>]*?name=["']title["'][^>]*?>/gi, '')
    .replace(/<meta[^>]*?name=["']description["'][^>]*?>/gi, '')
    .replace(/<meta[^>]*?property=["']og:.*?["'][^>]*?>/gi, '')
    .replace(/<meta[^>]*?name=["']twitter:.*?["'][^>]*?>/gi, '');

  // Inject into head
  return cleanedHtml.replace('</head>', `${metaTags}\n  </head>`);
}

// Main middleware function
async function metaTagMiddleware(req, res, next) {
  const userAgent = req.headers['user-agent'] || '';
  
  // Only process for crawlers
  if (!isCrawler(userAgent)) {
    return next();
  }
  
  console.log(`🤖 Crawler detected: ${userAgent.substring(0, 50)}... for path: ${req.path}`);
  
  try {
    // Get the base URL (use environment variable or construct from request)
    const protocol = req.protocol || 'https';
    const host = req.get('host');
    const baseUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    
    // Fetch SEO data for this route
    const seoData = await fetchSEOData(req.path, apiBaseUrl);
    
    if (!seoData) {
      return next();
    }
    
    // Read the index.html file from dist folder
    const fs = require('fs');
    const path = require('path');
    
    // Try multiple possible paths for index.html
    const possiblePaths = [
      path.join(__dirname, '../../Property-frontend/dist/index.html'),
      path.join(__dirname, '../dist/index.html'),
      path.join(__dirname, '../public/index.html'),
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
    
    console.log(`✅ Using index.html from: ${indexPath}`);
    
    // Inject meta tags
    html = injectMetaTags(html, seoData, baseUrl);
    
    // Send the modified HTML
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error in meta tag middleware:', error);
    next();
  }
}

module.exports = metaTagMiddleware;
