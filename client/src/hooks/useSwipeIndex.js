import { useRef, useCallback } from "react";

const SWIPE_MIN = 50;

/** Swipe left/right → call onNext / onPrev. Index parent mein handle hota hai. */
export function useSwipeIndex({ onNext, onPrev, enabled = true }) {
  const startRef = useRef(null);
  const didSwipeRef = useRef(false);

  const onTouchStart = useCallback(
    (e) => {
      if (!enabled || e.touches.length > 1) return;
      const t = e.touches[0];
      startRef.current = { x: t.clientX, y: t.clientY };
      didSwipeRef.current = false;
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (e) => {
      if (!enabled || !startRef.current) return;

      const t = e.changedTouches[0];
      const dx = t.clientX - startRef.current.x;
      const dy = t.clientY - startRef.current.y;
      startRef.current = null;

      if (Math.abs(dx) < SWIPE_MIN || Math.abs(dy) > Math.abs(dx)) return;

      didSwipeRef.current = true;
      if (dx < 0) onNext?.();
      else onPrev?.();
    },
    [enabled, onNext, onPrev],
  );

  return {
    didSwipeRef,
    handlers: { onTouchStart, onTouchEnd },
  };
}
