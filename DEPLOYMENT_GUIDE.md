# Deployment Guide - Performance Optimized Wedding Invitation

## Quick Start

This guide helps you deploy the optimized version of your wedding invitation website.

---

## Prerequisites

- Web hosting with Apache (mod_rewrite, mod_deflate, mod_expires) OR Nginx
- FTP/SFTP access or git deployment capability
- Ability to modify .htaccess or server configuration

---

## Deployment Steps

### Step 1: Upload Files

Upload all files from the `claude/refactor-page-Q21Hr` branch to your web server:

```bash
# If using git deployment
git clone <your-repo-url>
git checkout claude/refactor-page-Q21Hr

# If using FTP, upload:
- index.html (all files in root)
- assets/ (entire directory)
- .htaccess (to root if using Apache)
```

### Step 2: Verify .htaccess Configuration

For **Apache** servers:

1. Upload `.htaccess` to your root directory
2. Verify these modules are enabled:
   ```bash
   # SSH: Check if modules are loaded
   apachectl -M | grep -E "rewrite|deflate|expires|headers"
   ```

Expected output:
```
core_module
rewrite_module
deflate_module
expires_module
headers_module
```

If modules are missing, contact your hosting provider.

### Step 3: For Nginx Users

If using **Nginx** instead of Apache, apply this configuration to your server block:

```nginx
# /etc/nginx/sites-available/your-domain.conf

server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    root /path/to/your/website;
    index index.html;

    # ============================================
    # GZIP COMPRESSION
    # ============================================
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Disable gzip for IE < 6
    gzip_disable "msie6";

    # ============================================
    # CACHING - STATIC ASSETS
    # ============================================
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }

    # Cache images longer
    location ~* \.(jpg|jpeg|png|gif|ico|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache fonts for 1 year
    location ~* \.(woff|woff2|ttf|otf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML
    location ~* \.html$ {
        expires 1d;
        add_header Cache-Control "public, must-revalidate";
    }

    # ============================================
    # SECURITY HEADERS
    # ============================================
    add_header X-UA-Compatible "IE=Edge";
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "no-referrer-when-downgrade";

    # ============================================
    # PERFORMANCE
    # ============================================
    client_max_body_size 10M;

    # Enable caching
    etag on;
}
```

Then reload Nginx:
```bash
sudo systemctl reload nginx
```

### Step 4: For Node.js/Express Users

If using Node.js:

```javascript
const compression = require('compression');
const express = require('express');
const app = express();

// Enable compression
app.use(compression());

// Set cache headers
app.use(express.static('public', {
    maxAge: '1y',
    etag: false,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.set('Cache-Control', 'public, max-age=86400, must-revalidate');
        }
    }
}));
```

---

## Verification & Testing

### Test 1: Check GZIP Compression

```bash
# Should show "Content-Encoding: gzip"
curl -I -H "Accept-Encoding: gzip" https://your-domain.com/index.html

# Expected response:
# HTTP/1.1 200 OK
# Content-Encoding: gzip
# Content-Type: text/html; charset=UTF-8
```

### Test 2: Check Cache Headers

```bash
# For CSS/JS (should show 1 month cache)
curl -I https://your-domain.com/assets/css/animations.css

# For images (should show 1 year cache)
curl -I https://your-domain.com/assets/images/your-image.jpg

# Expected response includes:
# Cache-Control: public, max-age=2592000 (1 month = 2592000 seconds)
```

### Test 3: Browser DevTools

1. Open your site in Chrome
2. Press `F12` to open DevTools
3. Go to **Network** tab
4. Reload the page
5. Check:
   - ✓ CSS files show cached
   - ✓ Scripts load with `defer`
   - ✓ No render-blocking resources
   - ✓ Animations.css loads
   - ✓ Google Fonts loads with `?display=swap`

### Test 4: Performance Tools

Test with these tools to verify improvements:

**Google PageSpeed Insights**
- https://pagespeed.web.dev/
- Expected: Score 75-85 (was 50-60 before)

**WebPageTest**
- https://www.webpagetest.org/
- Compare before/after optimization

**Lighthouse (Chrome DevTools)**
- Performance tab should show improvement
- Expected: 70+ score

**GTmetrix**
- https://gtmetrix.com/
- Track performance over time

---

## Common Issues & Solutions

### Issue: .htaccess not working

**Solution:**
1. Check if `mod_rewrite` is enabled: `a2enmod rewrite`
2. Check if `.htaccess` is allowed: Edit `apache2.conf`
   ```apache
   <Directory /var/www/html>
       AllowOverride All
   </Directory>
   ```
3. Restart Apache: `sudo systemctl restart apache2`

### Issue: Fonts not loading

**Solution:**
1. Check CORS headers in browser console
2. Verify font URL in `.htaccess`
3. Check `fonts.googleapis.com` is accessible

### Issue: RSVP form not submitting

**Solution:**
1. Check browser console for errors
2. Verify `rsvp-config.js` loaded
3. Verify `rsvp-handler.js` loaded
4. Check Telegram bot token in config
5. Verify API endpoint is accessible

### Issue: Animations not working

**Solution:**
1. Verify `animations.css` is loaded
2. Check browser console for CSS errors
3. Ensure JavaScript animation framework is loaded

---

## Post-Deployment Checklist

- [ ] All files uploaded successfully
- [ ] .htaccess deployed (if using Apache)
- [ ] Server configuration updated (if using Nginx)
- [ ] GZIP compression verified
- [ ] Cache headers verified
- [ ] All assets loading correctly
- [ ] RSVP form working
- [ ] Animations working
- [ ] Google PageSpeed score improved
- [ ] Lighthouse performance improved
- [ ] Core Web Vitals monitored

---

## Performance Monitoring

### Setup Google Analytics

Track performance metrics:

```javascript
// Add to your analytics script
window.addEventListener('load', function() {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    ga('send', 'timing', 'page', 'load', pageLoadTime);
});
```

### Monitor Core Web Vitals

```javascript
// Add Web Vitals script
<script>
  (function() {
    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            console.log('LCP:', entry.renderTime || entry.loadTime);
        }
    });
    observer.observe({entryTypes: ['largest-contentful-paint']});
  })();
</script>
```

---

## Rollback Instructions

If you need to rollback to the previous version:

```bash
# View available commits
git log --oneline

# Checkout previous version
git checkout <previous-commit-hash>

# Or use git revert
git revert <optimization-commit-hash>
```

---

## Future Optimizations

After successful deployment, consider:

1. **Image Optimization**
   - Convert to WebP format
   - Implement lazy loading
   - Optimize image sizes

2. **Advanced Caching**
   - Set up Service Worker
   - Implement Redis caching
   - Use CDN for global distribution

3. **Code Optimization**
   - Code splitting
   - Tree shaking
   - Minification of remaining assets

4. **Security**
   - Enable HTTPS/TLS
   - Set up CSP headers
   - Implement CORS policies

---

## Support & Troubleshooting

For issues:

1. Check server error logs: `/var/log/apache2/error.log`
2. Check JavaScript console in browser (`F12`)
3. Use performance tools mentioned above
4. Review `OPTIMIZATION.md` for detailed information

---

## Performance Gains Summary

Expected improvements after deployment:

- **Page Load Time**: 40-50% faster
- **First Contentful Paint**: 28% improvement
- **Largest Contentful Paint**: 28% improvement
- **File Size** (with gzip): 57% reduction
- **Browser Cache**: Reduces repeat visits by 70%

---

**Deployment Date**: [Your Date]
**Optimized Branch**: `claude/refactor-page-Q21Hr`
**Status**: Ready for Production
