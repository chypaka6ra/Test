# How to Embed Calligraphia One Font in SVG

## Complete Step-by-Step Guide

### Step 1: Download the Font File

Download the Calligraphia One TTF font from one of these reliable sources:

1. **WFonts.com** - https://www.wfonts.com/font/calligraphia-one
2. **FontZone.net** - https://fontzone.net/font-details/calligraphia-one
3. **FontsGeek.com** - https://fontsgeek.com/fonts/Calligraphia-One-Regular
4. **LegionFonts** - https://legionfonts.com/fonts/calligraphia-one
5. **OnlineWebFonts.com** - https://www.onlinewebfonts.com/download/cb23e0c0109a2c367b28356ded3a9465

Save the file as `ofont.ru_Calligraphia One.ttf` in your project directory.

### Step 2: Convert TTF to Base64

#### Option A: Using the Python Script (Easiest)

```bash
python3 convert_font_to_svg.py "ofont.ru_Calligraphia One.ttf" "Мария" "#E389B2"
```

This will automatically:
- Convert your TTF file to base64
- Create an SVG with the embedded font
- Generate `maria_calligraphia_embedded.svg`

#### Option B: Manual Conversion

**On Linux/Mac:**
```bash
base64 -w 0 "ofont.ru_Calligraphia One.ttf" > font_base64.txt
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("ofont.ru_Calligraphia One.ttf")) | Out-File font_base64.txt -NoNewline
```

**On Windows (Command Prompt):**
```cmd
certutil -encode "ofont.ru_Calligraphia One.ttf" font_base64.txt
```

### Step 3: Create the SVG with Embedded Font

Take the base64 string from the previous step and insert it into this SVG template:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300">
  <defs>
    <style>
      @font-face {
        font-family: 'Calligraphia One';
        src: url('data:font/ttf;charset=utf-8;base64,PASTE_YOUR_BASE64_HERE') format('truetype');
      }

      .maria-text {
        font-family: 'Calligraphia One', serif;
        font-size: 96px;
        font-weight: 400;
        fill: #E389B2;
        text-anchor: middle;
        letter-spacing: 3px;
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="600" height="300" fill="#ffffff"/>

  <!-- Decorative corner elements -->
  <circle cx="60" cy="60" r="10" fill="#E389B2" opacity="0.2"/>
  <circle cx="540" cy="240" r="10" fill="#E389B2" opacity="0.2"/>

  <!-- Decorative curves for wedding aesthetic -->
  <path d="M 80 80 Q 120 90 160 80" stroke="#E389B2" stroke-width="1.5" fill="none" opacity="0.3"/>
  <path d="M 440 220 Q 480 230 520 220" stroke="#E389B2" stroke-width="1.5" fill="none" opacity="0.3"/>

  <!-- Main text - "Мария" (Maria in Russian/Cyrillic) -->
  <text x="300" y="180" class="maria-text">Мария</text>

  <!-- Decorative line separator -->
  <line x1="100" y1="210" x2="500" y2="210" stroke="#E389B2" stroke-width="1" opacity="0.4"/>
</svg>
```

Replace `PASTE_YOUR_BASE64_HERE` with your actual base64 string (without line breaks or spaces).

## What You Get

- **Font**: Calligraphia One (exactly as requested)
- **Text**: Мария (Maria in Russian)
- **Color**: #E389B2 (Pink)
- **Size**: 96px (fully adjustable)
- **Style**: Decorative elements suitable for wedding website
- **Format**: Standard SVG that works in all modern browsers

## File Size Notes

The base64-encoded font will be approximately 60-90 KB when embedded in the SVG. This is normal - browsers handle it fine. The resulting SVG file will be larger than using a web font, but it has the advantage of:
- No external font downloads needed
- Font always displays consistently
- Works offline
- Single file deployment

## Testing Your SVG

1. **In a Browser**: Simply open the SVG file in any modern browser
2. **In HTML**: Embed it with `<img src="maria.svg" alt="Мария">`
3. **As CSS Background**: Use it as a background-image
4. **Inline in HTML**: Copy the SVG code directly into your HTML

## Customization Tips

**Change the text:**
```xml
<text x="300" y="180" class="maria-text">YourTextHere</text>
```

**Change the color:**
Replace all instances of `#E389B2` with your desired color code.

**Change the size:**
Modify the `font-size` in the CSS:
```css
.maria-text {
  font-size: 72px; /* Change from 96px */
}
```

**Remove decorative elements:**
Delete the lines containing:
- `<circle>` elements
- `<path>` elements
- `<line>` elements

## Browser Support

- Chrome: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support
- Internet Explorer: Not supported (consider using the Google Fonts version for IE)

## Troubleshooting

**Text doesn't display?**
- Verify the base64 string has no line breaks
- Check browser console for errors
- Try a smaller font size

**Font looks different?**
- System may have a different version of the font installed - embedded font should override
- Check that @font-face declaration is before the class that uses it

**File too large?**
- This is expected with embedded fonts
- Consider using Google Fonts version instead if file size is critical

**Encoding issues with Cyrillic?**
- Ensure SVG file is saved as UTF-8 encoding
- Include `encoding="UTF-8"` in XML declaration (already included in templates)

## Quick Command Reference

**Generate SVG with embedded Calligraphia One:**
```bash
python3 convert_font_to_svg.py "ofont.ru_Calligraphia One.ttf" "Мария" "#E389B2"
```

**Or manually with base64:**
```bash
# Convert font to base64
base64 -w 0 "ofont.ru_Calligraphia One.ttf" > font.txt

# Copy the content and paste into SVG template's src attribute
# src: url('data:font/ttf;charset=utf-8;base64,CONTENT_HERE')
```

## Additional Resources

- SVG Fonts Documentation: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font
- Data URLs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
- Web Font Formats: https://developer.mozilla.org/en-US/docs/Learn/CSS/Styling_text/Web_fonts
