import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Grid3x3 } from "lucide-react";
import { useEffect, useState } from "react";

const MobileImageZoom = ({ images, activeIndex, onClose, onPrev, onNext, onSelect }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    // Reset scale and position when image changes
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [activeIndex]);

  const handleTouchStart = (e) => {
    if (scale === 1) return;
    
    setIsDragging(true);
    setStartPos({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || scale === 1) return;
    
    const newX = e.touches[0].clientX - startPos.x;
    const newY = e.touches[0].clientY - startPos.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const zoomIn = () => {
    setScale(Math.min(scale + 0.5, 3));
  };

  const zoomOut = () => {
    if (scale > 1) {
      setScale(Math.max(scale - 0.5, 1));
      setPosition({ x: 0, y: 0 });
    }
  };

  if (!images?.length) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* HEADER WITH MINIMAL CONTROLS */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/90 via-black/70 to-transparent">
        <div className="flex items-center gap-3">
          <div className="text-white text-sm font-medium px-3 py-1.5 bg-black/50 rounded-full">
            {activeIndex + 1} / {images.length}
          </div>
          
          {/* ZOOM LEVEL INDICATOR */}
          {scale > 1 && (
            <div className="text-white text-sm px-3 py-1.5 bg-orange-500/90 rounded-full flex items-center gap-1">
              <ZoomIn size={14} />
              {scale.toFixed(1)}x
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={scale <= 1}
            className={`p-3 rounded-full ${scale <= 1 ? 'bg-gray-800/50 text-gray-500' : 'bg-black/60 text-white hover:bg-black/80'}`}
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className={`p-3 rounded-full ${scale >= 3 ? 'bg-gray-800/50 text-gray-500' : 'bg-black/60 text-white hover:bg-black/80'}`}
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* IMAGE CONTAINER */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        <div
          className="relative"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: scale > 1 ? 'grab' : 'default',
          }}
        >
          <img
            src={images[activeIndex]?.url}
            alt="Zoomed product view"
            className="max-w-full max-h-full object-contain select-none"
            draggable="false"
          />
        </div>

        {/* ZOOM HINTS */}
        {scale === 1 ? (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-3 rounded-full backdrop-blur-sm flex items-center gap-2 whitespace-nowrap">
            <Grid3x3 size={14} />
            Pinch to zoom • Drag to pan
          </div>
        ) : (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm">
            Drag to pan
          </div>
        )}

        {/* NAVIGATION ARROWS - Only show when not zoomed */}
        {images.length > 1 && scale === 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
            <button
              onClick={onPrev}
              className="p-4 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-xl pointer-events-auto backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={onNext}
              className="p-4 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-xl pointer-events-auto backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>

      {/* THUMBNAILS BAR - Only show when not zoomed */}
      {images.length > 1 && scale === 1 && (
        <div className="p-4 pt-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
          <div className="mb-2 px-2">
            <div className="text-white/80 text-xs font-medium">All Photos</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIndex
                    ? "border-orange-500 scale-105"
                    : "border-white/20"
                }`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {i === activeIndex && (
                  <div className="absolute inset-0 bg-orange-500/20 border-2 border-orange-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileImageZoom;