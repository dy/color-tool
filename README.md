# Color Tool

A fast, fullscreen color workspace for picking, translating, collecting, and extracting colors. It is deliberately a static site: no build step, account, upload, framework, or runtime dependency.

**[Open the live tool](https://dfcreative.github.io/color-tool)**

## Why this exists

Most color pickers either do one tiny job or bury the color under interface chrome. Color Tool keeps the selected color large enough to experience while putting the useful details one glance away.

Use it to:

- choose a color visually, by RGB channels, by hex value, or from the keyboard;
- translate a color across classical and perceptual spaces;
- preview deliberate low-color-depth treatments with channel quantization;
- assemble a small working palette and export it as CSS custom properties;
- check text contrast while choosing a background;
- extract dominant colors and approximate distribution from a reference image;
- inspect an image locally without sending it to a server.

## Features

### Fullscreen picker

The large live preview makes subtle changes visible. Use the two-dimensional HSL field, the hue strip, RGB sliders, direct hex input, or **R** for a random useful color. Arrow keys move the focused field by one point; hold **Shift** for ten-point steps. Press **Enter** to save the current color.

### Color-space translation

Every selection is shown as HEX, RGB, HSL, HSV, HWB, CMYK, CIE XYZ, CIE Lab/LCH, and OKLab/OKLCH. Individual values or the complete list can be copied. The conversion functions live in [`lib/color.js`](lib/color.js) and can also be required from Node:

```js
const color = require('color-tool');

color.formats({ r: 109, g: 93, b: 251 });
color.contrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
```

Values are encoded relative to sRGB with a D65 reference white. CMYK is a convenient device-independent approximation, not an ICC print proof.

### Quantization

Quantization snaps each RGB channel to 4, 8, 16, or 32 levels. This is useful for pixel art, reduced palettes, LED displays, retro interfaces, and seeing whether a design remains coherent under a tighter color budget.

### Palette workspace

Save several colors, revisit or remove them, and copy the result as a minimal `:root` block of CSS custom properties. The palette and theme preference persist locally.

### Private image analysis

Drop a PNG, JPEG, WebP, or another browser-supported image into the Image view. The tool downsamples large files, groups pixels into a compact RGB histogram, and reports the most frequent color buckets and their relative share. Select a result to add it directly to the palette. Image bytes never leave the browser.

## Run locally

The app uses plain HTML, CSS, and JavaScript, so any static server works:

```sh
npm start
```

Then open <http://localhost:4173>. There is no install or build step.

## Test

Requires Node.js 18 or later:

```sh
npm test
npm run check
```

The test suite covers parsing, round trips, known conversions, WCAG contrast, quantization, and the complete format surface.

## Deploy

Publish the repository root to any static host. For GitHub Pages, select the branch root as the Pages source. `index.html`, `index.css`, `app.js`, and `lib/color.js` are the complete runtime.

## Design principles

1. **Color first.** The selected color is the largest object on screen.
2. **Immediate.** Input updates do not wait for workers, dependencies, or a network.
3. **Progressive.** The default view is simple; spaces, collections, and analysis are close by.
4. **Private.** Preferences use local storage and image work happens in memory.
5. **Portable.** The site works from a static server and the math works in Node.

## License

[MIT](LICENSE)
