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
  const len = images.length;
  const url = (i) => images[i]?.url;

  if (!len) return null;

  if (len === 1) {
    return (
      <img
        src={url(0)}
        alt=""
        className={`select-none pointer-events-none ${imgClassName}`}
        draggable={false}
      />
    );
  }

  const prevIdx = (activeIndex - 1 + len) % len;
  const nextIdx = (activeIndex + 1) % len;
  const panels = [prevIdx, activeIndex, nextIdx];

  // Animate only while sliding out; instant reset when offset returns to 0 (avoids flash to prev image)
  const transition =
    isSlideDragging || (isAnimating && slideOffset !== 0)
      ? isSlideDragging
        ? "none"
        : "transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      : "none";

  const imgFit =
    fit === "contain"
      ? "max-w-full max-h-[70vh] w-auto h-auto object-contain"
      : "h-full w-full object-cover object-top";

  return (
    <div className={`h-full w-full overflow-hidden ${className}`}>
      <div
        className="flex h-full will-change-transform"
        style={{
          width: "300%",
          transform: `translateX(calc(-33.333% + ${slideOffset}px))`,
          transition,
        }}
      >
        {panels.map((idx, panel) => (
          <div
            key={`panel-${panel}-${activeIndex}-${idx}`}
            className="flex h-full shrink-0 items-center justify-center"
            style={{ width: "33.333%" }}
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
  );
};

export default ImageSlideTrack;
