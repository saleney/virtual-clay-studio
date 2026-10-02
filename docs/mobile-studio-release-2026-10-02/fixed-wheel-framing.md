# Fixed wheel and splash pan framing

Tool gestures no longer trigger adaptive camera fitting. Fresh clay and viewport resizing still fit the scene once. The wheel and splash pan therefore keep their screen silhouette while the clay is shaped.

Verification: temporary local instrumentation sampled eight stationary pan perimeter points before and after 80 height/radius shaping updates. Maximum projected-coordinate change was exactly zero in desktop and mobile layouts. Instrumentation was removed before release. Production build and whitespace check passed.
