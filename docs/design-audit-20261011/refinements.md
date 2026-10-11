# Local refinements following the design audit

- Fresh clay returns to Hands and Slip, restores size choices, clears history, and resets stale glaze instructions.
- Hands explicitly describes the center-down opening gesture.
- Mobile action, tool, recovery, material and glaze labels use 11px text. Narrow action labels wrap within the existing 44px targets. Undo/Redo spacing accommodates a wrapped hint.
- Removed the six-piece retention cap from loading, saving and gallery display. Background shelves still show a limited number of recent pieces; the collection below keeps all saved pieces.
- A failed storage write preserves the existing stored collection, exposes the new piece in the downloadable session gallery, and displays a warning. A later successful write includes pending pieces. Browser storage remains finite; the interface no longer promises persistence when a write fails.

## Verification

Browser fixture tested full firing, paint Undo/Redo, exact canonical color preservation, one save, return to Hands after Water, clean histories and restored size chooser at 320, 390, 487 and 1280 CSS-pixel widths. Narrow label measurements showed no horizontal overflow; 320 action text wraps while retaining one control row. Saved standard-mobile and desktop screenshots. Physical devices and hardware performance remain untested.

Function suites passed: rib pressure, cavity stability, water/smoothing, connected shaping, gentle carving, glaze finish, and new shelf-saving regressions. Shelf test covers seven-plus pieces, updating the same re-glazed piece, quota failure without stored data loss, session download availability, and later recovery.

The initial browser loop encountered a real quota limit in the existing QA storage and correctly showed the warning. The fixture was then isolated by temporarily clearing only the QA collection and restoring it afterward. It never edited the production storage key. Temporary fixture removed from atelier.js before checkpoint.

Local only. No deployment.
