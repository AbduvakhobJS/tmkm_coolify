/**
 * Plain cubic ease-out: decelerates smoothly into the target and stops
 * exactly there — no overshoot past it, no pulling back afterwards. Used by
 * the camera fly-to rigs so an arrival reads as a clean glide-and-descend
 * rather than flying past the marker and retreating back into frame.
 */
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
