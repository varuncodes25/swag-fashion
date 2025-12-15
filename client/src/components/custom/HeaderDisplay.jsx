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
import banner4 from "../../assets/banner4.png";
import banner5 from "../../assets/banner5.png";

const banners = [banner1, banner2, banner3, banner4, banner5];

/* LG SCREEN CHECK */
const useIsLg = () => {
  const [isLg, setIsLg] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const resize = () => setIsLg(window.innerWidth >= 1024);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return isLg;
};

const HeaderDisplay = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const isLg = useIsLg();
  const timerRef = useRef(null);

  /* START AUTO SLIDE */
  const startAuto = () => {
    stopAuto();
    timerRef.current = setInterval(() => {
      setActiveIndex((p) => (p + 1) % banners.length);
    }, 6500);
  };

  /* STOP AUTO SLIDE */
  const stopAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, []);

  /* BUTTON HANDLERS */
  const prev = () => {
    stopAuto();
    setActiveIndex((p) => (p === 0 ? banners.length - 1 : p - 1));
    setTimeout(startAuto, 1800);
  };

  const next = () => {
    stopAuto();
    setActiveIndex((p) => (p + 1) % banners.length);
    setTimeout(startAuto, 1800);
  };

  /* LG: active + next 2 */
  const visibleBanners = isLg
    ? [
        banners[activeIndex],
        banners[(activeIndex + 1) % banners.length],
        banners[(activeIndex + 2) % banners.length],
      ]
    : banners;

  return (
    <div className="w-full px-4">
      <div className="relative rounded-2xl p-4 overflow-hidden bg-[#e5e2de]">
        <Carousel>
          <CarouselContent className={`flex h-[460px] ${isLg ? "gap-5" : ""}`}>
            {visibleBanners.map((img, index) => {
              const isActive = isLg ? index === 0 : index === activeIndex;

              return (
                <CarouselItem
                  key={index}
                  className={`
                    h-full flex-shrink-0 origin-left
                    transition-[flex-basis,transform]
                    duration-[1700ms]
                    ease-[cubic-bezier(0.18,1,0.25,1)]
                    ${
                      isLg
                        ? isActive
                          ? "basis-[80%] translate-x-0"
                          : "basis-[10%] translate-x-[7%]"
                        : "basis-full"
                    }
                  `}
                >
                  <div
                    className={`
                      w-full h-full rounded-xl overflow-hidden
                      transition-[opacity,box-shadow,transform]
                      duration-700 ease-out
                      ${
                        isLg && isActive
                          ? "opacity-100 shadow-[0_35px_70px_-18px_rgba(0,0,0,0.45)] scale-[1.02]"
                          : isLg
                          ? "opacity-65 scale-[0.96]"
                          : ""
                      }
                    `}
                  >
                    <img
                      src={img}
                      alt="banner"
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* ARROWS */}
        <button
          onClick={prev}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full z-10"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={next}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full z-10"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default HeaderDisplay;
