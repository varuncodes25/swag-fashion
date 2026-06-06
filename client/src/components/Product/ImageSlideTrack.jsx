import { useEffect, useRef, useState } from "react";
import GalleryImage from "./GalleryImage";
import { normalizeProductImages, optimizeGalleryImage } from "@/utils/productImages";

/**
 * Three-panel carousel track: prev | current | next with horizontal slide offset.
 */
const ImageSlideTrack = ({
  images = [],
  activeIndex = 0,
  slideOffset = 0,
  isSlideDragging = false,
  isAnimating = false,
  fit = "cover",
  className = "",
  imgClassName = "",
}) => {
  const containerRef = useRef(null);
  const [panelWidth, setPanelWidth] = useState(0);

  const galleryImages = normalizeProductImages(images);
  const len = galleryImages.length;
  const url = (i) => galleryImages[i]?.url;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => setPanelWidth(el.offsetWidth);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (len <= 1) return;
    const prevIdx = (activeIndex - 1 + len) % len;
    const nextIdx = (activeIndex + 1) % len;
    [prevIdx, activeIndex, nextIdx].forEach((i) => {
      const src = url(i);
      if (src) {
        const img = new Image();
        img.decoding = "async";
        img.src = optimizeGalleryImage(src, { maxWidth: 900 });
      }
    });
  }, [activeIndex, len, galleryImages]);

  const centerWrapperClass =
    "flex h-full w-full items-center justify-center overflow-hidden";

  if (!len) return null;

  if (len === 1) {
    return (
      <div ref={containerRef} className={`${centerWrapperClass} ${className}`}>
        <GalleryImage
          src={url(0)}
          alt=""
          fit={fit}
          priority
          className={`select-none pointer-events-none ${imgClassName}`}
        />
      </div>
    );
  }

  const prevIdx = (activeIndex - 1 + len) % len;
  const nextIdx = (activeIndex + 1) % len;
  const panels = [prevIdx, activeIndex, nextIdx];

  const transition =
    isSlideDragging || (isAnimating && slideOffset !== 0)
      ? isSlideDragging
        ? "none"
        : "transform 0.26s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";

  const trackWidth = panelWidth > 0 ? panelWidth * 3 : "300%";
  const baseOffset = panelWidth > 0 ? -panelWidth : 0;

  return (
    <div ref={containerRef} className={`${centerWrapperClass} ${className}`}>
      <div className="h-full w-full overflow-hidden">
        <div
          className="flex h-full will-change-transform"
          style={{
            width: trackWidth,
            transform:
              panelWidth > 0
                ? `translate3d(${baseOffset + slideOffset}px, 0, 0)`
                : `translate3d(calc(-33.333% + ${slideOffset}px), 0, 0)`,
            transition,
          }}
        >
          {panels.map((idx, panel) => (
            <div
              key={`panel-${panel}`}
              className="flex h-full shrink-0 items-center justify-center"
              style={{
                width: panelWidth > 0 ? panelWidth : "33.333%",
              }}
            >
              <GalleryImage
                src={url(idx)}
                alt=""
                fit={fit}
                priority={panel === 1}
                className={`select-none pointer-events-none ${imgClassName}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlideTrack;
