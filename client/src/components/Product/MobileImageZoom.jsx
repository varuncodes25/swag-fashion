import { X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTouchImageSlide } from "../../hooks/useTouchImageSlide";
import ImageSlideTrack from "./ImageSlideTrack";

const MIN_SCALE = 1;
const MAX_SCALE = 3;

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
  const slideContainerRef = useRef(null);
  const scaleRef = useRef(1);
  const pinchRef = useRef({ startDistance: 0, startScale: 1 });
  const gestureRef = useRef(null);

  const canSlide = images.length > 1 && scale <= 1;

  const {
    slideOffset,
    isSlideDragging,
    isAnimating,
    resetSlide,
    handlers: slideHandlers,
  } = useTouchImageSlide({
    onPrev,
    onNext,
    enabled: canSlide,
    containerRef: slideContainerRef,
  });

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    scaleRef.current = 1;
    resetSlide();
  }, [activeIndex, resetSlide]);

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

  const zoomIn = () => setScale((s) => clampScale(s + 0.25));

  const zoomOut = () => {
    setScale((s) => {
      const next = Math.max(MIN_SCALE, s - 0.25);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      gestureRef.current = "pinch";
      resetSlide();
      pinchRef.current = {
        startDistance: getTouchDistance(e.touches[0], e.touches[1]),
        startScale: scaleRef.current,
      };
      return;
    }

    if (e.touches.length !== 1) return;

    if (scaleRef.current > 1) {
      gestureRef.current = "pan";
      setIsPanning(true);
      const touch = e.touches[0];
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
    if (e.touches.length === 2) {
      e.preventDefault();
      gestureRef.current = "pinch";

      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      if (pinchRef.current.startDistance > 0) {
        const ratio = dist / pinchRef.current.startDistance;
        const next = clampScale(pinchRef.current.startScale * ratio);
        setScale(next);
        if (next <= 1) setPosition({ x: 0, y: 0 });
      }
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

    if (gestureRef.current !== "pinch" && scaleRef.current <= 1 && images.length > 1) {
      slideHandlers.onTouchMove(e);
    }
  };

  const handleTouchEnd = (e) => {
    if (gestureRef.current === "pan") {
      gestureRef.current = null;
      setIsPanning(false);
    }

    if (gestureRef.current === "pinch" && e.touches.length < 2) {
      gestureRef.current = null;
      if (scaleRef.current <= 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    }

    if (gestureRef.current !== "pinch" && scaleRef.current <= 1 && images.length > 1) {
      slideHandlers.onTouchEnd(e);
    }
  };

  if (!images?.length) return null;

  const isZoomed = scale > 1;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col touch-none bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex shrink-0 items-center justify-between bg-gradient-to-b from-black/90 via-black/70 to-transparent p-4">
        <div className="rounded-full bg-black/50 px-3 py-1.5 text-sm font-medium text-white">
          {activeIndex + 1} / {images.length}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 1}
            className={`rounded-full p-3 ${scale <= 1 ? "bg-gray-800/50 text-gray-500" : "bg-black/60 text-white hover:bg-black/80"}`}
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            className={`rounded-full p-3 ${scale >= MAX_SCALE ? "bg-gray-800/50 text-gray-500" : "bg-black/60 text-white hover:bg-black/80"}`}
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-black/60 p-3 text-white transition-colors hover:bg-black/80"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div
        ref={slideContainerRef}
        className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden"
      >
        {isZoomed ? (
          <div
            className="relative origin-center will-change-transform"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isPanning ? "none" : "transform 0.2s ease-out",
            }}
          >
            <img
              src={images[activeIndex]?.url}
              alt="Zoomed product view"
              className="pointer-events-none block h-auto max-h-[70vh] w-auto max-w-[100vw] select-none object-contain"
              draggable={false}
            />
          </div>
        ) : (
          <ImageSlideTrack
            images={images}
            activeIndex={activeIndex}
            slideOffset={slideOffset}
            isSlideDragging={isSlideDragging}
            isAnimating={isAnimating}
            fit="contain"
            className="absolute inset-0"
            imgClassName="max-h-[70vh]"
          />
        )}
      </div>

      {images.length > 1 && !isZoomed && (
        <div className="shrink-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 pt-6">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  i === activeIndex ? "border-warning scale-105" : "border-white/20"
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileImageZoom;
