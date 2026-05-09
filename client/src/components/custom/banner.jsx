import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const bannerHeights =
  "relative bg-black aspect-[16/9] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-auto lg:h-[550px]";

/** Stable /public URLs so the first hero can be preloaded from HTML after prerender */
const bannerData = [
  {
    id: 1,
    desktop: "/images/banner-slide-1-desktop.png",
    mobile: "/images/banner-slide-1-mobile.png",
  },
  {
    id: 3,
    desktop: "/images/banner-slide-2-desktop.png",
    mobile: "/images/banner-slide-2-mobile.png",
  },
];

const Banner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const currentBanner = bannerData[activeIndex];

  const stopAutoSlide = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  };

  const startAutoSlide = () => {
    stopAutoSlide();

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerData.length);
      setProgress(0);
    }, 4000);

    progressRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 40);
  };

  const goToNext = () => {
    stopAutoSlide();
    setActiveIndex((prev) => (prev + 1) % bannerData.length);
    setProgress(0);
    setTimeout(startAutoSlide, 2000);
  };

  const goToPrev = () => {
    stopAutoSlide();
    setActiveIndex((prev) =>
      prev === 0 ? bannerData.length - 1 : prev - 1
    );
    setProgress(0);
    setTimeout(startAutoSlide, 2000);
  };

  const goToSlide = (index) => {
    stopAutoSlide();
    setActiveIndex(index);
    setProgress(0);
    setTimeout(startAutoSlide, 2000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  const isLcpHero = activeIndex === 0;
  const heroFetchPriority = isLcpHero ? "high" : "low";

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-lg">
        <div className="relative">
          <div className={bannerHeights}>
            {/* Mobile */}
            <img
              src={currentBanner.mobile}
              alt="Swag Fashion — seasonal collection banner"
              className="absolute inset-0 w-full h-full object-cover block sm:hidden"
              draggable={false}
              decoding="async"
              fetchPriority={heroFetchPriority}
              sizes="100vw"
            />

            {/* Desktop */}
            <img
              src={currentBanner.desktop}
              alt="Swag Fashion — seasonal collection banner"
              className="absolute inset-0 w-full h-full object-cover hidden sm:block"
              draggable={false}
              decoding="async"
              fetchPriority={heroFetchPriority}
              sizes="(min-width: 640px) 100vw, 100vw"
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
            <div
              className="h-full bg-yellow-400 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            <button
              type="button"
              aria-label="Previous banner"
              onClick={goToPrev}
              className="p-2 rounded-full bg-black/35 hover:bg-black/55 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <ChevronLeft className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-1.5" role="tablist" aria-label="Banner slides">
              {bannerData.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={`Go to banner ${index + 1}`}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === activeIndex
                      ? "w-3 h-1 bg-white"
                      : "w-1 h-1 bg-white/50"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Next banner"
              onClick={goToNext}
              className="p-2 rounded-full bg-black/35 hover:bg-black/55 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <ChevronRight className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
