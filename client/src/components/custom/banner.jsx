import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// Fallback images (if API fails)
import fallbackBanner1 from "../../assets/banner.png";
import fallbackBanner2 from "../../assets/banner2.png";
import fallbackBanner3 from "../../assets/banner5.png";
import { fetchBanners } from "@/redux/slices/bannerSlice";

const Banner = () => {
  const dispatch = useDispatch();
  const { banners, loading, error } = useSelector((state) => state.banner);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  // Fetch banners on component mount
  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  // Prepare banner data from API
  const bannerData = banners.length > 0 
    ? banners.map((banner) => ({
        id: banner._id,
        desktop: banner.image,
        mobile: banner.image,
        title: banner.title,
        subtitle: banner.subtitle,
        link: banner.link,
        isActive: banner.isActive,
      }))
    : [
        { id: 1, desktop: fallbackBanner1, mobile: fallbackBanner1, title: "Summer Collection", subtitle: "Up to 50% Off", link: "/shop" },
        { id: 2, desktop: fallbackBanner2, mobile: fallbackBanner2, title: "New Arrivals", subtitle: "Shop Latest Styles", link: "/shop" },
        { id: 3, desktop: fallbackBanner3, mobile: fallbackBanner3, title: "Exclusive Deals", subtitle: "Limited Time Offer", link: "/shop" },
      ];

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
    if (bannerData.length <= 1 || isHovered) return;
    
    stopAutoSlide();

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerData.length);
      setProgress(0);
    }, 5000);

    progressRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 50);
  };

  const goToNext = () => {
    if (bannerData.length <= 1) return;
    stopAutoSlide();
    setActiveIndex((prev) => (prev + 1) % bannerData.length);
    setProgress(0);
    startAutoSlide();
  };

  const goToPrev = () => {
    if (bannerData.length <= 1) return;
    stopAutoSlide();
    setActiveIndex((prev) =>
      prev === 0 ? bannerData.length - 1 : prev - 1
    );
    setProgress(0);
    startAutoSlide();
  };

  const goToSlide = (index) => {
    if (bannerData.length <= 1) return;
    stopAutoSlide();
    setActiveIndex(index);
    setProgress(0);
    startAutoSlide();
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [bannerData.length, isHovered]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full px-2 sm:px-4 md:px-6">
        <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse">
          <div className="aspect-[16/9] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[21/9] xl:h-[500px] bg-gradient-to-r from-gray-300 to-gray-200" />
        </div>
      </div>
    );
  }

  // Error or no banners
  if (error || bannerData.length === 0) {
    if (error) console.error('Banner error:', error);
    return null;
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-6">
      <div 
        className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Banner Container */}
        {/* Image with working hover effect */}
<div className="relative w-full h-[200px] sm:h-[200px] md:h-[300px] lg:h-[400px] xl:h-[400px] overflow-hidden">

    <img
  src={currentBanner?.desktop}
  alt="banner"
  className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-110"
  draggable={false}
  onError={(e) => {
    e.target.src = fallbackBanner1;
  }}
/>
  {/* Gradient Overlay - pointer-events-none se hover block nahi karega */}
  {/* <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent pointer-events-none" /> */}
</div>

        {/* Progress Bar */}
        {bannerData.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Navigation Arrows */}
        {bannerData.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-3 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 md:p-3 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 md:p-3 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {bannerData.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-2.5 md:gap-3 z-20">
            {bannerData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === activeIndex
                    ? "w-8 sm:w-10 md:w-12 h-1.5 sm:h-2 bg-yellow-500"
                    : "w-2 h-2 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slide Counter */}
        {bannerData.length > 1 && (
          <div className="absolute top-4 sm:top-5 md:top-6 right-4 sm:right-5 md:right-6 bg-black/50 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm font-medium">
            {String(activeIndex + 1).padStart(2, '0')} / {String(bannerData.length).padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;

// Add these animations to your global CSS or tailwind config
// For tailwind.config.js add these animations:
/*
extend: {
  keyframes: {
    'fade-in': {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' }
    },
    'slide-up': {
      '0%': { opacity: '0', transform: 'translateY(30px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' }
    }
  },
  animation: {
    'fade-in': 'fade-in 0.5s ease-out',
    'slide-up': 'slide-up 0.6s ease-out',
    'slide-up-delay': 'slide-up 0.6s ease-out 0.2s both',
    'slide-up-delay-2': 'slide-up 0.6s ease-out 0.4s both'
  }
}
*/