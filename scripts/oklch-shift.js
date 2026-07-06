#!/usr/bin/env node
// scripts/oklch-shift.js
// Reads a VS Code theme JSON and writes recolored variants
// by shifting hex colors through OKLCH.
//
// Modes:
//   gray    - editor chrome shifts to a configurable dark base (default 090c10)
//             and its near-shades; syntax colors are kept identical to Night
//             Owl by default (vibrancy can be raised with --vibrancy).
//   purple  - editor chrome shifts to a purple-cast base, slightly darker than
//             the gray base (--darken drops L), syntax colors are pushed much
//             more vibrant (--vibrancy).
//   candle  - light-only warm tint, ~2000K. Derives a warm cream surface
//             palette from a user-supplied bg (default oklch ~0.93 0.05 70)
//             and only touches syntax colors lightly so the warmth reads as
//             a glow rather than a recolor.
//
// Usage:
//   node scripts/oklch-shift.js                 # all variants
//   node scripts/oklch-shift.js gray            # just gray
//   node scripts/oklch-shift.js gray --bg 0a0d12 --vibrancy 1.0
//   node scripts/oklch-shift.js purple --vibrancy 1.6 --darken 0.02
//   node scripts/oklch-shift.js candle --bg '#f4e6c8' --warmth 0.5
//
// CLI flags (apply to every variant unless you only pass one mode):
//   --bg <hex>        Override the dark base color for editor surfaces.
//                     Default: 090c10. Used by gray; purple derives
//                     its base from this shifted toward purple. For candle
//                     this is the editor surface tone (warm cream).
//   --vibrancy <n>    Multiplier on syntax chroma. 1.0 = unchanged,
//                     >1 = punchier, <1 = muddier. Default: gray=1.0,
//                     purple=1.6, candle=0.85.
//   --darken <n>      OKLCH L subtraction for the purple base (0..0.1).
//                     Default: 0.02.
//   --warmth <n>      Chroma scale for candle's surface palette (0..1).
//                     Higher = more saturated orange tint. Default: 0.5.
//
// The original theme files (Night Owl dark/light) are NOT modified. Outputs
// land in boya/themes/ and schemes/ next to them.

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const THEME_DIR = path.join(REPO, 'boya', 'themes');
const SCHEME_DIR = path.join(REPO, 'schemes');

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

// Reference: https://bottosson.github.io/posts/oklab/

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  if (h.length === 8) h = h.slice(0, 6);
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function rgbToHex(r, g, b) {
  const toHex = (v) =>
    Math.max(0, Math.min(255, Math.round(v * 255)))
      .toString(16)
      .padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function oklchToHex({ L, C, H }) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  let lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  lr = Math.max(0, Math.min(1, linearToSrgb(lr)));
  lg = Math.max(0, Math.min(1, linearToSrgb(lg)));
  lb = Math.max(0, Math.min(1, linearToSrgb(lb)));
  return rgbToHex(lr, lg, lb);
}

function hexToOklch(hex) {
  const [r, g, b] = hexToRgb(hex);
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

function oklchToHex({ L, C, H }) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  let lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  lr = Math.max(0, Math.min(1, linearToSrgb(lr)));
  lg = Math.max(0, Math.min(1, linearToSrgb(lg)));
  lb = Math.max(0, Math.min(1, linearToSrgb(lb)));
  return rgbToHex(lr, lg, lb);
}

// Gamut clamping: reduce chroma until the color lands inside sRGB.

function maxChromaInGamut(L, H) {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const hex = oklchToHex({ L, C: mid, H });
    const [r, g, b] = hexToRgb(hex);
    if (r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return lo;
}

function shiftOklch(o, targetH, chromaScale) {
  const L = o.L;
  const C = o.C;
  const H = o.H;
  const next = Math.min(C * chromaScale, maxChromaInGamut(L, targetH));
  return oklchToHex({ L, C: next, H: targetH });
}

function withL(o, deltaL) {
  return { L: Math.max(0, Math.min(1, o.L + deltaL)), C: o.C, H: o.H };
}

// Color classification. Decide what kind of color this hex represents based
// on the JSON key it lives under.

const SURFACE_KEY_RE =
  /background|border|shadow|fill|selection|Highlight|highlight|cursor|whitespace|lineHighlight/i;

// Keys whose values are pure background (we recolor them aggressively).
const AGGRESSIVE_KEYS = new Set([
  'editor.background',
  'editorGutter.background',
  'sideBar.background',
  'activityBar.background',
  'statusBar.background',
  'statusBar.debuggingBackground',
  'statusBar.noFolderBackground',
  'titleBar.activeBackground',
  'titleBar.inactiveBackground',
  'panel.background',
  'editorGroup.emptyBackground',
  'editorGroupHeader.noTabsBackground',
  'editorGroupHeader.tabsBackground',
  'tab.activeBackground',
  'tab.inactiveBackground',
  'notifications.background',
  'editorWidget.background',
  'editorSuggestWidget.background',
  'editorHoverWidget.background',
  'debugExceptionWidget.background',
  'peekViewEditor.background',
  'peekViewResult.background',
  'peekViewTitle.background',
  'breadcrumbPicker.background',
  'editorMarkerNavigation.background',
  'debugToolBar.background',
  'welcomePage.buttonBackground',
  'welcomePage.buttonHoverBackground',
  'walkThrough.embeddedEditorBackground',
  'list.dropBackground',
  'list.focusBackground',
  'list.hoverBackground',
]);

// Keys where we leave Night Owl's exact chroma alone (color identity matters
// for these UI affordances).

const ACCENT_KEYS = new Set([
  'button.background',
  'button.hoverBackground',
  'progress.background',
  'editorOverviewRuler.currentContentForeground',
  'editorOverviewRuler.incomingContentForeground',
  'editorOverviewRuler.commonContentForeground',
  'extensionButton.prominentBackground',
  'extensionButton.prominentHoverBackground',
  'badge.background',
  'pickerGroup.foreground',
  'breadcrumb.foreground',
  'breadcrumb.focusForeground',
]);

function classify(key) {
  if (AGGRESSIVE_KEYS.has(key)) return 'surface-aggressive';
  if (ACCENT_KEYS.has(key)) return 'accent';
  if (SURFACE_KEY_RE.test(key)) return 'surface';
  return 'syntax';
}

// Variant definitions (can be overridden on the CLI)

const DEFAULT_BG = '#090c10';
const DEFAULT_CANDLE_BG = '#f3e4c4';
const DEFAULT_VIBRANCY = { gray: 1.0, purple: 1.6, candle: 0.85 };
const DEFAULT_DARKEN = { gray: 0, purple: 0.02, candle: 0 };
const DEFAULT_WARMTH = { candle: 0.5 };
const DEFAULT_CANDLE_HUE = 70; // warm cream axis (orange-yellow)

// Leave light-theme keys untouched when running a dark variant, and vice versa

function variantFor(name, opts) {
  const bg = opts.bg || (name === 'candle' ? DEFAULT_CANDLE_BG : DEFAULT_BG);
  const vibrancy =
    opts.vibrancy != null ? parseFloat(opts.vibrancy) : DEFAULT_VIBRANCY[name];
  const darken =
    opts.darken != null ? parseFloat(opts.darken) : DEFAULT_DARKEN[name];
  const warmth =
    opts.warmth != null ? parseFloat(opts.warmth) : DEFAULT_WARMTH[name];
  return { bg, vibrancy, darken, warmth };
}

// Surface palette generation. From one input bg we derive the small set of
// "near-black" shades Night Owl splits into (editor / sidebar / tabs /
// inactive title bar / hover). For gray variants we keep the user's hue
// (since 090c10 is already near-neutral); for purple we shift the hue
// toward the variant hue so the chrome takes on a cast. The ladder is built
// from OKLCH L offsets so the relative layering (elevated tab, sunken
// inactive, etc.) is preserved.

function deriveSurfacePalette(bgHex, hue, darkenL, rotateHue) {
  const source = hexToOklch(bgHex);
  source.L = Math.max(0, Math.min(1, source.L + darkenL));
  const baseHue = rotateHue ? hue : source.H;
  // Keep the source's own chroma but trim slightly so the ladder stays
  // inside gamut and feels uniform.
  const baseHex = shiftOklch(source, baseHue, 0.6);
  const base = hexToOklch(baseHex);
  // Each surface gets an L offset from the base. Offsets chosen to mirror
  // Night Owl's relative ladder (#011627 -> tabs/inactive/etc.).
  const offsets = {
    base: 0, // editor.background and friends
    elevated: 0.025, // tab.activeBackground, editorMarkerNavigation
    sunken: -0.015, // tab.inactiveBackground, titleBar.inactive
    chrome: -0.005, // panel/sidebar/activityBar (almost base)
    hover: 0.012, // list.hoverBackground
  };
  const out = {};
  for (const [k, dL] of Object.entries(offsets)) {
    const stepped = withL(base, dL);
    out[k] = shiftOklch(stepped, base.H, 0.6);
  }
  return out;
}

// Candle-specific palette: warm cream ladder from a single user bg. Each
// rung is the source chroma scaled by `warmth` (0 = neutral cream,
// 1 = strongly amber). Hue stays on the warm axis (~70) so backgrounds,
// sidebars, and panels all pick up the same glow.

function deriveCandlePalette(bgHex, warmth) {
  const source = hexToOklch(bgHex);
  const baseHue =
    source.H > 0 && source.H < 120 ? source.H : DEFAULT_CANDLE_HUE;
  // Anchor on a sensible chroma for the warm axis at the user's chosen L.
  // Adding warmth bumps chroma and slightly drops L so the bg reads as a
  // warmer cream without going neon.
  const baseChroma = 0.03 + 0.04 * warmth;
  const baseL = Math.max(0.85, Math.min(0.97, source.L - 0.005 * warmth));
  const make = (dL, chromaScale) => {
    const ok = {
      L: Math.max(0, Math.min(1, baseL + dL)),
      C: baseChroma * chromaScale,
      H: baseHue,
    };
    return oklchToHex({
      L: ok.L,
      C: Math.min(ok.C, maxChromaInGamut(ok.L, ok.H)),
      H: ok.H,
    });
  };
  return {
    base: make(0, 1),
    elevated: make(0.018, 1.05),
    sunken: make(-0.012, 1.05),
    chrome: make(-0.006, 1),
    hover: make(0.01, 0.9),
  };
}

// Apply a theme. The pipeline for every hex:
//   1. classify by JSON key
//   2. surface-aggressive -> pin to the derived palette base/elevated/sunken
//   3. surface             -> very low chroma shift toward bg hue
//   4. accent              -> keep identity but tighten chroma slightly
//   5. syntax              -> apply vibrancy multiplier (chromas boosted or
//                             trimmed), hue optionally nudged

function applyToHex(hex, key, ctx) {
  if (!/^#[0-9a-fA-F]{3,8}$/.test(hex)) return hex;
  if (/^#0000$/i.test(hex)) return hex;
  const { rgb, alpha } = (() => {
    if (/^#[0-9a-fA-F]{8}$/.test(hex)) {
      return { rgb: hex.slice(0, 7), alpha: hex.slice(7, 9) };
    }
    return { rgb: hex, alpha: null };
  })();
  const {
    variant,
    palette,
    hue,
    vibrancy,
    syntaxHueShift,
    darken,
    warmth,
  } = ctx;
  const kind = classify(key);
  const ok = hexToOklch(rgb);

  let out;
  if (kind === 'surface-aggressive') {
    // Pin to a shade from the derived palette based on which surface key.
    const slot = pickSurfaceSlot(key, palette);
    out = slot;
  } else if (kind === 'surface') {
    if (variant === 'candle') {
      // Push generic surfaces onto the warm axis so borders / shadows /
      // scrollbars pick up the cream tint too.
      out = shiftOklch(ok, hue, Math.max(0.05, warmth * 0.2));
    } else {
      out = shiftOklch(ok, hue, 0.1);
    }
  } else if (kind === 'accent') {
    // Preserve identity but tighten/loosen chroma.
    if (variant === 'candle') {
      // Warm-tint the accents toward amber so buttons/badges feel cohesive.
      out = shiftOklch(ok, hue, vibrancy);
    } else {
      out = shiftOklch(ok, ok.H, 0.9);
    }
  } else {
    // syntax: apply vibrancy multiplier to chroma, optionally shift hue.
    const targetH = ok.H + syntaxHueShift;
    if (variant === 'candle') {
      // Candle keeps syntax identity but pulls it slightly toward the warm
      // axis so colored tokens don't fight the cream background.
      out = shiftOklch(ok, ok.H, vibrancy);
    } else {
      out = shiftOklch(ok, targetH, vibrancy);
    }
  }

  return alpha ? out + alpha : out;
}

function pickSurfaceSlot(key, palette) {
  // Most surfaces get the base color; tabs and a few panels get a lifted or
  // sunken variant so the UI feels layered.
  if (key === 'tab.activeBackground') return palette.elevated;
  if (key === 'tab.inactiveBackground') return palette.sunken;
  if (key === 'titleBar.inactiveBackground') return palette.sunken;
  if (key === 'editorMarkerNavigation.background') return palette.elevated;
  if (key === 'list.hoverBackground') return palette.hover;
  return palette.base;
}

// Walk a theme JSON and rewrite every hex value, preserving alpha

function rewriteTheme(theme, ctx) {
  const out = JSON.parse(JSON.stringify(theme));
  for (const [key, value] of Object.entries(out.colors)) {
    out.colors[key] = applyToHex(value, key, ctx);
  }
  for (const entry of out.tokenColors || []) {
    if (!entry.settings) continue;
    if (typeof entry.settings.foreground === 'string') {
      entry.settings.foreground = applyToHex(
        entry.settings.foreground,
        entry.name || '',
        ctx,
      );
    }
    if (typeof entry.settings.background === 'string') {
      entry.settings.background = applyToHex(
        entry.settings.background,
        entry.name || '',
        ctx,
      );
    }
  }
  return out;
}

// Terminal scheme generation

function extractTerminalColors(theme) {
  const c = theme.colors;
  const pick = (k, fallback) => (c[k] != null ? c[k] : fallback);
  const ansi = (name) =>
    pick(`terminal.ansi${name}`, pick(`terminal.ansiBright${name}`, '#ffffff'));
  return {
    name: theme.name,
    background: pick('terminal.background', c['editor.background']),
    foreground: pick('terminal.foreground', c['editor.foreground']),
    cursorColor: pick(
      'terminalCursor.foreground',
      c['editorCursor.foreground'],
    ),
    selectionBackground: pick(
      'terminal.selectionBackground',
      c['editor.selectionBackground'],
    ),
    black: ansi('Black'),
    red: ansi('Red'),
    green: ansi('Green'),
    yellow: ansi('Yellow'),
    blue: ansi('Blue'),
    purple: ansi('Magenta'),
    cyan: ansi('Cyan'),
    white: ansi('White'),
    brightBlack: pick('terminal.ansiBrightBlack', ansi('Black')),
    brightRed: pick('terminal.ansiBrightRed', ansi('Red')),
    brightGreen: pick('terminal.ansiBrightGreen', ansi('Green')),
    brightYellow: pick('terminal.ansiBrightYellow', ansi('Yellow')),
    brightBlue: pick('terminal.ansiBrightBlue', ansi('Blue')),
    brightPurple: pick('terminal.ansiBrightMagenta', ansi('Magenta')),
    brightCyan: pick('terminal.ansiBrightCyan', ansi('Cyan')),
    brightWhite: pick('terminal.ansiBrightWhite', ansi('White')),
  };
}

function writeScheme(variantKey, themeKey, scheme) {
  fs.mkdirSync(SCHEME_DIR, { recursive: true });
  const outPath = path.join(SCHEME_DIR, `boya-${variantKey}-${themeKey}.json`);
  fs.writeFileSync(outPath, JSON.stringify(scheme, null, 2) + '\n');
  console.log('wrote', path.relative(REPO, outPath));
}

function loadTheme(name) {
  // `name` is either "color" or "light-color".
  const fileName =
    name === 'light-color'
      ? 'boya-light-color-theme.json'
      : 'boya-color-theme.json';
  const file = path.join(THEME_DIR, fileName);
  const raw = fs.readFileSync(file, 'utf8');
  const stripped = raw
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const json = JSON.parse(stripped);
  return { file, json };
}

function themeDisplayName(variantKey, themeKey) {
  const pretty = {
    gray: 'Gray',
    purple: 'Purple',
    candle: 'Candle',
  }[variantKey];
  const base = themeKey === 'light-color' ? 'Light' : '';
  return `boya ${pretty}${base ? ' ' + base : ''}`.trim();
}

const VARIANT_HUES = {
  gray: 270, // neutral axis
  purple: 300,
  candle: DEFAULT_CANDLE_HUE,
};

const VARIANT_SYNTAX_HUE_SHIFT = {
  gray: 0,
  purple: -8,
  candle: 0,
};

const VARIANT_THEME_KEYS = {
  gray: ['color', 'light-color'],
  purple: ['color', 'light-color'],
  candle: ['light-color'],
};

function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const opts = {
    bg: flags.bg || DEFAULT_BG,
    vibrancy: flags.vibrancy,
    darken: flags.darken,
    warmth: flags.warmth,
  };
  const variants = positional.length ? positional : Object.keys(VARIANT_HUES);
  const defaultThemes = ['color', 'light-color'];

  for (const variantKey of variants) {
    if (!(variantKey in VARIANT_HUES)) {
      console.error(`unknown variant: ${variantKey}`);
      process.exit(1);
    }
    const cfg = variantFor(variantKey, opts);
    const hue = VARIANT_HUES[variantKey];
    const syntaxHueShift = VARIANT_SYNTAX_HUE_SHIFT[variantKey];
    // For gray we keep the bg's own hue (the user-supplied 090c10
    // already leans neutral). For purple we rotate the bg hue toward purple
    // so the chrome picks up a cast. For candle we use a dedicated warm
    // palette derived from the user bg.
    const palette =
      variantKey === 'candle'
        ? deriveCandlePalette(cfg.bg, cfg.warmth)
        : deriveSurfacePalette(
            cfg.bg,
            hue,
            cfg.darken,
            variantKey === 'purple',
          );
    const ctx = {
      variant: variantKey,
      palette,
      hue,
      vibrancy: cfg.vibrancy,
      syntaxHueShift,
      darken: cfg.darken,
      warmth: cfg.warmth,
    };

    const themes = VARIANT_THEME_KEYS[variantKey] || defaultThemes;
    for (const themeKey of themes) {
      const { file, json } = loadTheme(themeKey);
      const out = rewriteTheme(json, ctx);
      out.name = themeDisplayName(variantKey, themeKey);
      const themeSlug = themeKey === 'light-color' ? 'light' : 'dark';
      const outFile = path.join(
        THEME_DIR,
        `boya-${variantKey}-${themeSlug}-color-theme.json`,
      );
      // Light variants reuse Night Owl Light's own light bg/surface colors;
      // the only thing the shift should change is syntax colors. Candle
      // overrides this with its own warm palette, so it skips the restore.
      if (themeKey === 'light-color' && variantKey !== 'candle') {
        for (const key of [
          'editor.background',
          'sideBar.background',
          'activityBar.background',
          'panel.background',
          'statusBar.background',
          'titleBar.activeBackground',
          'titleBar.inactiveBackground',
          'tab.activeBackground',
          'tab.inactiveBackground',
          'editorGroupHeader.tabsBackground',
          'editorGroupHeader.noTabsBackground',
          'editorGutter.background',
          'editorWidget.background',
          'editorSuggestWidget.background',
          'editorHoverWidget.background',
          'debugExceptionWidget.background',
          'peekViewEditor.background',
          'peekViewResult.background',
          'peekViewTitle.background',
          'breadcrumbPicker.background',
          'debugToolBar.background',
          'welcomePage.buttonBackground',
          'welcomePage.buttonHoverBackground',
          'walkThrough.embeddedEditorBackground',
          'notifications.background',
        ]) {
          if (json.colors[key] != null) out.colors[key] = json.colors[key];
        }
      }
      fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
      console.log(
        'wrote',
        path.relative(REPO, outFile),
        '(mode=' + variantKey + ')',
      );

      const scheme = extractTerminalColors(out);
      writeScheme(variantKey, themeSlug, {
        name: `${scheme.name} (Windows Terminal)`,
        ...stripName(scheme),
      });
    }
  }
}

function stripName(obj) {
  const { name, ...rest } = obj;
  return rest;
}

main();
