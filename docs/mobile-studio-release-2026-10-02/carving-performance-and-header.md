# Carving performance and clear workspace

The large studio heading is visually hidden, retaining its accessible heading. Navigation and the process indicator remain over a transparent background. Clay size selection tucks away until Reset/New clay, and large clay has adaptive framing.

## Groove performance verification

Angular groove weights are shared between height rings. A bounded height cache is retained between shaping updates, and refreshed whenever the groove data changes. Camera fitting skips unchanged profiles.

Temporary local instrumentation measured complete mesh updates after radial Hands shaping, Sponge and Rib smoothing. It was removed before release. In the mobile viewport:

| Carved marks | Hands median | Sponge median | Rib median |
| --- | --- | --- | --- |
| 0 | 9.1 ms | 9.0 ms | 8.4 ms |
| 120 | 8.7 ms | 8.3 ms | 7.8 ms |
| 600 | 8.5 ms | 8.2 ms | 9.4 ms |

Twelve updates per tool and case. Maximum observed update in the 600-mark group was 29.5 ms, including initial cache preparation. These are browser mesh-update timings, not physical-phone frame-rate measurements. This replaces the earlier isolated calculation benchmark with a full shaping check.

Also checked diagonal knife drags followed by Hands and Sponge drags through the browser UI. Saved ceramics were not modified. Build and whitespace checks pass.
