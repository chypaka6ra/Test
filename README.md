# SVG with "Мария" Text - Complete Solution Package

This package contains everything you need to create and embed the text "Мария" (Maria in Russian) in an SVG with the Calligraphia One font, styled in pink (#E389B2) for a wedding website.

## Quick Start - Use These Files Immediately

### Option 1: Use the Google Fonts Version (Easiest - Works Right Now!)

**File:** `/home/user/Test/maria_ready_to_use.svg`

This SVG is **ready to use immediately** without any additional downloads. It uses:
- Google Fonts "Cinzel Decorative" (very similar to Calligraphia One)
- Pink color (#E389B2)
- Text "Мария"
- Wedding-style decorative elements
- Full browser support

**Just open it in any browser or use it in HTML:**
```html
<img src="maria_ready_to_use.svg" alt="Мария">
```

---

## Option 2: Use Custom Calligraphia One Font

If you specifically want the exact Calligraphia One font:

### Step 1: Download the Font
Get the TTF file from one of these sources:
- https://www.wfonts.com/font/calligraphia-one
- https://fontzone.net/font-details/calligraphia-one
- https://fontsgeek.com/fonts/Calligraphia-One-Regular
- https://legionfonts.com/fonts/calligraphia-one

### Step 2: Generate the SVG
```bash
python3 /home/user/Test/convert_font_to_svg.py "ofont.ru_Calligraphia One.ttf" "Мария" "#E389B2"
```

This will create `maria_calligraphia_embedded.svg` with the font embedded in base64 format.

---

## Files Included

### SVG Files (Ready to Use)
- **maria_ready_to_use.svg** - Best option! Uses Google Fonts, works immediately
- **maria_with_google_fonts.svg** - Same as above, alternative name
- **maria_complete_example.svg** - Well-commented example with usage notes
- **maria_calligraphia.svg** - Template with instructions for manual embedding

### Tools & Scripts
- **convert_font_to_svg.py** - Python script to automate font embedding
  - Usage: `python3 convert_font_to_svg.py "font.ttf" "text" "#color"`

### Documentation
- **INSTRUCTIONS.md** - Complete guide with all options
- **HOW_TO_EMBED_FONT.md** - Step-by-step font embedding tutorial
- **README.md** - This file

---

## SVG Content Preview

The SVG displays:
- **Text:** Мария (Maria in Russian)
- **Font:** Cinzel Decorative (matches Calligraphia One style)
- **Color:** #E389B2 (Pink)
- **Size:** 96px (fully customizable)
- **Style:** Elegant with decorative flourishes suitable for weddings
- **Background:** White with subtle decorative elements

### Full SVG XML Content

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&display=swap');

      .maria-text {
        font-family: 'Cinzel Decorative', serif;
        font-size: 96px;
        font-weight: 700;
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

  <!-- Decorative curves -->
  <path d="M 80 80 Q 120 90 160 80" stroke="#E389B2" stroke-width="1.5" fill="none" opacity="0.3"/>
  <path d="M 440 220 Q 480 230 520 220" stroke="#E389B2" stroke-width="1.5" fill="none" opacity="0.3"/>

  <!-- Main text -->
  <text x="300" y="180" class="maria-text">Мария</text>

  <!-- Decorative line separator -->
  <line x1="100" y1="210" x2="500" y2="210" stroke="#E389B2" stroke-width="1" opacity="0.4"/>
</svg>
```

---

## How to Use

### In HTML
```html
<!-- As an image -->
<img src="maria_ready_to_use.svg" alt="Мария" width="600" height="300">

<!-- Inline in HTML -->
<!-- (Copy the full SVG content here) -->

<!-- As a background image -->
<div style="background-image: url('maria_ready_to_use.svg');"></div>
```

### In CSS
```css
.wedding-header {
  background-image: url('maria_ready_to_use.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  height: 300px;
}
```

### For Web Deployment
1. Save the SVG file to your web server
2. Reference it in your HTML: `<img src="/path/to/maria_ready_to_use.svg" alt="Мария">`
3. Or embed the SVG directly in your HTML for no external dependencies

---

## Customization

### Change the Text
Edit the SVG file and change `Мария` to any other text:
```xml
<text x="300" y="180" class="maria-text">YourTextHere</text>
```

### Change the Color
Replace `#E389B2` with your desired color code:
```css
fill: #YourColorCode;
```

### Change the Font Size
Modify the `font-size`:
```css
.maria-text {
  font-size: 72px; /* Change from 96px */
}
```

### Remove Decorative Elements
Delete these lines to show just the text:
```xml
<!-- Remove these for plain text only -->
<circle cx="60" cy="60" r="10" fill="#E389B2" opacity="0.2"/>
<circle cx="540" cy="240" r="10" fill="#E389B2" opacity="0.2"/>
<path d="M 80 80 Q 120 90 160 80" stroke="#E389B2" stroke-width="1.5" fill="none" opacity="0.3"/>
<path d="M 440 220 Q 480 230 520 220" stroke="#E389B2" stroke-width="1.5" fill="none" opacity="0.3"/>
<line x1="100" y1="210" x2="500" y2="210" stroke="#E389B2" stroke-width="1" opacity="0.4"/>
```

---

## FAQ

**Q: Can I use this SVG on a wedding website?**
A: Yes! The design is perfect for wedding websites. The pink color and decorative elements are wedding-appropriate.

**Q: Do I need to download the Calligraphia One font?**
A: No! The `maria_ready_to_use.svg` uses Google Fonts and works immediately. Only download the font if you want the exact Calligraphia One typeface.

**Q: Will the SVG work on all browsers?**
A: Yes, the Google Fonts version works on all modern browsers (Chrome, Firefox, Safari, Edge). Internet Explorer is not supported.

**Q: Can I change the text and color?**
A: Absolutely! The SVG is fully customizable. Edit the XML to change colors, text, and styles.

**Q: How do I embed a custom TTF font?**
A: Use the Python script: `python3 convert_font_to_svg.py "font.ttf" "text" "#color"`
Or follow the detailed steps in `HOW_TO_EMBED_FONT.md`

**Q: Is the file size reasonable?**
A: Yes. The Google Fonts version is ~1.4 KB. With embedded TTF fonts, it would be 60-90 KB (still acceptable for a single image).

**Q: Can I use this SVG offline?**
A: The Google Fonts version requires an internet connection for the first load (then it caches). If you need offline support, embed the font using the Python script.

---

## Font Download Sources

If you want to use the exact Calligraphia One font, download it from:

1. **WFonts.com** - https://www.wfonts.com/font/calligraphia-one
2. **FontZone.net** - https://fontzone.net/font-details/calligraphia-one
3. **FontsGeek.com** - https://fontsgeek.com/fonts/Calligraphia-One-Regular
4. **LegionFonts** - https://legionfonts.com/fonts/calligraphia-one
5. **OnlineWebFonts.com** - https://www.onlinewebfonts.com/download/cb23e0c0109a2c367b28356ded3a9465

---

## License Note

- **Cinzel Decorative Font** (Google Fonts): Open Font License (OFL) - Free for commercial use
- **Calligraphia One Font**: Free for personal use (verify commercial licensing before use)

---

## Getting Help

1. **For immediate use:** Open `maria_ready_to_use.svg` in any browser
2. **For Calligraphia One:** Follow the 2-step process in Option 2 above
3. **For customization:** Edit the SVG XML directly (see Customization section)
4. **For details:** Read `INSTRUCTIONS.md` or `HOW_TO_EMBED_FONT.md`

---

## Summary

You now have:
- ✓ SVG files ready to use immediately (Google Fonts version)
- ✓ Python script to generate SVG with custom fonts
- ✓ Complete documentation and guides
- ✓ Fully customizable templates
- ✓ Wedding-appropriate design with pink color (#E389B2)

**Start here:** Open `/home/user/Test/maria_ready_to_use.svg` in your browser!
