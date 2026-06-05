"use client";

/**
 * hooks/useKeyboardOffset.ts
 *
 * Returns the current software keyboard height in pixels (0 when closed).
 *
 * Strategy:
 *   window.visualViewport fires "resize" whenever the keyboard opens/closes.
 *   keyboard height = window.innerHeight - visualViewport.height - visualViewport.offsetTop
 *
 * Why not CSS env(keyboard-inset-height)?
 *   - iOS Safari 16+ supports it, but Android Chrome does not reliably.
 *   - The JS approach works on both and gives us a numeric value we can use
 *     for React state-driven layout (categories hide/show, content padding).
 *
 * Why transform instead of animating `bottom`?
 *   - Animating `bottom` triggers layout reflow on every frame.
 *   - translateY runs on the compositor thread — no reflow, 60fps on low-end devices.
 */

import { useEffect, useState } from "react";

interface KeyboardState {
  offset: number;       // keyboard height in px (0 = closed)
  isOpen: boolean;      // true when keyboard is visible
}

export function useKeyboardOffset(): KeyboardState {
  const [state, setState] = useState<KeyboardState>({ offset: 0, isOpen: false });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // On some Android browsers offsetTop is non-zero when page is scrolled;
      // subtract it so we only measure the keyboard, not scroll position.
      const raw = window.innerHeight - vv.height - vv.offsetTop;
      const offset = Math.round(Math.max(0, raw));
      setState({ offset, isOpen: offset > 60 }); // >60px = keyboard, not just browser chrome
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    // Run once on mount (handles pre-open keyboards on Android)
    update();

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return state;
}
