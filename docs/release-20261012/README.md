# Virtual Clay Studio — October 12, 2026 release

Approved for publication by Salene on October 12. Previous production: c3cf7eef0008a05404fe679f617455867df161c9. Feature checkpoint: a389fcf.

## Changes
- Gentler bounded carving; directional Rib pressure with stable geometry.
- Clear two-fire flow: recognizable matte glaze before final firing, glossy afterward. Removed Trim foot and duplicate New clay actions.
- Stronger continuous glaze strokes, fine brush, undoable Coat whole piece, unglazed underside.
- Optional Cloud, Pooling, Breaking, Speckles, Layered edges and Controlled runs in one compact effects panel. Mottling removed after feedback about its white overlay; Cloud softened and runs feathered.
- Hands at the base changes the footprint while the wheel/pan and contact height stay fixed. Sustained Sponge contact reduces broad ridges.
- IndexedDB PNG shelf with legacy localStorage migration/fallback, concurrent-write merge and truthful failure status.

## Verification
Eight Node suites passed: glaze-finish, glaze-coverage, connected-clay, interior-stability, water-and-smoothing, rib, gentle-carving, shelf-saving. Web/native-assets bundle built; native apps not executed.
Final browser fixture passed desktop and mobile-layout width 487 CSS px: opaque coat, fine strokes, exact paint Undo/Redo, unchanged glaze geometry, phase guards, both firings and saved PNG readback. No desktop shader errors reported. Earlier mobile viewport checks include 320 and 390 CSS px. These are browser checks, not physical-device or sustained performance certification.

## Limits and remaining work
Effects approximate glaze appearance rather than chemistry or thickness. Effect toggles are reversible settings, outside paint Undo history. Inside/outside share paint UVs. Saved pieces are PNGs, not editable meshes. Handles and predictable moon-jar forming remain future work. Native iPhone/iPad performance still needs real-device testing.

## Evidence
before-desktop.png is production before release; after-desktop.png is local release. qa-mobile.png includes the automated report. Earlier making attempts and finish iterations are preserved in ../three-piece-attempts-20261011/ and ../glazing-coverage-20261011/; some earlier images show effects later removed and are historical, not final promises.
