import { useRef, useState, useCallback } from "react";

const SWIPE_THRESHOLD = 48;
const SLIDE_DURATION_MS = 260;
const DRAG_LOCK_PX = 6;

/**
 * Horizontal drag-to-slide with commit animation (app-style carousel).
 */
export function useTouchImageSlide({
  onPrev,
  onNext,
  enabled = true,
  containerRef,
}) {
  const [slideOffset, setSlideOffset] = useState(0);
  const [isSlideDragging, setIsSlideDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartRef = useRef({ x: 0, y: 0 });
  const slideOffsetRef = useRef(0);
  const didSwipeRef = useRef(false);
  const isHorizontalRef = useRef(false);
  const isVerticalRef = useRef(false);
  const isSlideDraggingRef = useRef(false);
  const commitTimerRef = useRef(null);

  const getWidth = useCallback(() => {
    return containerRef?.current?.offsetWidth ?? window.innerWidth;
  }, [containerRef]);

  const clearCommitTimer = () => {
    if (commitTimerRef.current) {
      window.clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  };

  const resetSlide = useCallback(() => {
    slideOffsetRef.current = 0;
    setSlideOffset(0);
    setIsSlideDragging(false);
    isSlideDraggingRef.current = false;
    isHorizontalRef.current = false;
    isVerticalRef.current = false;
  }, []);

  const commitSlide = useCallback(
    (direction) => {
      if (!enabled) return;

      clearCommitTimer();
      const w = getWidth();
      const target = direction === "next" ? -w : w;

      isSlideDraggingRef.current = false;
      setIsSlideDragging(false);
      setIsAnimating(true);
      slideOffsetRef.current = target;
      setSlideOffset(target);

      commitTimerRef.current = window.setTimeout(() => {
        // Reset offset and index in the same React batch so the track
        // never paints one frame with a new index but the old slide offset.
        slideOffsetRef.current = 0;
        setSlideOffset(0);
        setIsAnimating(false);
        isHorizontalRef.current = false;
        isVerticalRef.current = false;
        commitTimerRef.current = null;

        if (direction === "next") onNext?.();
        else onPrev?.();
      }, SLIDE_DURATION_MS);
    },
    [enabled, getWidth, onNext, onPrev]
  );

  const snapBack = useCallback(() => {
    clearCommitTimer();
    isSlideDraggingRef.current = false;
    setIsSlideDragging(false);
    setIsAnimating(true);
    slideOffsetRef.current = 0;
    setSlideOffset(0);

    commitTimerRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      isHorizontalRef.current = false;
      isVerticalRef.current = false;
      commitTimerRef.current = null;
    }, SLIDE_DURATION_MS);
  }, []);

  const onTouchStart = useCallback(
    (e) => {
      if (!enabled || isAnimating || e.touches.length > 1) return;

      clearCommitTimer();
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      didSwipeRef.current = false;
      isHorizontalRef.current = false;
      isVerticalRef.current = false;
      isSlideDraggingRef.current = false;
      setIsSlideDragging(false);
    },
    [enabled, isAnimating]
  );

  const onTouchMove = useCallback(
    (e) => {
      if (!enabled || isAnimating || e.touches.length > 1) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (!isHorizontalRef.current && !isVerticalRef.current) {
        if (Math.abs(deltaX) < DRAG_LOCK_PX && Math.abs(deltaY) < DRAG_LOCK_PX) return;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          isVerticalRef.current = true;
          return;
        }
        isHorizontalRef.current = true;
        isSlideDraggingRef.current = true;
        setIsSlideDragging(true);
      }

      if (isVerticalRef.current || !isHorizontalRef.current) return;

      slideOffsetRef.current = deltaX;
      setSlideOffset(deltaX);
    },
    [enabled, isAnimating]
  );

  const onTouchEnd = useCallback(
    (e) => {
      if (!enabled) return;

      if (isVerticalRef.current) {
        resetSlide();
        return;
      }

      isSlideDraggingRef.current = false;
      setIsSlideDragging(false);

      if (isAnimating) return;

      const threshold = Math.min(getWidth() * 0.18, 80);
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const offset = slideOffsetRef.current;

      let direction = null;

      if (isHorizontalRef.current && Math.abs(offset) > threshold) {
        direction = offset < 0 ? "next" : "prev";
      } else if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > SWIPE_THRESHOLD
      ) {
        direction = deltaX < 0 ? "next" : "prev";
      }

      if (direction) {
        didSwipeRef.current = true;
        commitSlide(direction);
        return;
      }

      if (isHorizontalRef.current && Math.abs(offset) > 4) {
        snapBack();
        return;
      }

      resetSlide();
    },
    [enabled, isAnimating, getWidth, commitSlide, snapBack, resetSlide]
  );

  const goNextAnimated = useCallback(() => {
    if (!enabled || isAnimating) return;
    didSwipeRef.current = true;
    commitSlide("next");
  }, [enabled, isAnimating, commitSlide]);

  const goPrevAnimated = useCallback(() => {
    if (!enabled || isAnimating) return;
    didSwipeRef.current = true;
    commitSlide("prev");
  }, [enabled, isAnimating, commitSlide]);

  return {
    slideOffset,
    isSlideDragging,
    isAnimating,
    didSwipeRef,
    resetSlide,
    goNextAnimated,
    goPrevAnimated,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
