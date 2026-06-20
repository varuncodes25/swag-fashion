import { useCallback, useEffect, useRef, useState } from "react";
import GalleryImage from "./GalleryImage";
import { normalizeProductImages } from "@/utils/productImages";

const SWIPE_MIN = 50;
const DRAG_LOCK = 8;
const TRANSITION = "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)";

/**
 * Infinite slider — clone slides se last→first seamless loop.
 */
export default function SimpleImageSlider({
  images = [],
  index = 0,
  onIndexChange,
  onTap,
  fit = "contain",
  className = "",
  imgClassName = "",
  enableSwipe = true,
}) {
  const galleryImages = normalizeProductImages(images);
  const count = galleryImages.length;
  const hasLoop = count > 1;

  const trackPosRef = useRef(hasLoop ? index + 1 : 0);
  const skipSyncRef = useRef(false);
  const touchRef = useRef({ x: 0, y: 0, locked: null });
  const didSwipeRef = useRef(false);

  const [trackPos, setTrackPos] = useState(hasLoop ? index + 1 : 0);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);

  const slides = hasLoop
    ? [galleryImages[count - 1], ...galleryImages, galleryImages[0]]
    : galleryImages;

  const slideCount = slides.length;

  useEffect(() => {
    trackPosRef.current = trackPos;
  }, [trackPos]);

  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    if (!hasLoop) {
      setTrackPos(0);
      return;
    }
    setAnimating(false);
    setDragX(0);
    setTrackPos(index + 1);
    trackPosRef.current = index + 1;
  }, [index, hasLoop]);

  const commitIndex = useCallback(
    (nextIndex) => {
      skipSyncRef.current = true;
      onIndexChange?.(nextIndex);
    },
    [onIndexChange],
  );

  const snapClone = useCallback(
    (pos) => {
      if (!hasLoop) return;
      if (pos === 0) {
        setAnimating(false);
        setTrackPos(count);
        trackPosRef.current = count;
        commitIndex(count - 1);
      } else if (pos === count + 1) {
        setAnimating(false);
        setTrackPos(1);
        trackPosRef.current = 1;
        commitIndex(0);
      }
    },
    [hasLoop, count, commitIndex],
  );

  const slideTo = useCallback(
    (nextPos) => {
      setAnimating(true);
      setDragX(0);
      setTrackPos(nextPos);
      trackPosRef.current = nextPos;

      if (hasLoop && nextPos >= 1 && nextPos <= count) {
        skipSyncRef.current = true;
        onIndexChange?.(nextPos - 1);
      }
    },
    [hasLoop, count, onIndexChange],
  );

  const handleTransitionEnd = () => {
    const pos = trackPosRef.current;
    if (hasLoop && (pos === 0 || pos === count + 1)) {
      snapClone(pos);
    }
    setAnimating(false);
  };

  const onTouchStart = (e) => {
    if (!enableSwipe || !hasLoop || e.touches.length > 1) return;
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, locked: null };
    didSwipeRef.current = false;
    setAnimating(false);
  };

  const onTouchMove = (e) => {
    if (!enableSwipe || !hasLoop || e.touches.length > 1) return;

    const t = e.touches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;

    if (!touchRef.current.locked) {
      if (Math.abs(dx) < DRAG_LOCK && Math.abs(dy) < DRAG_LOCK) return;
      touchRef.current.locked = Math.abs(dy) > Math.abs(dx) ? "y" : "x";
    }
    if (touchRef.current.locked === "y") return;

    setDragX(dx);
  };

  const onTouchEnd = (e) => {
    if (!enableSwipe || !hasLoop) return;

    const locked = touchRef.current.locked;
    touchRef.current.locked = null;

    if (locked === "y") {
      setDragX(0);
      return;
    }

    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;

    setDragX(0);

    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dy) > Math.abs(dx)) return;

    didSwipeRef.current = true;
    const pos = trackPosRef.current;

    if (dx < 0) slideTo(pos + 1);
    else slideTo(pos - 1);
  };

  const handleClick = () => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }
    onTap?.();
  };

  if (!count) return null;

  const offsetPct = slideCount > 0 ? (trackPos / slideCount) * 100 : 0;
  const transition = animating && dragX === 0 ? TRANSITION : "none";

  return (
    <div
      className={`h-full w-full overflow-hidden ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleClick}
      style={{ touchAction: "pan-y pinch-zoom" }}
    >
      <div
        className="flex h-full will-change-transform"
        style={{
          width: `${slideCount * 100}%`,
          transform: `translateX(calc(-${offsetPct}% + ${dragX}px))`,
          transition,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((img, i) => {
          const realIndex = hasLoop
            ? i === 0
              ? count - 1
              : i === slides.length - 1
                ? 0
                : i - 1
            : i;

          return (
            <div
              key={`slide-${i}-${img.url}`}
              className="flex h-full shrink-0 items-center justify-center"
              style={{ width: `${100 / slideCount}%` }}
            >
              <GalleryImage
                src={img.url}
                alt=""
                fit={fit}
                priority={Math.abs(realIndex - index) <= 1}
                className={`h-full w-full select-none pointer-events-none ${imgClassName}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
