# Coordinate Trainer - Modular Version

The uploaded Coordinate Trainer has been converted from one HTML file into a maintainable module structure while preserving its existing map, data, game logic, Party mode, intro animation, and styling.

## Structure
- `index.html` - HTML structure
- `style.css` - styles
- `main.js` - entry point
- `modules/game.js` - main map, Play, Explore, Lines, Grid, Learn, Notepad and Party logic
- `modules/audio.js` - sound effects and sound state
- `modules/intro.js` - landing/intro animation
- `modules/data.js` - geographic dataset
- `modules/d3.bundle.js` - embedded D3 geographic library

## Run
Use VS Code Live Server or another static web server. ES modules should be served over HTTP rather than opened directly with `file://`.

## GitHub Pages
Keep `index.html` in the repository root and upload the complete folder structure.
