# Virtual Clay Studio — Project Instructions

## Creative direction

Virtual Clay Studio is a small, handmade digital pottery wheel. It should feel tactile, quiet, slightly imperfect, and inviting—not like a productivity tool or a drawing app.

The main delight is simple: a visitor presses a few controls and makes a tiny, wonky clay vessel.

## Working principles

- Preserve the studio's restrained, warm visual world.
- Mobile is a first-class experience. Test narrow, standard, and large phone widths plus desktop.
- Use semantic controls, visible focus styles, readable text, 44px minimum touch targets, and reduced-motion support.
- Avoid dependencies, external assets, frameworks, and backend services unless a future feature genuinely needs one.
- Keep interaction obvious within two seconds. Whimsy must not make the studio confusing.
- Explain important new coding concepts briefly: Salene is learning by making this.
- Inspect before changing, make the smallest clean change, test, and summarize.

## Current scope

The first version is a real-time WebGL pottery-wheel proof of concept. `atelier.js` keeps the vessel as a persistent radial profile: a short vertical list of ring heights and radii. The visible Three.js mesh is rebuilt from that profile, so direct hand-like gestures remain when the wheel spins or the form changes.

The wheel has a separate smooth rotation state and begins turning without an instruction or mode choice. Dragging directly on the clay interprets outward/inward movement as width and upward/downward movement as height. One-gesture Undo/Redo history, New Clay, Fire It, semantic controls, keyboard arrow shaping, and the touch-safe stage remain. The camera stays in its composed viewpoint. It does not save creations, use accounts, use audio, or require a backend.

`atelier.js` loads a fixed Three.js module from jsDelivr. Keep the scene small, preserve the mobile ring/segment reduction, and build future clay features on the radial-profile state rather than replacing it with a heavier framework.

`assets/atelier-background-reggio.png` is the active original cinematic set extension behind the interactive foreground. It establishes the room as a luminous Reggio-inspired atelier: material inquiry, process traces, natural daylight, and thoughtful organization—not a fantasy workshop, dark medieval studio, or generic luxury showroom. Preserve the intimate arm's-length camera composition: it is intentionally a single-view atelier rather than an explorable room. Do not replace it with third-party game imagery or generic decorative assets.
