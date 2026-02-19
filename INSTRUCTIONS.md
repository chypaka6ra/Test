# SVG Creation Guide for "Мария" with Calligraphia One Font

## Overview

This guide provides you with multiple solutions for creating an SVG file with the text "Мария" in the Calligraphia One font with pink color (#E389B2).

## Files Provided

1. **maria_calligraphia.svg** - SVG template with instructions for embedding the font
2. **maria_with_google_fonts.svg** - Working SVG using a similar Google Font (Cinzel Decorative)
3. **convert_font_to_svg.py** - Python script to automate the font embedding process

## Option 1: Using Google Fonts (Quickest - Works Immediately)

The file `maria_with_google_fonts.svg` uses the "Cinzel Decorative" font from Google Fonts, which is very similar in style to Calligraphia One. This SVG:
- Works immediately without any additional downloads
- Displays "Мария" in pink (#E389B2)
- Includes decorative elements suitable for a wedding website
- Supports all modern browsers
- Can be embedded in web pages or used as a standalone file

**Usage:**
Simply open `maria_with_google_fonts.svg` in any browser or use it directly in your HTML.

## Option 2: Embedding Calligraphia One Font (Custom Font)

If you specifically want the Calligraphia One font, follow these steps:

### Step 1: Download the Font

Download the TTF file from one of these sources:

- [WFonts.com](https://www.wfonts.com/font/calligraphia-one)
- [FontZone.net](https://fontzone.net/font-details/calligraphia-one)
- [FontsGeek.com](https://fontsgeek.com/fonts/Calligraphia-One-Regular)
- [LegionFonts](https://legionfonts.com/fonts/calligraphia-one)
- [OnlineWebFonts.com](https://www.onlinewebfonts.com/download/cb23e0c0109a2c367b28356ded3a9465)

Save the font file in your project directory (e.g., as `ofont.ru_Calligraphia One.ttf`).

### Step 2: Convert TTF to Base64

Use the provided Python script to automatically convert the font and generate the SVG:

```bash
python3 convert_font_to_svg.py "ofont.ru_Calligraphia One.ttf" "Мария" "#E389B2"
```

This will create `maria_calligraphia_embedded.svg` with the font embedded in base64 format.

### Alternative: Manual Conversion

If you prefer to do this manually:

```bash
base64 -w 0 "ofont.ru_Calligraphia One.ttf" > font_base64.txt
```

Then copy the base64 string from `font_base64.txt` and replace `YOUR_BASE64_STRING_HERE` in the SVG's `@font-face` rule:

```xml
<style>
  @font-face {
    font-family: 'Calligraphia One';
    src: url('data:font/ttf;charset=utf-8;base64,YOUR_BASE64_STRING_HERE') format('truetype');
  }
</style>
```

### Step 3: Use the Generated SVG

The resulting SVG file can be:
- Opened in any modern browser
- Embedded in HTML: `<img src="maria.svg" alt="Мария">`
- Used as a background image in CSS
- Embedded inline in HTML documents
- Used in web applications

## Font Specifications

**Text:** Мария (Maria in Russian)
**Font:** Calligraphia One
**Color:** #E389B2 (Pink)
**Size:** 96px (adjustable in the SVG)
**Style:** Decorative, suitable for wedding websites

## Features Included

- Cyrillic text support (Russian characters)
- Pink color (#E389B2) as requested
- Decorative elements (ornaments, separator line)
- Responsive SVG viewBox for scaling
- Clean, professional wedding-website aesthetic

## Browser Compatibility

- **Google Fonts Version:** Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- **Embedded Font Version:** Works in all modern browsers that support SVG and embedded fonts

## Customization

You can easily customize the SVG files:

1. **Change text:** Replace "Мария" with any other text
2. **Change color:** Replace #E389B2 with any hex color code
3. **Change size:** Modify the `font-size` in the CSS
4. **Remove decorations:** Delete the decorative circle and line elements
5. **Adjust dimensions:** Modify the `width`, `height`, and `viewBox` attributes

## License Note

The Calligraphia One font is free for personal use. For commercial use on websites, please verify the font license or consider using the Google Fonts alternative (Cinzel Decorative) which is licensed under the Open Font License (OFL).

## Troubleshooting

**SVG not displaying text?**
- Check that the font file path is correct
- Ensure the base64 string is completely copied without line breaks
- Verify browser console for any error messages

**Font not appearing as expected?**
- The system might not have the font installed; embedded fonts should override this
- Try the Google Fonts version as a fallback

**Base64 string too long?**
- This is normal; TTF files encoded in base64 can be 60-150+ KB in text form
- The browser will decode and use it automatically

## Quick Start

For the easiest solution, use `maria_with_google_fonts.svg` directly - it's ready to use!

For a custom Calligraphia One font, use:
```bash
python3 convert_font_to_svg.py "ofont.ru_Calligraphia One.ttf"
```

Then use the generated `maria_calligraphia_embedded.svg` file.
