import React, { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

import banner1 from "../../assets/banner.png";
import banner2 from "../../assets/banner2.png";
import banner3 from "../../assets/banner3.png";

const imagesData = [banner1, banner2, banner3];

const HeaderDisplay = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  // Swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const next = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imagesData.length);
    };
    timeoutRef.current = setInterval(next, 7000);
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imagesData.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? imagesData.length - 1 : prevIndex - 1
    );
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      nextSlide();
    } else if (distance < -50) {
      prevSlide();
    }
  };

  return (
    <div className="w-full bg-black overflow-hidden relative">
      <Carousel className="relative w-full overflow-hidden">
        <div
          className="
            relative w-full overflow-hidden
            aspect-[16/5]    /* Mobile */
            sm:aspect-[16/8]  
            md:aspect-[16/6]
            lg:aspect-[16/5]
            xl:aspect-[16/5]
          "
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slider track */}
          <CarouselContent
            className="flex"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: "none", // no animation for instant slide change
            }}
          >
            {imagesData.map((image, index) => (
              <CarouselItem key={index} className="w-full h-full flex-shrink-0">
                <img
                  src={image}
                  alt={`banner-${index}`}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                  loading="lazy"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Mobile dots below banner */}
          <div className="sm:hidden flex justify-center items-center gap-2 absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
            {imagesData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${index === currentIndex
                    ? "bg-white w-5 h-1.5"
                    : "bg-gray-500/70 hover:bg-gray-400 w-2 h-2"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
                type="button"
              />
            ))}
          </div>

          {/* 💻 Desktop navigation (side boxes) */}
          <div className="hidden sm:flex absolute top-1/2 left-4 -translate-y-1/2 z-10">
            <div className="flex items-center justify-center bg-black/50 backdrop-blur-md p-3 rounded-full shadow-lg transition hover:bg-black/70">
              <button
                onClick={prevSlide}
                className="text-white hover:text-gray-200 transition"
                aria-label="Previous banner"
                type="button"
              >
                <ChevronLeft size={28} />
              </button>
            </div>
          </div>

          <div className="hidden sm:flex absolute top-1/2 right-4 -translate-y-1/2 z-10">
            <div className="flex items-center justify-center bg-black/50 backdrop-blur-md p-3 rounded-full shadow-lg transition hover:bg-black/70">
              <button
                onClick={nextSlide}
                className="text-white hover:text-gray-200 transition"
                aria-label="Next banner"
                type="button"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>

          {/* Desktop dots below banner */}
          <div className="hidden sm:flex justify-center items-center gap-2 absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            {imagesData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${index === currentIndex
                    ? "bg-white w-7 h-2.5"
                    : "bg-gray-500/70 hover:bg-gray-400 w-2.5 h-2.5"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
                type="button"
              />
            ))}
          </div>
        </div>
      </Carousel>
    </div>
  );
};

export default HeaderDisplay;
