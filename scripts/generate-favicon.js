import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = './src/assets/splitfair-logo.png';
const outputDir = './public';

async function generateFavicons() {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate 32x32 PNG favicon
  await sharp(inputPath)
    .resize(32, 32)
    .toFile(path.join(outputDir, 'favicon.png'));

  // Generate 16x16 ICO
  await sharp(inputPath)
    .resize(16, 16)
    .toFile(path.join(outputDir, 'favicon-16.png'));

  // Generate 32x32 ICO
  await sharp(inputPath)
    .resize(32, 32)
    .toFile(path.join(outputDir, 'favicon-32.png'));

  console.log('Favicons generated successfully!');
}

generateFavicons().catch(console.error);
