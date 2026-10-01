'use strict';

const C = window.ColorMath;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = {
  rgb: C.hexToRgb('#6D5DFB'),
  palette: JSON.parse(localStorage.getItem('color-tool-palette') || '[]'),
  quantize: false,
  levels: 8,
  imageData: null
};

const elements = {
  stage: $('#colorStage'), heroHex: $('#heroHex'), contrast: $('#contrastLabel'), hue: $('#hueRange'), hueOutput: $('#hueOutput'),
  field: $('#fieldPicker'), cursor: $('#pickerCursor'), hex: $('#hexInput'), spaces: $('#spaceList'), rgbSliders: $('#rgbSliders'),
  palette: $('#paletteGrid'), empty: $('#paletteEmpty'), toast: $('#toast'), analysis: $('#analysis'), dominant: $('#dominantColors')
};

function shownRgb() { return state.quantize ? C.quantize(state.rgb, state.levels) : state.rgb; }
function inkFor(rgb) { return C.contrast(rgb, { r: 255, g: 255, b: 255 }) >= 4.5 ? '#fff' : '#161613'; }
function toast(message) {
  elements.toast.textContent = message; elements.toast.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => elements.toast.classList.remove('show'), 1400);
}
async function copy(value, message = 'Copied to clipboard') {
  try { await navigator.clipboard.writeText(value); toast(message); }
  catch (_) { toast('Copy is unavailable in this browser'); }
}

function update() {
  const rgb = shownRgb(), hex = C.rgbToHex(rgb), hsl = C.rgbToHsl(rgb), values = C.formats(rgb);
  document.documentElement.style.setProperty('--accent', hex);
  document.documentElement.style.setProperty('--field-hue', `hsl(${hsl.h} 100% 50%)`);
  elements.stage.style.background = hex; elements.stage.style.color = inkFor(rgb);
  elements.heroHex.textContent = hex; elements.hex.value = hex.slice(1);
  elements.hue.value = hsl.h; elements.hueOutput.textContent = `${Math.round(hsl.h)}°`;
  elements.cursor.style.left = `${hsl.s}%`; elements.cursor.style.top = `${100 - hsl.l}%`;
  elements.field.setAttribute('aria-valuetext', `${Math.round(hsl.s)}% saturation, ${Math.round(hsl.l)}% lightness`);
  elements.contrast.textContent = `Ink contrast ${C.contrast(rgb, C.hexToRgb(inkFor(rgb))).toFixed(2)}:1 · ${C.contrast(rgb, C.hexToRgb(inkFor(rgb))) >= 7 ? 'AAA' : 'AA'}`;
  elements.spaces.innerHTML = Object.entries(values).map(([name, value]) => `<div class="space-row"><span>${name}</span><code title="${value}">${value}</code><button aria-label="Copy ${name}" data-copy="${value}">Copy</button></div>`).join('');
  ['r', 'g', 'b'].forEach((channel) => {
    const input = $(`#${channel}Range`), output = $(`#${channel}Output`);
    if (input) { input.value = Math.round(rgb[channel]); output.textContent = Math.round(rgb[channel]); }
  });
}

function setFromHsl(partial) {
  const current = C.rgbToHsl(state.rgb);
  state.rgb = C.hslToRgb({ ...current, ...partial }); update();
}

function useField(event) {
  const rect = elements.field.getBoundingClientRect();
  const x = C.clamp(event.clientX - rect.left, 0, rect.width) / rect.width;
  const y = C.clamp(event.clientY - rect.top, 0, rect.height) / rect.height;
  setFromHsl({ s: x * 100, l: (1 - y) * 100 });
}

let fieldDragging = false;
elements.field.addEventListener('pointerdown', (event) => { fieldDragging = true; elements.field.setPointerCapture(event.pointerId); useField(event); });
elements.field.addEventListener('pointermove', (event) => fieldDragging && useField(event));
elements.field.addEventListener('pointerup', () => { fieldDragging = false; });
elements.field.addEventListener('keydown', (event) => {
  const hsl = C.rgbToHsl(state.rgb), step = event.shiftKey ? 10 : 1;
  if (event.key === 'ArrowLeft') setFromHsl({ s: hsl.s - step }); else if (event.key === 'ArrowRight') setFromHsl({ s: hsl.s + step });
  else if (event.key === 'ArrowUp') setFromHsl({ l: hsl.l + step }); else if (event.key === 'ArrowDown') setFromHsl({ l: hsl.l - step }); else return;
  event.preventDefault();
});
elements.hue.addEventListener('input', () => setFromHsl({ h: +elements.hue.value }));
elements.hex.addEventListener('input', () => { const rgb = C.hexToRgb(elements.hex.value); if (rgb) { state.rgb = rgb; update(); } });
elements.spaces.addEventListener('click', (event) => { if (event.target.dataset.copy) copy(event.target.dataset.copy); });
elements.heroHex.addEventListener('click', () => copy(C.rgbToHex(shownRgb())));
$('#copyAll').addEventListener('click', () => copy(Object.entries(C.formats(shownRgb())).map(([key, value]) => `${key}: ${value}`).join('\n'), 'All formats copied'));

['r', 'g', 'b'].forEach((channel) => {
  const label = channel.toUpperCase();
  elements.rgbSliders.insertAdjacentHTML('beforeend', `<label class="range-row"><span>${label}</span><input id="${channel}Range" type="range" min="0" max="255"><output id="${channel}Output"></output></label>`);
  $(`#${channel}Range`).addEventListener('input', (event) => { state.rgb[channel] = +event.target.value; update(); });
});

$$('[data-picker-mode]').forEach((button) => button.addEventListener('click', () => {
  $$('[data-picker-mode]').forEach((item) => item.classList.toggle('is-active', item === button));
  elements.field.hidden = button.dataset.pickerMode === 'sliders'; elements.rgbSliders.hidden = button.dataset.pickerMode !== 'sliders';
}));
$('#quantizeToggle').addEventListener('change', (event) => { state.quantize = event.target.checked; update(); });
$('#quantizeLevels').addEventListener('change', (event) => { state.levels = +event.target.value; update(); });
$('#randomButton').addEventListener('click', randomColor);
function randomColor() { state.rgb = C.hslToRgb({ h: Math.random() * 360, s: 48 + Math.random() * 44, l: 35 + Math.random() * 35 }); update(); }

function savePalette() { localStorage.setItem('color-tool-palette', JSON.stringify(state.palette)); renderPalette(); }
function addColor(hex = C.rgbToHex(shownRgb())) { const exists = state.palette.includes(hex); if (!exists) state.palette.push(hex); savePalette(); toast(exists ? 'Color already saved' : `${hex} added to palette`); }
$('#addButton').addEventListener('click', () => addColor());
function renderPalette() {
  elements.empty.hidden = state.palette.length > 0; elements.palette.hidden = !state.palette.length;
  elements.palette.innerHTML = state.palette.map((hex, index) => `<article class="palette-card"><button class="palette-swatch" style="background:${hex};color:${inkFor(C.hexToRgb(hex))}" data-use="${hex}" aria-label="Use ${hex}">Use color</button><div class="palette-card-info"><code>${hex}</code><button data-remove="${index}" aria-label="Remove ${hex}">Remove</button></div></article>`).join('');
}
elements.palette.addEventListener('click', (event) => {
  if (event.target.dataset.use) { state.rgb = C.hexToRgb(event.target.dataset.use); update(); $('[data-view="picker"]').click(); }
  if (event.target.dataset.remove !== undefined) { state.palette.splice(+event.target.dataset.remove, 1); savePalette(); }
});
$('#starterButton').addEventListener('click', () => { state.palette = ['#191918','#F5F4F0','#6D5DFB','#FF725E','#53C6A3']; savePalette(); });
$('#exportButton').addEventListener('click', () => {
  if (!state.palette.length) return toast('Add colors before exporting');
  const css = `:root {\n${state.palette.map((hex, i) => `  --color-${i + 1}: ${hex};`).join('\n')}\n}`; copy(css, 'CSS variables copied');
});

$$('[data-view]').forEach((button) => button.addEventListener('click', () => {
  $$('[data-view]').forEach((item) => item.classList.toggle('is-active', item === button));
  $$('.view').forEach((view) => view.classList.remove('is-active')); $(`#${button.dataset.view}View`).classList.add('is-active');
}));
$('#themeButton').addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('color-tool-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); });
if (localStorage.getItem('color-tool-theme') === 'dark') document.body.classList.add('dark');
document.addEventListener('keydown', (event) => {
  if (/input|select|textarea/i.test(event.target.tagName)) return;
  if (event.key.toLowerCase() === 'r') randomColor();
  if (event.key === 'Enter') addColor();
});

function extractColors(imageData, count) {
  const buckets = new Map(), pixels = imageData.data, sampleEvery = Math.max(1, Math.floor((imageData.width * imageData.height) / 60000));
  for (let i = 0; i < pixels.length; i += 4 * sampleEvery) {
    if (pixels[i + 3] < 128) continue;
    const r = pixels[i] >> 4, g = pixels[i + 1] >> 4, b = pixels[i + 2] >> 4, key = `${r},${g},${b}`;
    const entry = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0 };
    entry.r += pixels[i]; entry.g += pixels[i + 1]; entry.b += pixels[i + 2]; entry.count++; buckets.set(key, entry);
  }
  const total = [...buckets.values()].reduce((sum, item) => sum + item.count, 0);
  return [...buckets.values()].sort((a, b) => b.count - a.count).slice(0, count).map((item) => ({ rgb: { r: item.r / item.count, g: item.g / item.count, b: item.b / item.count }, share: item.count / total }));
}
function renderAnalysis() {
  const colors = extractColors(state.imageData, +$('#colorCount').value), max = colors[0]?.share || 1;
  elements.dominant.innerHTML = colors.map(({ rgb, share }) => { const hex = C.rgbToHex(rgb); return `<button class="dominant-row" data-color="${hex}" title="Use ${hex}"><i class="dominant-chip" style="background:${hex}"></i><code>${hex}</code><span class="bar" style="color:${hex}"><i style="width:${share / max * 100}%"></i></span><small>${(share * 100).toFixed(1)}%</small></button>`; }).join('');
}
function loadImage(file) {
  if (!file || !file.type.startsWith('image/')) return toast('Choose a valid image file');
  const url = URL.createObjectURL(file), img = new Image();
  img.onload = () => {
    const scale = Math.min(1, 800 / Math.max(img.naturalWidth, img.naturalHeight)), canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(img, 0, 0, canvas.width, canvas.height);
    state.imageData = context.getImageData(0, 0, canvas.width, canvas.height); $('#imagePreview').src = url;
    $('#imageMeta').textContent = `${img.naturalWidth} × ${img.naturalHeight} · ${file.name}`; elements.analysis.hidden = false; $('#dropzone').hidden = true; renderAnalysis();
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast('This image could not be opened'); }; img.src = url;
}
$('#imageInput').addEventListener('change', (event) => loadImage(event.target.files[0]));
['dragenter','dragover'].forEach((name) => $('#dropzone').addEventListener(name, (event) => { event.preventDefault(); $('#dropzone').classList.add('is-over'); }));
['dragleave','drop'].forEach((name) => $('#dropzone').addEventListener(name, (event) => { event.preventDefault(); $('#dropzone').classList.remove('is-over'); }));
$('#dropzone').addEventListener('drop', (event) => loadImage(event.dataTransfer.files[0]));
$('#colorCount').addEventListener('change', renderAnalysis);
elements.dominant.addEventListener('click', (event) => { const row = event.target.closest('[data-color]'); if (row) { state.rgb = C.hexToRgb(row.dataset.color); update(); addColor(row.dataset.color); } });

renderPalette(); update();
