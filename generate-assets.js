#!/usr/bin/env node
/**
 * Generate placeholder images for Expo app
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

async function createIcon(size, filename) {
  console.log(`Creating ${filename}...`);
  
  // Create SVG with blue circle and white "F"
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#007AFF" rx="${size * 0.2}"/>
      <text
        x="50%"
        y="50%"
        font-size="${size * 0.5}"
        font-family="Arial, sans-serif"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central"
        dy="${size * 0.03}"
      >F</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(assetsDir, filename));
  
  console.log(`✓ Created ${filename}`);
}

async function createSplash() {
  console.log('Creating splash.png...');
  
  const size = 2048;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white"/>
      <circle cx="${size/2}" cy="${size/2 - 100}" r="256" fill="#007AFF"/>
      <text
        x="50%"
        y="${size/2 - 100}"
        font-size="300"
        font-family="Arial, sans-serif"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central"
      >F</text>
      <text
        x="50%"
        y="${size/2 + 300}"
        font-size="80"
        font-family="Arial, sans-serif"
        fill="#007AFF"
        text-anchor="middle"
        dominant-baseline="central"
      >FinTrack AI</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));
  
  console.log('✓ Created splash.png');
}

async function createAdaptiveIcon() {
  console.log('Creating adaptive-icon.png...');
  
  const size = 1024;
  const padding = size / 6;
  const iconSize = size - (padding * 2);
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${iconSize/2}" fill="#007AFF"/>
      <text
        x="50%"
        y="50%"
        font-size="${iconSize * 0.5}"
        font-family="Arial, sans-serif"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central"
        dy="${iconSize * 0.03}"
      >F</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));
  
  console.log('✓ Created adaptive-icon.png');
}

async function createFavicon() {
  console.log('Creating favicon.png...');
  
  const size = 48;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#007AFF" rx="8"/>
      <text
        x="50%"
        y="50%"
        font-size="32"
        font-family="Arial, sans-serif"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central"
        dy="2"
      >F</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  
  console.log('✓ Created favicon.png');
}

async function generateAssets() {
  console.log('\n🎨 Generating placeholder assets...\n');
  
  try {
    await createIcon(1024, 'icon.png');
    await createSplash();
    await createAdaptiveIcon();
    await createFavicon();
    
    console.log('\n✅ All placeholder assets created successfully!');
    console.log('   You can replace these with your custom designs later.\n');
  } catch (error) {
    console.error('❌ Error generating assets:', error);
    process.exit(1);
  }
}

generateAssets();
