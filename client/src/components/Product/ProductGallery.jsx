import { useState, useEffect, useMemo } from "react";
import MobileImageZoom from "./MobileImageZoom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SimpleImageSlider from "./SimpleImageSlider";
import GalleryImage from "./GalleryImage";
import { normalizeProductImages, optimizeGalleryImage } from "@/utils/productImages";

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

  const galleryImages = useMemo(
    () => normalizeProductImages(images),
    [images],
  );

  const activeImage = galleryImages[selectedImage]?.url;
  
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
    if (!galleryImages.length) return;
    onSelect((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    if (isZoomed) setIsZoomed(false);
    setShowZoom(false);
  };

  const handleNext = () => {
    if (!galleryImages.length) return;
    onSelect((prev) => (prev + 1) % galleryImages.length);
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
  }, [selectedImage, isZoomed, isMobileZoomOpen, galleryImages]);

  if (!galleryImages.length) {
    return (
      <div className="flex h-[min(72vh,620px)] min-h-[320px] w-full items-center justify-center rounded-xl bg-muted/40 lg:min-h-[520px]">
        <div className="h-full w-full max-w-[420px] animate-pulse rounded-xl bg-muted/60" />
      </div>
    );
  }

  if (!activeImage) {
    return (
      <div className="flex h-[min(72vh,620px)] min-h-[320px] w-full items-center justify-center rounded-xl bg-muted/40 lg:min-h-[520px]">
        <div className="h-full w-full max-w-[420px] animate-pulse rounded-xl bg-muted/60" />
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden lg:flex gap-4">
        {/* THUMBNAILS */}
        {galleryImages.length > 1 && (
          <div className="flex flex-col gap-2 shrink-0">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(i);
                  if (isZoomed) setIsZoomed(false);
                  setShowZoom(false);
                }}
                className={`w-14 h-14 rounded-md border overflow-hidden transition-all ${
                  selectedImage === i
                    ? "border-warning border-2 scale-105"
                    : "border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30"
                }`}
              >
                <GalleryImage src={img.url} alt="" fit="cover" thumb priority={i === selectedImage} />
              </button>
            ))}
          </div>
        )}

        {/* MAIN IMAGE — taller frame + contain so full product is visible */}
        <div
          className={`
            relative
            flex items-center justify-center
            h-[min(72vh,620px)]
            min-h-[520px]
            rounded-xl
            border
            border-gray-300 dark:border-white/10
            bg-neutral-100 dark:bg-neutral-900
            overflow-hidden
            cursor-crosshair
            transition-all duration-300
            ${isZoomed ? "w-full max-w-[480px]" : "w-full max-w-[420px]"}
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
          {!showZoom && !isZoomed && (
            <GalleryImage
              src={activeImage}
              alt="product"
              fit="contain"
              priority
              className="absolute inset-0 z-[1] p-2 transition-transform duration-300"
            />
          )}

          {/* ZOOMED IMAGE */}
          {(showZoom || isZoomed) && (
            <div
              className="absolute inset-0 z-[2] bg-no-repeat"
              style={{
                backgroundImage: `url(${optimizeGalleryImage(activeImage, { maxWidth: 1600 })})`,
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
          {galleryImages.length > 1 && !isZoomed && (
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
        {/* MAIN IMAGE — portrait frame (3:4), image fills container */}
        <div
          className="
            w-full
            aspect-[2/3]
            min-h-[420px]
            max-h-[min(78vh,560px)]
            rounded-xl
            border
            border-gray-300 dark:border-white/10
            bg-neutral-100 dark:bg-neutral-900
            mb-3
            relative
            overflow-hidden
          "
        >
          <SimpleImageSlider
            images={galleryImages}
            index={selectedImage}
            onIndexChange={onSelect}
            onTap={handleMobileZoomOpen}
            fit="contain"
            className="absolute inset-0 z-[1]"
            imgClassName="p-1"
          />
        </div>

        {/* THUMBNAILS */}
        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(i);
                  handleMobileZoomOpen();
                }}
                className={`shrink-0 w-16 h-16 overflow-hidden rounded-md border transition-all ${
                  selectedImage === i
                    ? "border-warning border-2"
                    : "border-gray-300 dark:border-white/10"
                }`}
              >
                <GalleryImage src={img.url} alt="" fit="cover" thumb priority={i === selectedImage} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE FULLSCREEN */}
      {(isMobileZoomOpen || (isZoomed && window.innerWidth < 1024)) && (
        <MobileImageZoom
          images={galleryImages}
          activeIndex={selectedImage}
          onClose={handleMobileZoomClose}
          onPrev={handlePrev}
          onNext={handleNext}
          onSelect={(index) => onSelect(index)}
        />
      )}

      {/* SIMPLE INSTRUCTION TEXT */}
      <div className="hidden lg:block mt-3">
        <div className="text-sm text-muted-foreground text-center">
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