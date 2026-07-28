"use client";

import { useLayoutEffect } from "react";

// (app)/layout.tsx paints its own wrapper div dark via data-theme="dark", but
// `body { background: var(--surface-page) }` in globals.css is never inside
// that scope — body itself stays the light value. Overscroll/rubber-band
// bounce then reveals a flash of the light background at the edges of an
// otherwise all-dark screen. Mirroring data-theme onto body (and restoring
// it on unmount, since body persists across client-side route changes) fixes
// this without touching the marketing page's own light/dark toggle.
export function ForceBodyDarkTheme() {
  useLayoutEffect(() => {
    const prev = document.body.getAttribute("data-theme");
    document.body.setAttribute("data-theme", "dark");
    return () => {
      if (prev) document.body.setAttribute("data-theme", prev);
      else document.body.removeAttribute("data-theme");
    };
  }, []);
  return null;
}
