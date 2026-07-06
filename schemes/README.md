# boya Windows Terminal schemes

The `*.json` files in this directory are Windows Terminal color schemes —
each one mirrors one of the VS Code variants in [`boya/themes/`](../boya/themes).

| File | Matches |
| --- | --- |
| `boya-gray-dark.json` | boya Gray |
| `boya-gray-light.json` | boya Gray Light |
| `boya-purple-dark.json` | boya Purple |
| `boya-purple-light.json` | boya Purple Light |
| `boya-candle-light.json` | boya Candle Light |

## Installing

1. Open Windows Terminal and press `Ctrl+,` to open `settings.json`.
2. Paste the contents of any scheme file into your existing `schemes` array,
   or drop the file's contents directly into `schemes`.

   ```json
   {
     "schemes": [
       {
         "name": "boya Purple",
         "background": "#16121e",
         "foreground": "#d5dfe9",
         "cursorColor": "#a39ab4",
         "selectionBackground": "#927cbc4d",
         "black": "#001724",
         "red": "#e65b69",
         "green": "#67d462",
         "yellow": "#d3df7b",
         "blue": "#7aaef6",
         "purple": "#bb98eb",
         "cyan": "#50c49d",
         "white": "#ffffff",
         "brightBlack": "#575656",
         "brightRed": "#e65b69",
         "brightGreen": "#67d462",
         "brightYellow": "#ffe89e",
         "brightBlue": "#7aaef6",
         "brightPurple": "#bb98eb",
         "brightCyan": "#8dd9c2",
         "brightWhite": "#ffffff"
       }
     ]
   }
   ```

3. Reference the scheme by name from a profile:

   ```json
   {
     "profiles": [
       {
         "name": "PowerShell",
         "colorScheme": "boya Purple"
       }
     ]
   }
   ```

## Regenerating

Schemes are emitted automatically by `scripts/oklch-shift.js` whenever the
VS Code theme JSONs are rebuilt, so the terminal colors always stay in sync
with the editor palette.
