# October 14 studio release

Approved for deployment after local review. Three starter families: Earthenware, Stoneware, Porcelain. Wider glaze palette with suggested satin/gloss/matte whole-piece finishes and optional customization. Both kiln stages show accelerated illustrative heating, peak temperature and cooling; these are not firing recipes. Stage-relative camera framing avoids scroll-dependent fitting.

Production shelf key preserved. Eight Node regression suites passed (glaze finish updated to cover all three choices). Browser layout checks passed at 320, 390, 430 and 1280 CSS pixels with no horizontal overflow or page errors. Local preview completed both kiln cycles and saving. Web/native asset bundle built; physical devices/native apps not tested.

## Mobile viewport correction
Removed the fixed 1020px mobile height introduced by the preview layout. The studio now follows dynamic viewport height; controls stay above the bottom edge and glazing uses two rows of touch-sized swatches. Added visible-control bounds assertions for shaping, glazing and completion at 320×568, 390×664 and 430×740. All nine checks passed without browser errors. Browser emulation, not a physical-device certification.
