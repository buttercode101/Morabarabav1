# Morabaraba PWA Icons

## Icon Files

This folder contains PWA icons for the Morabaraba game.

## Current Files

- `icon.svg` - Master SVG icon (scalable, preferred for development)
- `icon-192.png` - 192x192 PNG for PWA (required)
- `icon-512.png` - 512x512 PNG for PWA (required)

## How to Generate PNG Icons

### Method 1: Using Browser (Recommended - No Dependencies)

1. Open `generate-icons.html` in your browser (Chrome, Firefox, Edge)
2. Click "Download icon-192.png" button
3. Click "Download icon-512.png" button
4. Save both files to this `public/icons/` folder

### Method 2: Using Online Converter

1. Go to https://cloudconvert.com/svg-to-png or https://svgtopng.com/
2. Upload `icon.svg`
3. Set dimensions to 192x192 (first icon) and 512x512 (second icon)
4. Download and save to this folder

### Method 3: Using Node.js with Sharp

```bash
npm install -D sharp
node generate-icons-sharp.js
```

### Method 4: Using Python with Pillow

```bash
pip install pillow cairosvg
python generate-icons-python.py
```

## Icon Design

The icon features:
- **Background**: Light beige (#eaddd7) representing the traditional board
- **Board Lines**: Brown (#5b433b) showing the Morabaraba board pattern
- **Player 1 Piece**: Dark brown (#30221e) representing traditional black cows
- **Player 2 Piece**: Light cream (#fdf8f6) representing traditional white cows
- **Accent**: Pink (#f27696) modern touch for the game brand

## PWA Requirements

For a valid PWA manifest, you need:
- ✅ 192x192 PNG icon (required for Android home screen)
- ✅ 512x512 PNG icon (required for Play Store)
- ✅ SVG icon (optional, for scalable display)

## Troubleshooting

If icons don't show:
1. Verify files are actual PNG format (not renamed SVG)
2. Check file sizes (PNGs should be 5-50KB typically)
3. Ensure manifest.json paths are correct
4. Clear browser cache and reload

## References

- [MDN: Manifest Icons](https://developer.mozilla.org/en-US/docs/Web/Manifest/icons)
- [Web.dev: PWA Icons](https://web.dev/add-manifest/)
