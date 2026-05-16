import { useEffect, useRef, useState } from "react";

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

  const len = images.length;
  const url = (i) => images[i]?.url;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => setPanelWidth(el.offsetWidth);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const imgFit =
    fit === "contain"
      ? "max-h-full max-w-full object-contain object-center"
      : "h-full w-full object-cover object-top";

  const centerWrapperClass =
    "flex h-full w-full items-center justify-center overflow-hidden";

  if (!len) return null;

  if (len === 1) {
    return (
      <div
        ref={containerRef}
        className={`${centerWrapperClass} ${className}`}
      >
        <img
          src={url(0)}
          alt=""
          className={`select-none pointer-events-none ${imgFit} ${imgClassName}`}
          draggable={false}
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
        : "transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      : "none";

  const trackWidth = panelWidth > 0 ? panelWidth * 3 : "300%";
  const baseOffset = panelWidth > 0 ? -panelWidth : 0;

  return (
    <div
      ref={containerRef}
      className={`${centerWrapperClass} ${className}`}
    >
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
              key={`panel-${panel}-${activeIndex}-${idx}`}
              className="flex h-full shrink-0 items-center justify-center"
              style={{
                width: panelWidth > 0 ? panelWidth : "33.333%",
              }}
            >
              <img
                src={url(idx)}
                alt=""
                className={`select-none pointer-events-none ${imgFit} ${imgClassName}`}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlideTrack;
