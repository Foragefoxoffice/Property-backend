# Test Social Media Meta Tags
Write-Host "🧪 Testing Social Media Meta Tags" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test About page
Write-Host "📄 Testing About Page..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:5002/about" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5002/about" -UserAgent "facebookexternalhit/1.1" -UseBasicParsing
    $html = $response.Content
    
    # Extract meta tags
    if ($html -match '<meta property="og:title" content="([^"]+)"') {
        Write-Host "✅ OG Title: $($matches[1])" -ForegroundColor Green
    } else {
        Write-Host "❌ OG Title: Not found" -ForegroundColor Red
    }
    
    if ($html -match '<meta property="og:description" content="([^"]+)"') {
        Write-Host "✅ OG Description: $($matches[1])" -ForegroundColor Green
    } else {
        Write-Host "❌ OG Description: Not found" -ForegroundColor Red
    }
    
    if ($html -match '<meta property="og:image" content="([^"]+)"') {
        Write-Host "✅ OG Image: $($matches[1])" -ForegroundColor Green
    } else {
        Write-Host "❌ OG Image: Not found" -ForegroundColor Red
    }
    
    if ($html -match '<meta property="og:url" content="([^"]+)"') {
        Write-Host "✅ OG URL: $($matches[1])" -ForegroundColor Green
    } else {
        Write-Host "❌ OG URL: Not found" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check if it's the default or dynamic
    if ($html -match "Property Frontend") {
        Write-Host "⚠️  WARNING: Still showing default 'Property Frontend' meta tags" -ForegroundColor Yellow
        Write-Host "   This means the middleware is not active yet." -ForegroundColor Yellow
    } else {
        Write-Host "✅ SUCCESS: Dynamic meta tags are working!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ ERROR: Could not connect to http://localhost:5002" -ForegroundColor Red
    Write-Host "   Make sure the backend server is running!" -ForegroundColor Yellow
    Write-Host "   Run: cd Property-backend && npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure backend is running on port 5002" -ForegroundColor White
Write-Host "2. Visit http://localhost:5002 in your browser" -ForegroundColor White
Write-Host "3. Check if the React app loads correctly" -ForegroundColor White
Write-Host "4. Share a link on WhatsApp to test real-world" -ForegroundColor White
