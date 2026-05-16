import { X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTouchImageSlide } from "../../hooks/useTouchImageSlide";

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
  const translateX = isZoomed ? position.x : slideOffset;
  const translateY = isZoomed ? position.y : 0;
  const isPinching = gestureRef.current === "pinch";
  const isTransforming = isPanning || isSlideDragging || isPinching || isAnimating;

  const activeUrl = images[activeIndex]?.url;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/90 via-black/70 to-transparent shrink-0">
        <div className="text-white text-sm font-medium px-3 py-1.5 bg-black/50 rounded-full">
          {activeIndex + 1} / {images.length}
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

      <div
        ref={slideContainerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative w-full min-h-0"
      >
        <div
          className="relative will-change-transform origin-center"
          style={{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transition: isTransforming ? "none" : "transform 0.2s ease-out",
          }}
        >
          <img
            src={activeUrl}
            alt="Zoomed product view"
            className="block max-w-[100vw] max-h-[70vh] w-auto h-auto object-contain select-none pointer-events-none"
            draggable={false}
          />
        </div>
      </div>

      {images.length > 1 && !isZoomed && (
        <div className="shrink-0 p-4 pt-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
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
