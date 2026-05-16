import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTouchImageSlide } from "../../hooks/useTouchImageSlide";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const TAP_MOVE_THRESHOLD = 12;

const getTouchDistance = (t1, t2) => {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.hypot(dx, dy);
};

const MobileImageZoom = ({ images, activeIndex, onClose, onPrev, onNext, onSelect }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const pinchRef = useRef({ startDistance: 0, startScale: 1 });
  const touchStartForTapRef = useRef({ x: 0, y: 0 });
  const gestureRef = useRef(null);

  const canSlide = images.length > 1 && scale === 1;

  const { slideOffset, isSlideDragging, didSwipeRef, handlers: slideHandlers } =
    useTouchImageSlide({
      onPrev,
      onNext,
      enabled: canSlide,
    });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [activeIndex]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventPinchScroll = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    el.addEventListener("touchmove", preventPinchScroll, { passive: false });
    return () => el.removeEventListener("touchmove", preventPinchScroll);
  }, []);

  const clampScale = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const zoomIn = () => setScale((s) => clampScale(s + 0.5));

  const zoomOut = () => {
    setScale((s) => {
      const next = Math.max(MIN_SCALE, s - 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const toggleTapZoom = useCallback(() => {
    setScale((s) => {
      if (s > 1) {
        setPosition({ x: 0, y: 0 });
        return 1;
      }
      return 2;
    });
  }, []);

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      gestureRef.current = "pinch";
      pinchRef.current = {
        startDistance: getTouchDistance(e.touches[0], e.touches[1]),
        startScale: scale,
      };
      return;
    }

    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    touchStartForTapRef.current = { x: touch.clientX, y: touch.clientY };

    if (scale > 1) {
      gestureRef.current = "pan";
      setIsPanning(true);
      setPanStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
      return;
    }

    gestureRef.current = null;
    slideHandlers.onTouchStart(e);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && gestureRef.current === "pinch") {
      e.preventDefault();
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      const ratio = dist / pinchRef.current.startDistance;
      const next = clampScale(pinchRef.current.startScale * ratio);
      setScale(next);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return;
    }

    if (gestureRef.current === "pan" && isPanning && e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - panStart.x,
        y: touch.clientY - panStart.y,
      });
      return;
    }

    if (scale === 1 && canSlide) {
      slideHandlers.onTouchMove(e);
    }
  };

  const handleTouchEnd = (e) => {
    if (gestureRef.current === "pinch" || gestureRef.current === "pan") {
      gestureRef.current = null;
      setIsPanning(false);
    }

    if (scale === 1 && canSlide) {
      const touch = e.changedTouches[0];
      const moveX = Math.abs(touch.clientX - touchStartForTapRef.current.x);
      const moveY = Math.abs(touch.clientY - touchStartForTapRef.current.y);
      const totalMove = Math.max(moveX, moveY, Math.abs(slideOffset));

      slideHandlers.onTouchEnd(e);

      if (!didSwipeRef.current && totalMove < TAP_MOVE_THRESHOLD) {
        toggleTapZoom();
      }
      return;
    }

    if (scale > 1 && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const move = Math.hypot(
        touch.clientX - touchStartForTapRef.current.x,
        touch.clientY - touchStartForTapRef.current.y
      );
      if (move < TAP_MOVE_THRESHOLD) {
        toggleTapZoom();
      }
    }
  };

  if (!images?.length) return null;

  const isTransforming = isSlideDragging || isPanning;
  const translateX = scale === 1 ? slideOffset : position.x;
  const translateY = scale === 1 ? 0 : position.y;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/90 via-black/70 to-transparent">
        <div className="flex items-center gap-3">
          <div className="text-white text-sm font-medium px-3 py-1.5 bg-black/50 rounded-full">
            {activeIndex + 1} / {images.length}
          </div>

          {scale > 1 && (
            <div className="text-white text-sm px-3 py-1.5 bg-warning/90 rounded-full flex items-center gap-1">
              <ZoomIn size={14} />
              {scale.toFixed(1)}x
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 1}
            className={`p-3 rounded-full ${scale <= 1 ? "bg-gray-800/50 text-gray-500" : "bg-black/60 text-white hover:bg-black/80"}`}
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            className={`p-3 rounded-full ${scale >= MAX_SCALE ? "bg-gray-800/50 text-gray-500" : "bg-black/60 text-white hover:bg-black/80"}`}
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        <div
          className="relative will-change-transform"
          style={{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transition: isTransforming ? "none" : "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <img
            src={images[activeIndex]?.url}
            alt="Zoomed product view"
            className="max-w-[100vw] max-h-[70vh] object-contain select-none pointer-events-none"
            draggable={false}
          />
        </div>

        {images.length > 1 && scale === 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
            <button
              type="button"
              onClick={onPrev}
              className="p-4 rounded-full bg-black/60 text-white shadow-xl pointer-events-auto backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="p-4 rounded-full bg-black/60 text-white shadow-xl pointer-events-auto backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>

      {images.length > 1 && scale === 1 && (
        <div className="p-4 pt-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
          <div className="mb-2 px-2">
            <div className="text-white/80 text-xs font-medium">All Photos</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIndex ? "border-warning scale-105" : "border-white/20"
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileImageZoom;
