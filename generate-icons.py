#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Morabaraba PWA Icon Generator
Generates 192x192 and 512x512 PNG icons using PIL/Pillow

Requirements:
    pip install pillow

Usage:
    python generate-icons.py
"""

import os
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("[ERROR] PIL/Pillow not installed!")
    print("   Install with: pip install pillow")
    sys.exit(1)

# Color palette
PALETTE = {
    'board': '#eaddd7',
    'lines': '#5b433b',
    'player1': '#30221e',
    'player2': '#fdf8f6',
    'accent': '#f27696',
}

# Board coordinates (scaled from 512x512 base)
LINES = [
    # Outer square
    (100, 100, 412, 100), (412, 100, 412, 412), (412, 412, 100, 412), (100, 412, 100, 100),
    # Middle square
    (150, 150, 362, 150), (362, 150, 362, 362), (362, 362, 150, 362), (150, 362, 150, 150),
    # Inner square
    (200, 200, 312, 200), (312, 200, 312, 312), (312, 312, 200, 312), (200, 312, 200, 200),
    # Connecting lines
    (256, 100, 256, 200), (256, 312, 256, 412),
    (100, 256, 200, 256), (312, 256, 412, 256),
    (100, 100, 200, 200), (412, 100, 312, 200),
    (100, 412, 200, 312), (412, 412, 312, 312),
]

def draw_morabaraba_icon(draw, size):
    """Draw the Morabaraba board icon on the given ImageDraw context."""
    scale = size / 512
    center = size // 2
    
    # Background
    draw.rectangle([0, 0, size, size], fill=PALETTE['board'])
    
    # Board lines
    line_width = max(1, int(8 * scale))
    for x1, y1, x2, y2 in LINES:
        draw.line(
            [(x1 * scale, y1 * scale), (x2 * scale, y2 * scale)],
            fill=PALETTE['lines'],
            width=line_width
        )
    
    # Player 1 cow (dark circle)
    cow_radius = int(28 * scale)
    cow1_pos = (int(150 * scale), int(150 * scale))
    draw.ellipse(
        [
            cow1_pos[0] - cow_radius,
            cow1_pos[1] - cow_radius,
            cow1_pos[0] + cow_radius,
            cow1_pos[1] + cow_radius
        ],
        fill=PALETTE['player1']
    )
    
    # Player 2 cow (light circle with border)
    cow2_pos = (int(362 * scale), int(362 * scale))
    draw.ellipse(
        [
            cow2_pos[0] - cow_radius,
            cow2_pos[1] - cow_radius,
            cow2_pos[0] + cow_radius,
            cow2_pos[1] + cow_radius
        ],
        fill=PALETTE['player2'],
        outline=PALETTE['lines'],
        width=max(1, int(4 * scale))
    )
    
    # Center accent
    accent_radius = int(20 * scale)
    draw.ellipse(
        [
            center - accent_radius,
            center - accent_radius,
            center + accent_radius,
            center + accent_radius
        ],
        fill=PALETTE['accent']
    )

def generate_icon(size, output_path):
    """Generate a PNG icon of the specified size."""
    # Create image with RGBA mode for transparency support
    img = Image.new('RGB', (size, size), color=PALETTE['board'])
    draw = ImageDraw.Draw(img)
    
    draw_morabaraba_icon(draw, size)
    
    # Save as PNG
    img.save(output_path, 'PNG', optimize=True)
    print(f"[OK] Generated {output_path}")
    return output_path

def main():
    """Main function to generate all icons."""
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(script_dir, 'public', 'icons')
    
    # Ensure icons directory exists
    os.makedirs(icons_dir, exist_ok=True)
    
    print('[INFO] Generating Morabaraba PWA icons...\n')
    
    try:
        generate_icon(192, os.path.join(icons_dir, 'icon-192.png'))
        generate_icon(512, os.path.join(icons_dir, 'icon-512.png'))
        print('\n[SUCCESS] Icons generated successfully!')
        return 0
    except Exception as e:
        print(f'\n[ERROR] Error generating icons: {e}')
        print('\n[TIP] Try Method 1: Open generate-icons.html in a browser')
        return 1

if __name__ == '__main__':
    sys.exit(main())
