import { useState, useEffect } from "react";
import MobileImageZoom from "./MobileImageZoom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductGallery = ({
  images = [],
  selectedImage = 0,
  onSelect,
  isZoomed,
  setIsZoomed,
   onMobileZoomChange
}) => {
  const [isMobileZoomOpen, setIsMobileZoomOpen] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [bgPos, setBgPos] = useState("50% 50%");
  
  console.log("ProductGallery images:", images);
  console.log("Selected image index:", selectedImage);
  
  const activeImage = images[selectedImage]?.url;
  
  // ❌ WRONG: Early return before useEffect
  // if (!activeImage) return null;
  
  // ✅ CORRECT: Define functions before useEffect
  const handleMouseMove = (e) => {
    if (!isZoomed && !showZoom) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBgPos(`${x}% ${y}%`);
  };

  const handlePrev = () => {
    if (!images || images.length === 0) return;
    onSelect((selectedImage - 1 + images.length) % images.length);
    if (isZoomed) setIsZoomed(false);
    setShowZoom(false);
  };

  const handleNext = () => {
    if (!images || images.length === 0) return;
    onSelect((selectedImage + 1) % images.length);
    if (isZoomed) setIsZoomed(false);
    setShowZoom(false);
  };

  const handleContainerClick = () => {
    if (isZoomed) {
      setIsZoomed(false);
      setShowZoom(false);
    } else {
      setIsZoomed(true);
      setShowZoom(true);
    }
  };

  const handleMobileZoomOpen = () => {
    setIsMobileZoomOpen(true);
    if (onMobileZoomChange) {
      onMobileZoomChange(true); // ✅ Parent ko bataye ki mobile zoom open hai
    }
  };

   const handleMobileZoomClose = () => {
    setIsMobileZoomOpen(false);
    setIsZoomed(false);
    setShowZoom(false);
    if (onMobileZoomChange) {
      onMobileZoomChange(false); // ✅ Parent ko bataye ki mobile zoom close hai
    }
  };
  // ✅ CORRECT: useEffect should come before any conditional returns
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape' && (isZoomed || isMobileZoomOpen)) {
        setIsZoomed(false);
        setIsMobileZoomOpen(false);
        setShowZoom(false);
      }
      if (e.key === ' ' || e.key === 'Enter') {
        handleContainerClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, isZoomed, isMobileZoomOpen, images]);

  // ✅ CORRECT: Early return AFTER all hooks
  if (!activeImage || !images || images.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">No image available</div>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden lg:flex gap-4">
        {/* THUMBNAILS */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2 shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(i);
                  if (isZoomed) setIsZoomed(false);
                  setShowZoom(false);
                }}
                className={`w-14 h-14 rounded-md border transition-all ${
                  selectedImage === i
                    ? "border-orange-500 border-2 scale-105"
                    : "border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30"
                }`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>
        )}

        {/* MAIN IMAGE CONTAINER */}
        <div
          className={`
            relative
            h-[450px]
            rounded-xl
            border
            border-gray-300 dark:border-white/10
            bg-gray-100 dark:bg-neutral-900
            overflow-hidden
            cursor-crosshair
            transition-all duration-300
            ${isZoomed ? "w-[520px]" : "w-[400px]"}
          `}
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => {
            if (!isZoomed) {
              setShowZoom(false);
            }
          }}
          onMouseMove={handleMouseMove}
          onClick={handleContainerClick}
        >
          {/* NORMAL IMAGE */}
          {!showZoom && !isZoomed && (
            <img
              src={activeImage}
              alt="product"
              className="h-full w-full object-contain transition-transform duration-300"
            />
          )}

          {/* ZOOMED IMAGE */}
          {(showZoom || isZoomed) && (
            <div
              className="absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${activeImage})`,
                backgroundSize: isZoomed ? "260%" : "200%",
                backgroundPosition: bgPos,
              }}
            />
          )}

          {/* ZOOM STATUS */}
          {isZoomed && (
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <div className="px-2 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm">
                Zoomed
              </div>
            </div>
          )}

          {/* EXIT ZOOM INSTRUCTION */}
          {isZoomed && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm pointer-events-none">
              Click to exit zoom
            </div>
          )}

          {/* NAVIGATION ARROWS */}
          {images.length > 1 && !isZoomed && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-white/10 hover:bg-white dark:hover:bg-gray-800 transition-colors opacity-0 hover:opacity-100 z-20 pointer-events-auto"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-white/10 hover:bg-white dark:hover:bg-gray-800 transition-colors opacity-0 hover:opacity-100 z-20 pointer-events-auto"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="lg:hidden">
        {/* MAIN IMAGE */}
        <div
          className="
            w-full
            h-[320px] sm:h-[360px]
            rounded-xl
            border
            border-gray-300 dark:border-white/10
            bg-gray-100 dark:bg-neutral-900
            flex items-center justify-center
            mb-4
            relative
          "
          onClick={handleMobileZoomOpen}
          // onClick={() => setIsMobileZoomOpen(true)}
        >
          <img
            src={activeImage}
            alt="product"
            className="max-h-full w-auto object-contain"
          />

          {/* TAP TO ZOOM HINT */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white text-sm rounded-full backdrop-blur-sm pointer-events-none">
            Tap to zoom
          </div>

          {/* MOBILE NAVIGATION */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-300 dark:border-white/10 z-10 pointer-events-auto"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-300 dark:border-white/10 z-10 pointer-events-auto"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* THUMBNAILS */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(i);
                  setShowZoom(false);
                }}
                className={`shrink-0 w-16 h-16 rounded-md border transition-all ${
                  selectedImage === i
                    ? "border-orange-500 border-2"
                    : "border-gray-300 dark:border-white/10"
                }`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE FULLSCREEN */}
      {(isMobileZoomOpen || (isZoomed && window.innerWidth < 1024)) && (
        <MobileImageZoom
          images={images}
          activeIndex={selectedImage}
          onClose={() => {
            setIsMobileZoomOpen(false);
            setIsZoomed(false);
            setShowZoom(false);
          }}
          onPrev={handlePrev}
          onNext={handleNext}
          onSelect={(index) => {
            onSelect(index);
            handleMobileZoomClose();
            setIsMobileZoomOpen(false);
            setIsZoomed(false);
            setShowZoom(false);
          }}
        />
      )}

      {/* SIMPLE INSTRUCTION TEXT */}
      <div className="hidden lg:block mt-3">
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {isZoomed 
            ? "Click image to exit zoom mode" 
            : showZoom 
              ? "Hover to preview • Click to zoom in" 
              : "Hover over image to preview details"
          }
        </div>
      </div>
    </>
  );
};

export default ProductGallery;