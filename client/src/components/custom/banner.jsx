import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Images
import banner1 from "../../assets/banner.png";
import banner2 from "../../assets/banner2.png";
import banner3 from "../../assets/banner3.png";
import banner4 from "../../assets/banner4.png";
import banner5 from "../../assets/banner5.png";

// Data
const bannerData = [
  { id: 1, image: banner1 },
  { id: 2, image: banner2 },
  { id: 3, image: banner3 },
  { id: 4, image: banner4 },
  { id: 5, image: banner5 },
];

const Banner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const currentBanner = bannerData[activeIndex];

  const startAutoSlide = () => {
    stopAutoSlide();

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerData.length);
      setProgress(0);
    }, 4000);

    progressRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 40);
  };

  const stopAutoSlide = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  const goToNext = () => {
    stopAutoSlide();
    setActiveIndex((prev) => (prev + 1) % bannerData.length);
    setTimeout(startAutoSlide, 2000);
  };

  const goToPrev = () => {
    stopAutoSlide();
    setActiveIndex((prev) =>
      prev === 0 ? bannerData.length - 1 : prev - 1
    );
    setTimeout(startAutoSlide, 2000);
  };

  const goToSlide = (index) => {
    stopAutoSlide();
    setActiveIndex(index);
    setTimeout(startAutoSlide, 2000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  return (
    <div className="w-full px-2 sm:px-4"> {/* spacing for premium look */}
      
      {/* ✅ Rounded Container */}
      <div className="w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-lg">

        <div className="relative">

          {/* Banner */}
          <div
            className="relative bg-black 
            aspect-[16/9] 
            sm:aspect-[16/7] 
            md:aspect-[16/6] 
            lg:aspect-auto lg:h-[550px]"
          >
            <img
              src={currentBanner.image}
              alt="banner"
              className="w-full h-full object-contain"
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
                  className={`transition-all duration-200 rounded-full ${
                    index === activeIndex
                      ? "w-2 h-1 bg-white"
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