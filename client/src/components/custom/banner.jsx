import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Desktop Images
import banner1 from "../../assets/god mode banner.png";
import banner2 from "../../assets/banner2.png";
import banner3 from "../../assets/banner3.png";

// Mobile Images
import mobile1 from "../../assets/mobile1.png";
import mobile2 from "../../assets/mobile2.png";
import mobile3 from "../../assets/mobile3.png";

// Data
const bannerData = [
  {
    id: 1,
    desktop: banner1,
    mobile: mobile1,
  },
  {
    id: 2,
    desktop: banner2,
    mobile: mobile2,
  },
  {
    id: 3,
    desktop: banner3,
    mobile: mobile3, // ✅ fixed
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

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-lg">

        <div className="relative">

          {/* Banner */}
          <div
            className="
              relative bg-black
              aspect-[16/9]
              sm:aspect-[16/7]
              md:aspect-[16/6]
              lg:aspect-auto lg:h-[550px]
            "
          >

            {/* Mobile */}
            <img
              src={currentBanner.mobile}
              alt="banner"
              className="w-full h-full object-cover block sm:hidden"
              draggable={false}
            />

            {/* Desktop */}
            <img
              src={currentBanner.desktop}
              alt="banner"
              className="w-full h-full object-cover hidden sm:block"
              draggable={false}
            />

          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
            <div
              className="h-full bg-yellow-400 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">

            {/* Left */}
            <button onClick={goToPrev}>
              <ChevronLeft className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {bannerData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === activeIndex
                      ? "w-3 h-1 bg-white"
                      : "w-1 h-1 bg-white/50"
                  }`}
                />
              ))}
            </div>

            {/* Right */}
            <button onClick={goToNext}>
              <ChevronRight className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Banner;