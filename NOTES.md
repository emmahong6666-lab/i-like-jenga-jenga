# I like jenga: jenga

## How to run it

From this folder, start a small local web server and open the address it prints. For example:

```text
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in a browser.

## Where it’s published

The project files are stored in the public GitHub repository:
https://github.com/emmahong6666-lab/i-like-jenga-jenga

The game is published from the `main` branch root at:
https://emmahong6666-lab.github.io/i-like-jenga-jenga/

## What’s done

- Built a cat tower with 18 cat blocks.
- Spaced cats so they do not overlap at the start.
- Added fixed support lines between the cat rows.
- Replaced emoji cats with small illustrated SVG cats.
- Added nudging: moving one cat into another can make the tower fall.
- Falling cats turn into particles only when they touch the bottom.
- Players can remove middle cats safely, while unsafe pulls topple the tower.
- Added a win state after 5 safe removals.
- Added a few made-up dare items for the next feature.
- Saved the sample items and stack settings in the browser with `localStorage`.
- Kept browser saving in `storage.js` so it can be swapped for a real database later.

Saves on this computer only for now

## What’s next

1. Show a dare card after a cat is pulled.
2. Publish the game so cousins can play from their own devices.
