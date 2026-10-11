# Local usability refinement — October 11, 2026

Not deployed. Preserves the handoff clay, wheel, materials, water, and firing workflow.

- Carving defaults to a shallower, wider local cut; filtered movement reduces touch jitter.
- Overlapping knife strokes retain the strongest cut instead of adding depths. Hand alterations remain independent. Large raycast jumps restart a segment.
- Carving width/depth/foot trim are behind an accessible Adjust cut disclosure.
- Wet clay is visually separate from Undo/Redo. Mobile tool hints are adjacent to tools; desktop hints sit beside the tool tray. Reset clay is less prominent.
- Sponge hint explains sustained smoothing. Continuous animation tests confirm a held sponge removes a local cut.

Passed: rib tests, interior stability, connected shaping, water/smoothing, and gentle carving unit checks. Local real-renderer checks at 320x667, 390x844, 487x1055, and 1280x900 cover 25 repeated vertical drags per clay amount, bounded cut depth, finite geometry, and held-sponge groove removal. Animation loop remains active. Tests are synthetic gesture scenarios, not physical-device or participant usability tests. Expanded/collapsed carving controls inspected on mobile; desktop appearance reviewed.

The opt-in browser fixture is saved in tests/gentle-browser-fixture.js and excluded from atelier.js. Existing cloud workflow test expectations were updated for optional settings and new cut dimensions; that full browser script was not rerun in this local pass.
