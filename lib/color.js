'use strict';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, Number(value) || 0));
const round = (value, precision = 2) => Number(value.toFixed(precision));

function normalizeHex(value) {
  const raw = String(value).trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(raw)) return raw.split('').map((part) => part + part).join('').toUpperCase();
  if (/^[0-9a-f]{6}$/i.test(raw)) return raw.toUpperCase();
  return null;
}

function hexToRgb(hex) {
  const value = normalizeHex(hex);
  if (!value) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map((value) => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  let hue = 0, saturation = 0;
  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === r) hue = (g - b) / delta + (g < b ? 6 : 0);
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
  }
  return { h: round(hue), s: round(saturation * 100), l: round(lightness * 100) };
}

function hslToRgb({ h, s, l }) {
  h = ((Number(h) % 360) + 360) % 360 / 360;
  s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
  if (!s) return { r: l * 255, g: l * 255, b: l * 255 };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return { r: channel(h + 1 / 3) * 255, g: channel(h) * 255, b: channel(h - 1 / 3) * 255 };
}

function rgbToHsv(rgb) {
  const { h } = rgbToHsl(rgb);
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const value = Math.max(r, g, b), delta = value - Math.min(r, g, b);
  return { h, s: round(value ? delta / value * 100 : 0), v: round(value * 100) };
}

function hsvToRgb({ h, s, v }) {
  h = (((Number(h) % 360) + 360) % 360) / 60;
  s = clamp(s, 0, 100) / 100; v = clamp(v, 0, 100) / 100;
  const i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
  return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6].reduce((out, value, index) => ({ ...out, [['r', 'g', 'b'][index]]: value * 255 }), {});
}

function rgbToHwb(rgb) {
  const { h } = rgbToHsl(rgb);
  return { h, w: round(Math.min(rgb.r, rgb.g, rgb.b) / 255 * 100), b: round((1 - Math.max(rgb.r, rgb.g, rgb.b) / 255) * 100) };
}

function rgbToCmyk({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return { c: round((1 - r - k) / (1 - k) * 100), m: round((1 - g - k) / (1 - k) * 100), y: round((1 - b - k) / (1 - k) * 100), k: round(k * 100) };
}

function rgbToXyz({ r, g, b }) {
  const linear = (value) => (value /= 255) > 0.04045 ? Math.pow((value + 0.055) / 1.055, 2.4) : value / 12.92;
  r = linear(r); g = linear(g); b = linear(b);
  return { x: (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100, y: (r * 0.2126729 + g * 0.7151522 + b * 0.072175) * 100, z: (r * 0.0193339 + g * 0.119192 + b * 0.9503041) * 100 };
}

function rgbToLab(rgb) {
  let { x, y, z } = rgbToXyz(rgb); x /= 95.047; y /= 100; z /= 108.883;
  const f = (value) => value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
  x = f(x); y = f(y); z = f(z);
  return { l: (116 * y) - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

function rgbToOklab({ r, g, b }) {
  const linear = (x) => (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  r = linear(r); g = linear(g); b = linear(b);
  const l = Math.cbrt(0.4122214708*r + 0.5363325363*g + 0.0514459929*b);
  const m = Math.cbrt(0.2119034982*r + 0.6806995451*g + 0.1073969566*b);
  const s = Math.cbrt(0.0883024619*r + 0.2817188376*g + 0.6299787005*b);
  return { l: 0.2104542553*l + 0.793617785*m - 0.0040720468*s, a: 1.9779984951*l - 2.428592205*m + 0.4505937099*s, b: 0.0259040371*l + 0.7827717662*m - 0.808675766*s };
}

function cylindrical({ l, a, b }) {
  return { l, c: Math.sqrt(a * a + b * b), h: ((Math.atan2(b, a) * 180 / Math.PI) + 360) % 360 };
}

function relativeLuminance({ r, g, b }) {
  const f = (value) => (value /= 255) <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(rgb, other) {
  const a = relativeLuminance(rgb), b = relativeLuminance(other);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function formats(rgb) {
  const hsl = rgbToHsl(rgb), hsv = rgbToHsv(rgb), hwb = rgbToHwb(rgb), cmyk = rgbToCmyk(rgb);
  const xyz = rgbToXyz(rgb), lab = rgbToLab(rgb), lch = cylindrical(lab), oklab = rgbToOklab(rgb), oklch = cylindrical(oklab);
  const n = (value, precision = 2) => round(value, precision);
  return {
    HEX: rgbToHex(rgb),
    RGB: `rgb(${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)})`,
    HSL: `hsl(${n(hsl.h)} ${n(hsl.s)}% ${n(hsl.l)}%)`,
    HSV: `${n(hsv.h)}°, ${n(hsv.s)}%, ${n(hsv.v)}%`,
    HWB: `hwb(${n(hwb.h)} ${n(hwb.w)}% ${n(hwb.b)}%)`,
    CMYK: `${n(cmyk.c)}%, ${n(cmyk.m)}%, ${n(cmyk.y)}%, ${n(cmyk.k)}%`,
    XYZ: `${n(xyz.x)}, ${n(xyz.y)}, ${n(xyz.z)}`,
    LAB: `lab(${n(lab.l)}% ${n(lab.a)} ${n(lab.b)})`,
    LCH: `lch(${n(lch.l)}% ${n(lch.c)} ${n(lch.h)})`,
    OKLAB: `oklab(${n(oklab.l)} ${n(oklab.a, 3)} ${n(oklab.b, 3)})`,
    OKLCH: `oklch(${n(oklch.l)} ${n(oklch.c, 3)} ${n(oklch.h)})`
  };
}

function quantize(rgb, levels = 8) {
  const safeLevels = Math.round(clamp(levels, 2, 32));
  const step = 255 / (safeLevels - 1);
  return Object.fromEntries(['r', 'g', 'b'].map((key) => [key, Math.round(rgb[key] / step) * step]));
}

const api = { clamp, normalizeHex, hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb, rgbToHwb, rgbToCmyk, rgbToXyz, rgbToLab, rgbToOklab, relativeLuminance, contrast, formats, quantize };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.ColorMath = api;
