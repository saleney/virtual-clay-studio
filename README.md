# Virtual Clay Studio

A tiny, tactile three-dimensional clay sculpture.

## Mobile app

This repository includes native iOS and Android projects powered by Capacitor. The app keeps the existing WebGL studio intact and bundles Three.js locally, so the pottery wheel itself works without a network connection.

Run `npm install`, then `npm run native:sync`. Open the native project with `npm run ios` or `npm run android`. Building an iPhone release requires macOS with Xcode; building an Android release requires Android Studio and a current supported Java installation.

## Preview locally

Open this folder in Codex, start a simple local preview, and visit the address it gives you. No installation is required: this is plain HTML, CSS, and JavaScript.

## How it works

`index.html` contains the atelier shell and `atelier.js` contains the interaction. It loads Three.js and keeps the clay as a vertical radial profile: a list of ring heights and radii. The `state` object remembers the active tool, material, wheel speed, camera, profile history, and whether the piece has been fired. Each wheel-throwing gesture changes nearby profile rings with a soft falloff, rebuilds the visible mesh, and stores one undo snapshot.

The wheel rotates separately from the profile and starts turning as the atelier opens, so it never resets the vessel. Touch and guide the clay directly: outward/inward movement changes width and upward/downward movement changes height. With the clay focused, arrow keys shape the middle ring for keyboard access. Future versions can add a hollow interior, controlled asymmetry, tool marks, glaze choices, saved creations, or a gallery without changing the basic page structure.

## Visual asset

`assets/atelier-background-reggio.png` is the active original generated background plate: a luminous Reggio-inspired atelier with material investigations, natural objects, process traces, and daylight. It was created for this project with OpenAI image generation; it is not a third-party game asset, photograph, or stock image. `assets/atelier-background.png` remains as the earlier unused dark concept. The wheel, clay, lighting, interaction, and glaze remain rendered in the browser.
