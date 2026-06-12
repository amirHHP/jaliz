// Script to convert SVG to PNG icons for PWA
const fs = require('fs');
const path = require('path');

async function convertIcons() {
  // Dynamic import for sharp
  const sharp = (await import('sharp')).default;
  
  const svgPath = path.join(__dirname, '..', 'public', 'icons', 'icon.svg');
  const outDir = path.join(__dirname, '..', 'public', 'icons');
  const svgBuffer = fs.readFileSync(svgPath);

  const sizes = [
    { name: 'icon-192x192.png', size: 192 },
    { name: 'icon-512x512.png', size: 512 },
    { name: 'icon-maskable-192x192.png', size: 192 },
    { name: 'icon-maskable-512x512.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, name));
    console.log(`Created ${name}`);
  }
  
  console.log('All icons generated successfully!');
}

convertIcons().catch(console.error);
