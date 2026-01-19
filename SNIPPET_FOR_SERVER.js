/* =========================================================
   🎯 Serve Frontend with Dynamic Meta Tags (Production)
   
   This section serves the built React app and injects dynamic
   meta tags for social media crawlers (WhatsApp, Facebook, etc.)
========================================================= */
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
  const metaTagMiddleware = require('./middleware/metaTagMiddleware');
  
  console.log('🎯 Serving frontend with dynamic meta tag injection'.cyan.bold);
  
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../Property-frontend/dist')));
  
  // Meta tag injection for crawlers (must be before catch-all route)
  app.use(metaTagMiddleware);
  
  // Catch-all route - serve index.html for any non-API route
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Property-frontend/dist/index.html'));
  });
}
