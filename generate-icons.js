/**
 * Morabaraba PWA Icon Generator
 * Generates 192x192 and 512x512 PNG icons for the Morabaraba game
 * 
 * Usage: node generate-icons.js
 */

import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PALETTE = {
  board: '#eaddd7',
  lines: '#5b433b',
  player1: '#30221e',
  player2: '#fdf8f6',
  accent: '#f27696',
};

function drawMorabarabaIcon(ctx, size) {
  const scale = size / 512;
  const centerX = size / 2;
  const centerY = size / 2;

  // Background
  ctx.fillStyle = PALETTE.board;
  ctx.fillRect(0, 0, size, size);

  // Outer square
  ctx.strokeStyle = PALETTE.lines;
  ctx.lineWidth = 8 * scale;
  ctx.strokeRect(100 * scale, 100 * scale, 312 * scale, 312 * scale);

  // Middle square
  ctx.strokeRect(150 * scale, 150 * scale, 212 * scale, 212 * scale);

  // Inner square
  ctx.strokeRect(200 * scale, 200 * scale, 112 * scale, 112 * scale);

  // Connecting lines
  const lines = [
    [256, 100, 256, 200], [256, 312, 256, 412],
    [100, 256, 200, 256], [312, 256, 412, 256],
    [100, 100, 200, 200], [412, 100, 312, 200],
    [100, 412, 200, 312], [412, 412, 312, 312],
  ];

  lines.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1 * scale, y1 * scale);
    ctx.lineTo(x2 * scale, y2 * scale);
    ctx.stroke();
  });

  // Player 1 cow (dark)
  ctx.fillStyle = PALETTE.player1;
  ctx.beginPath();
  ctx.arc(150 * scale, 150 * scale, 28 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Player 2 cow (light with border)
  ctx.fillStyle = PALETTE.player2;
  ctx.beginPath();
  ctx.arc(362 * scale, 362 * scale, 28 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.lines;
  ctx.lineWidth = 4 * scale;
  ctx.stroke();

  // Accent circle in center
  ctx.fillStyle = PALETTE.accent;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 20 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  drawMorabarabaIcon(ctx, size);
  
  const buffer = canvas.toBuffer('image/png');
  const outputPath = join(__dirname, 'public', 'icons', `icon-${size}.png`);
  writeFileSync(outputPath, buffer);
  
  console.log(`✓ Generated ${outputPath}`);
  return outputPath;
}

// Main
console.log('🎨 Generating Morabaraba PWA icons...\n');

try {
  generateIcon(192);
  generateIcon(512);
  console.log('\n✅ Icons generated successfully!');
} catch (error) {
  console.error('❌ Error generating icons:', error.message);
  console.log('\n💡 If canvas module is not available, open generate-icons.html in a browser instead.');
  process.exit(1);
}
