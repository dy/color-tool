'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const color = require('../lib/color');

test('normalizes three and six digit hex values', () => {
  assert.equal(color.normalizeHex('#abc'), 'AABBCC');
  assert.equal(color.normalizeHex('6d5dfb'), '6D5DFB');
  assert.equal(color.normalizeHex('nope'), null);
});

test('round trips RGB through HSL', () => {
  const original = { r: 109, g: 93, b: 251 };
  const actual = color.hslToRgb(color.rgbToHsl(original));
  for (const channel of ['r', 'g', 'b']) assert.ok(Math.abs(actual[channel] - original[channel]) < 0.1);
});

test('converts known colors to expected formats', () => {
  assert.deepEqual(color.rgbToHsl({ r: 255, g: 0, b: 0 }), { h: 0, s: 100, l: 50 });
  assert.deepEqual(color.rgbToCmyk({ r: 0, g: 0, b: 0 }), { c: 0, m: 0, y: 0, k: 100 });
  assert.equal(color.rgbToHex({ r: 255, g: 127.5, b: 0 }), '#FF8000');
});

test('calculates WCAG contrast', () => {
  assert.equal(color.contrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }), 21);
});

test('quantizes to the requested number of channel levels', () => {
  assert.deepEqual(color.quantize({ r: 120, g: 15, b: 250 }, 4), { r: 85, g: 0, b: 255 });
});

test('provides modern and classical color-space representations', () => {
  const result = color.formats({ r: 109, g: 93, b: 251 });
  assert.deepEqual(Object.keys(result), ['HEX', 'RGB', 'HSL', 'HSV', 'HWB', 'CMYK', 'XYZ', 'LAB', 'LCH', 'OKLAB', 'OKLCH']);
  assert.equal(result.HEX, '#6D5DFB');
});
