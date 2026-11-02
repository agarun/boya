# boya

A color theme forked from [Night Owl](https://github.com/sdras/night-owl-vscode-theme),
recolored through OKLCH:

| Variant         | Colors                                        |
| --------------- | --------------------------------------------- |
| **boya Gray**   | More neutral background colors and saturation |
| **boya Purple** | Surfaces take on a purple cast and hue (~8°)  |
| **boya Candle** | Light surfaces are warmed to ~2000K           |

## Generating the themes

The three variants are derived from `boya/themes/boya-color-theme.json` and
`boya-light-color-theme.json` by `scripts/oklch-shift.js`. It runs each color
through sRGB → OKLCH, applies a per-variant shift, clamps back to the sRGB
gamut, and writes the result back as hex for the VS Code JSON format.

```bash
node scripts/oklch-shift.js          # all three variants
node scripts/oklch-shift.js purple   # just purple
```

Tweak the `VARIANTS` table at the top of the script to change the hue target,
chroma scale, or syntax nudge.

## Terminal colors

See [`schemes/README.md`](./schemes/README.md) for the matching terminal
schemes

## Previewing the variants

Open [`demo/boya-sample.md`](./demo/boya-sample.md) in VS Code after pressing
**F5** in this workspace (or after installing the extension) to see every
TextMate scope the themes target, side by side.

Switch between the variants
with `Cmd+K Cmd+T` → `boya Gray`, `boya Purple`, `boya Candle`

## Development

- Press `F5` to open a new window with your extension loaded.
- Open the color theme picker with the `File > Preferences > Theme > Color Theme` menu item, or use the `Preferences: Color Theme command (Ctrl+K Ctrl+T)` and pick your theme
- Open a file that has a language associated. The languages' configured grammar will tokenize the text and assign 'scopes' to the tokens. To examine these scopes, invoke the `Developer: Inspect Editor Tokens and Scopes` command from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).
- Changes to the theme file are automatically applied to the Extension Development Host window.

### Examples

```bash
# edit scripts/oklch-shift.js (or a source theme JSON), then:
node scripts/oklch-shift.js purple
# in the Extension Development Host window:
#   Cmd+Shift+P → "Developer: Reload Window"
```
