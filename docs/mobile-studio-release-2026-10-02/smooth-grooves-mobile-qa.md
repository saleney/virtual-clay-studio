# Smooth diagonal grooves: mobile QA

The render mesh now has intermediate height rings and 50% more angular samples. Shaping still uses the original 42 mobile/56 desktop control rings and unchanged clay amounts. Fixed wheel framing and the interface are preserved.

Each knife pass has a shared stroke identity. Overlapping samples within that pass retain one depth rather than accumulating deeper dents where pointer samples bunch together. Separate passes can still deepen a cut. Surface detail is cached, and position buffers are reused between mesh updates. The outer wall and rim meet with matching positions, color, and normals, reducing the hard lighting transition around an opening.

## Verification

- Mobile UI: select 15 lb; open and widen the interior; carve diagonally; return to Hands; fire and automatically enter glazing. No console errors. No saved ceramics changed.
- Desktop and mobile rendering checks used matching synthetic groove paths; before/after screenshots saved. Actual opened/carved mobile clay screenshot saved separately.
- Final synthetic mobile-viewport test, 600 marks: median complete shaping update 13.1 ms Hands, 13.3 ms Sponge, 13.4 ms Rib, across 12 updates each. Maximum 35.5/13.8/17.6 ms respectively. Browser measurements on the desktop host, not a physical iPhone FPS measurement.
- Temporary test fixtures/instrumentation removed before release. Production build and whitespace check passed.

Water/splash wetness remains a proposed feature, not part of this release.
