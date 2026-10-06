# Coordinate Trainer

This project has been split from the original single HTML file into:

- `index.html` - page structure and game markup
- `style.css` - all CSS styles
- `d3.bundle.js` - the bundled D3/geo code already present in the original file
- `app.js` - main Coordinate Trainer game logic
- `intro.js` - intro animation/sound screen

## Run locally

Open `index.html` in a browser, or preferably use VS Code Live Server.

## GitHub Pages

Upload all files to the same repository directory and make sure `index.html` is in the published root.

GitHub Pages:
Settings -> Pages -> Deploy from a branch -> `main` -> `/ (root)`.

Keep all five files together. The game also contains its map data inside `index.html`, so do not remove the two `application/json` data blocks.
