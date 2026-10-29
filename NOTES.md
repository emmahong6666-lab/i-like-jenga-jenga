# I like jenga: jenga

## How to run it

From this folder, start a small local web server and open the address it prints. For example:

```text
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in a browser.

## Where it’s published

The project files are stored in the private GitHub repository:
https://github.com/emmahong6666-lab/i-like-jenga-jenga

The game itself still runs locally on this computer; it is not deployed as a public website yet.

## What’s done

- Built the first wooden Jenga block stack.
- Added a few made-up dare items for the next feature.
- Saved the sample items and stack settings in the browser with `localStorage`.
- Kept browser saving in `storage.js` so it can be swapped for a real database later.

Saves on this computer only for now

## What’s next

1. Let players tap a block to slide it out.
2. Show a dare card after a block is pulled.
3. Publish the game so cousins can play from their own devices.
