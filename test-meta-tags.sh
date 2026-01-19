#!/bin/bash

echo "🧪 Testing Social Media Meta Tags"
echo "=================================="
echo ""

# Test About page
echo "📄 Testing About Page..."
echo "URL: http://localhost:5002/about"
echo ""
curl -A "facebookexternalhit/1.1" http://localhost:5002/about | grep -E "(og:title|og:description|og:image|og:url)" | head -10
echo ""
echo "=================================="
echo ""

# Test Home page
echo "📄 Testing Home Page..."
echo "URL: http://localhost:5002/"
echo ""
curl -A "WhatsApp/2.0" http://localhost:5002/ | grep -E "(og:title|og:description|og:image|og:url)" | head -10
echo ""
echo "=================================="
echo ""

echo "✅ If you see dynamic meta tags above, it's working!"
echo "❌ If you see 'Property Frontend', the middleware isn't active"
echo ""
echo "Next steps:"
echo "1. Restart backend: cd Property-backend && npm run dev"
echo "2. Visit http://localhost:5002 in browser"
echo "3. Run this test again"
