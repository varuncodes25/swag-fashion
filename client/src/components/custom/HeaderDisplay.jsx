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
    <div className="my-10 mx-auto w-[93vw] overflow-hidden">
      <Carousel className="h-[60vh] relative rounded-3xl">
        <CarouselContent className="h-full transition-transform duration-700 ease-in-out">
          {imagesData.map((image, index) => (
            <CarouselItem
              key={index}
              className={`h-full flex-shrink-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0 absolute top-0 left-0 w-full"
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

        {/* Optional: manual controls */}
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default HeaderDisplay;
