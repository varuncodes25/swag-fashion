import React, { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import banner1 from "../../assets/banner.png";
import banner2 from "../../assets/banner2.png";

const HeaderDisplay = () => {
  const imagesData = [banner1, banner2];
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const next = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imagesData.length);
    };

    timeoutRef.current = setInterval(next, 7000); // Change every 7 seconds

    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [imagesData.length]);

  return (
    <div className="w-screen overflow-hidden">
      <Carousel className=" relative rounded-3xl">
        <div className="relative  sm:h-[100px] md:h-[400px] lg:h-[500px] xl:h-[600px]">

          <CarouselContent className="mrelative w-[100vw] sm:w-[100vw] lg:w-[100vw]  h-[50vw] sm:h-[40vw] md:h-[30vw] lg:h-[25vw] xl:h-[20vw]">
            {imagesData.map((image, index) => (
              <CarouselItem
                key={index}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
              >
                <img
                  src={image}
                  alt={`banner-${index}`}
                  className="w-full h-full object-cover rounded-3xl"
                />
              </CarouselItem>
            ))}
          </CarouselContent>


        </div>
        {/* Optional: manual controls */}
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default HeaderDisplay;
