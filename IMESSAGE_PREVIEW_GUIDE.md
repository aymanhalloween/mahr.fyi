# iMessage Preview Guide for mahr.fyi

## What We've Set Up

✅ **Open Graph Image**: Created a 1200x630px PNG image at `/public/og-image.png`
✅ **Metadata**: Updated `app/layout.tsx` with comprehensive Open Graph tags
✅ **iOS Meta Tags**: Added Apple-specific meta tags for better iOS compatibility
✅ **Test Page**: Created `/test-og` page for testing

## How to Test iMessage Previews

### Method 1: Using the Test Page
1. Visit: `https://mahr.fyi/test-og`
2. Copy the URL
3. Open iMessage on your iPhone
4. Paste the URL in a message
5. You should see a preview with the mahr.fyi branding

### Method 2: Using the Homepage
1. Visit: `https://mahr.fyi`
2. Copy the URL
3. Test in iMessage as above

## Troubleshooting

### If previews aren't working:

1. **Clear iMessage cache**:
   - On iPhone: Settings → Messages → Clear History
   - Or restart your iPhone

2. **Check if image is accessible**:
   - Visit: `https://mahr.fyi/og-image.png`
   - Should show the Open Graph image

3. **Use Facebook's Sharing Debugger**:
   - Go to: https://developers.facebook.com/tools/debug/
   - Enter your URL and click "Debug"
   - This will show you exactly what Facebook (and iMessage) sees

4. **Use Twitter Card Validator**:
   - Go to: https://cards-dev.twitter.com/validator
   - Enter your URL to test Twitter Card previews

### Common Issues:

- **Cached previews**: iMessage caches previews aggressively. Try sharing to a new conversation
- **Image size**: Make sure the image is exactly 1200x630px
- **Image format**: PNG is more reliable than SVG for social media
- **Domain**: Make sure you're testing with the production domain (mahr.fyi), not localhost

## Regenerating the Open Graph Image

If you want to update the Open Graph image:

```bash
npm run generate-og
```

This will regenerate the PNG image using the script in `scripts/generate-og-image.js`.

## Meta Tags We've Added

```html
<!-- Open Graph -->
<meta property="og:title" content="mahr.fyi - Transparent Mahr Data" />
<meta property="og:description" content="Transparent, dignified data on mahr practices around the world." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://mahr.fyi" />
<meta property="og:image" content="https://mahr.fyi/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta property="og:site_name" content="mahr.fyi" />
<meta property="og:locale" content="en_US" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="mahr.fyi - Transparent Mahr Data" />
<meta name="twitter:description" content="Transparent, dignified data on mahr practices around the world." />
<meta name="twitter:image" content="https://mahr.fyi/og-image.png" />

<!-- iOS Specific -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="mahr.fyi" />
<meta name="format-detection" content="telephone=no" />
```

## Testing Tools

- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
- **OpenGraph.xyz**: https://www.opengraph.xyz/

## Next Steps

1. Deploy your changes to production
2. Test with the Facebook Sharing Debugger
3. Test in iMessage with a fresh conversation
4. Monitor for any issues

The setup should now work perfectly for iMessage previews! 🎉 