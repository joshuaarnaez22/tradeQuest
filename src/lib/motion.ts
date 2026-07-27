// Mirrors tokens/effects.css --ease-out / --ease-bounce exactly, as cubic-bezier
// arrays Motion can consume directly, so Motion-driven animations match the
// CSS-keyframe animations they sit next to.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_BOUNCE = [0.34, 1.56, 0.64, 1] as const;

export const LIFT_TRANSITION = { duration: 0.12, ease: EASE_OUT };
