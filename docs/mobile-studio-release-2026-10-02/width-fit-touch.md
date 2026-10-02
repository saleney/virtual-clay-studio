# Width fit and touch correction — local preview

Restored the SVG floor on desktop and mobile for depth. Mobile camera framing calculates the stationary pan projection and fits it to 96% of the viewport width, adapting to screen aspect ratio.

The contact marker now uses its containing work-surface coordinates, including displayed scaling. Pointer shaping prevents default selection and does not focus the canvas; keyboard focus remains available through Tab. The studio disables text selection and touch callouts.

QA: local phone preview showed the pan fitting the screen width. A drag ending at (195,375) produced a marker centered at approximately (195,375.1), no selected page text, and BODY focus. Build and whitespace checks passed. Changes remain local.
