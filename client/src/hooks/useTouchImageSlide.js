import { useRef, useState, useCallback } from "react";

const SWIPE_THRESHOLD = 50;

/**
 * Horizontal drag-to-slide for image galleries (mobile).
 * Image follows the finger; releases past threshold change photo.
 */
export function useTouchImageSlide({ onPrev, onNext, enabled = true }) {
  const [slideOffset, setSlideOffset] = useState(0);
  const [isSlideDragging, setIsSlideDragging] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const slideOffsetRef = useRef(0);
  const didSwipeRef = useRef(false);
  const isHorizontalRef = useRef(false);

  const resetSlide = useCallback(() => {
    slideOffsetRef.current = 0;
    setSlideOffset(0);
    setIsSlideDragging(false);
    isHorizontalRef.current = false;
  }, []);

  const onTouchStart = useCallback(
    (e) => {
      if (!enabled || e.touches.length > 1) return;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      didSwipeRef.current = false;
      isHorizontalRef.current = false;
      setIsSlideDragging(true);
    },
    [enabled]
  );

  const onTouchMove = useCallback(
    (e) => {
      if (!enabled || !isSlideDragging || e.touches.length > 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (!isHorizontalRef.current) {
        if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
        isHorizontalRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }

      if (isHorizontalRef.current) {
        slideOffsetRef.current = deltaX;
        setSlideOffset(deltaX);
      }
    },
    [enabled, isSlideDragging]
  );

  const onTouchEnd = useCallback(
    (e) => {
      if (!enabled) return;

      const threshold = Math.min(window.innerWidth * 0.22, 90);
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const offset = slideOffsetRef.current;

      if (isHorizontalRef.current && Math.abs(offset) > threshold) {
        didSwipeRef.current = true;
        if (offset < 0) onNext?.();
        else onPrev?.();
      } else if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > SWIPE_THRESHOLD
      ) {
        didSwipeRef.current = true;
        if (deltaX < 0) onNext?.();
        else onPrev?.();
      }

      slideOffsetRef.current = 0;
      resetSlide();
    },
    [enabled, onPrev, onNext, resetSlide]
  );

  return {
    slideOffset,
    isSlideDragging,
    didSwipeRef,
    resetSlide,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
