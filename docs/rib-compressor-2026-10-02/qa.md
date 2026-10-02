# Rib compressor — October 2, 2026

The rib again settles height with a downward outside drag and compresses width with an inward drag. It can press into the center to open the clay, deepen the inner floor, and widen the opening. Holding it against the outside still gradually smooths carved grooves. Inside gestures do not concurrently smooth or reshape the outside.

Preserved: fixed wheel/pan geometry, existing clay material, water finish, bounded profiles, cavity reconciliation, tool-change cleanup, and fire-to-glaze transition.

Validation: actual-function tests for 5/10/15 lb compression, opening, widening, finite geometry, attached inner rim, and no upward stretching; water and held-smoothing regression tests; browser interaction audit with real Three.js geometry and renderer at desktop and narrow/standard/large mobile layouts. Each browser audit includes 101 assertions, including rapid reversed drags, competing touches, pointer cancellation, stationary groove removal, water, firing, and PNG rendering. Synthetic gestures exercise shipped handlers; this is browser QA, not physical iPhone/iPad testing. Audit fixture is excluded from deployed assets.
