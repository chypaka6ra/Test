#!/usr/bin/env python3
"""
Script to convert a TTF font file to base64 and generate an SVG with embedded font.
Usage: python3 convert_font_to_svg.py "path/to/font.ttf" "text to display" "hex_color"
Example: python3 convert_font_to_svg.py "ofont.ru_Calligraphia One.ttf" "Мария" "#E389B2"
"""

import sys
import base64
import os

def convert_font_to_base64(font_path):
    """Convert a TTF font file to base64 string."""
    if not os.path.exists(font_path):
        print(f"Error: Font file not found at {font_path}")
        sys.exit(1)

    with open(font_path, 'rb') as f:
        font_data = f.read()

    base64_string = base64.b64encode(font_data).decode('utf-8')
    return base64_string

def create_svg_with_embedded_font(font_path, text, color, output_path):
    """Create an SVG with embedded font."""
    base64_font = convert_font_to_base64(font_path)

    # Get font filename without extension for font-family name
    font_name = os.path.splitext(os.path.basename(font_path))[0]

    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300">
  <defs>
    <style>
      @font-face {{
        font-family: '{font_name}';
        src: url('data:font/ttf;charset=utf-8;base64,{base64_font}') format('truetype');
      }}

      .maria-text {{
        font-family: '{font_name}', serif;
        font-size: 96px;
        font-weight: 400;
        fill: {color};
        text-anchor: middle;
        letter-spacing: 3px;
      }}
    </style>
  </defs>

  <!-- Background -->
  <rect width="600" height="300" fill="#ffffff"/>

  <!-- Decorative elements for wedding style -->
  <circle cx="60" cy="60" r="10" fill="{color}" opacity="0.2"/>
  <circle cx="540" cy="240" r="10" fill="{color}" opacity="0.2"/>
  <path d="M 80 80 Q 120 90 160 80" stroke="{color}" stroke-width="1.5" fill="none" opacity="0.3"/>
  <path d="M 440 220 Q 480 230 520 220" stroke="{color}" stroke-width="1.5" fill="none" opacity="0.3"/>

  <!-- Main text -->
  <text x="300" y="180" class="maria-text">{text}</text>

  <!-- Decorative line -->
  <line x1="100" y1="210" x2="500" y2="210" stroke="{color}" stroke-width="1" opacity="0.4"/>
</svg>
'''

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)

    print(f"Successfully created SVG: {output_path}")
    print(f"Font size: {len(base64_font):,} characters (base64 encoded)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Default usage
        print("Usage: python3 convert_font_to_svg.py <font_path> [text] [color]")
        print("Example: python3 convert_font_to_svg.py 'ofont.ru_Calligraphia One.ttf' 'Мария' '#E389B2'")

        # If running with defaults
        font_file = "ofont.ru_Calligraphia One.ttf"
        text = "Мария"
        color = "#E389B2"
        output = "maria_calligraphia_embedded.svg"

        if os.path.exists(font_file):
            create_svg_with_embedded_font(font_file, text, color, output)
        else:
            print(f"\nFont file '{font_file}' not found.")
            print("Please download it from one of these sources:")
            print("  - https://www.wfonts.com/font/calligraphia-one")
            print("  - https://fontzone.net/font-details/calligraphia-one")
            print("  - https://fontsgeek.com/fonts/Calligraphia-One-Regular")
            print("  - https://legionfonts.com/fonts/calligraphia-one")
            sys.exit(1)
    else:
        font_file = sys.argv[1]
        text = sys.argv[2] if len(sys.argv) > 2 else "Мария"
        color = sys.argv[3] if len(sys.argv) > 3 else "#E389B2"
        output = sys.argv[4] if len(sys.argv) > 4 else "output.svg"

        create_svg_with_embedded_font(font_file, text, color, output)
