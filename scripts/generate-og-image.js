const sharp = require('sharp');

// Create a simple PNG image for Open Graph
const width = 1200;
const height = 630;

// Create a canvas with gradient background
const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#faf9f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f5f5f4;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  
  <!-- Decorative elements -->
  <circle cx="100" cy="100" r="50" fill="#e7e5e4" opacity="0.3"/>
  <circle cx="1100" cy="530" r="80" fill="#e7e5e4" opacity="0.2"/>
  <circle cx="200" cy="500" r="30" fill="#e7e5e4" opacity="0.4"/>
  
  <!-- Main content area -->
  <rect x="150" y="150" width="900" height="330" rx="20" fill="white" stroke="#e7e5e4" stroke-width="2"/>
  
  <!-- Logo/Title -->
  <text x="600" y="250" font-family="Inter, system-ui, sans-serif" font-size="48" font-weight="700" text-anchor="middle" fill="#292524">
    mahr.fyi
  </text>
  
  <!-- Subtitle -->
  <text x="600" y="300" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="400" text-anchor="middle" fill="#78716c">
    Transparent Mahr Data
  </text>
  
  <!-- Description -->
  <text x="600" y="350" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="400" text-anchor="middle" fill="#78716c">
    Transparent, dignified data on mahr practices around the world
  </text>
  
  <!-- Call to action -->
  <text x="600" y="420" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="500" text-anchor="middle" fill="#57534e">
    Explore • Compare • Contribute
  </text>
</svg>
`;

async function generateOGImage() {
  try {
    await sharp(Buffer.from(svg))
      .png()
      .toFile('public/og-image.png');
    
    console.log('✅ Open Graph image generated successfully at public/og-image.png');
  } catch (error) {
    console.error('❌ Error generating Open Graph image:', error);
  }
}

generateOGImage(); 