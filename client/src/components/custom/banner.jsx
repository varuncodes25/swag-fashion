import React, { useEffect, useRef, useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Zap,
  CheckCircle,
  Sparkles,
  Percent
} from "lucide-react";
import { Link } from "react-router-dom";

// Import banner images
import banner1 from "../../assets/banner.png";
import banner2 from "../../assets/banner2.png";
import banner3 from "../../assets/banner3.png";
import banner4 from "../../assets/banner4.png";
import banner5 from "../../assets/banner5.png";

// Premium banner data
const bannerData = [
  {
    id: 1,
    image: banner1,
    title: "Luxe Collection",
    subtitle: "Premium Redefined",
    description: "Experience unparalleled elegance",
    ctaText: "Explore",
    ctaLink: "/collection/luxe",
    badge: "Exclusive",
    colors: {
      primary: "#B8860B",
      secondary: "#DAA520",
    },
    features: ["Handcrafted", "Premium", "Limited"],
    discount: "60%",
  },  
  {
    id: 2,
    image: banner2,
    title: "Summer Vibes",
    subtitle: "Up to 60% OFF",
    description: "Fresh styles for sunny days",
    ctaText: "Shop Now",
    ctaLink: "/sale/summer",
    badge: "Hot Deal",
    colors: {
      primary: "#FF6B6B",
      secondary: "#4ECDC4",
    },
    features: ["Fast Delivery", "Easy Returns", "Best Price"],
    discount: "60%",
  },
  {
    id: 3,
    image: banner3,
    title: "Tech",
    subtitle: "Next-Gen",
    description: "Cutting-edge technology",
    ctaText: "Discover",
    ctaLink: "/category/electronics",
    badge: "New",
    colors: {
      primary: "#2563EB",
      secondary: "#7C3AED",
    },
    features: ["Latest Tech", "2-Year Warranty", "24/7 Support"],
    discount: "40%",
  },
  {
    id: 4,
    image: banner4,
    title: "Home",
    subtitle: "Comfort & Style",
    description: "Transform your space",
    ctaText: "Shop Home",
    ctaLink: "/category/home",
    badge: "Bestseller",
    colors: {
      primary: "#059669",
      secondary: "#10B981",
    },
    features: ["Eco-Friendly", "Premium", "Modern"],
    discount: "50%",
  },
  {
    id: 5,
    image: banner5,
    title: "Fitness",
    subtitle: "Train Like Pro",
    description: "Professional equipment",
    ctaText: "Get Fit",
    ctaLink: "/category/fitness",
    badge: "Trending",
    colors: {
      primary: "#DC2626",
      secondary: "#EA580C",
    },
    features: ["Premium Build", "Ergonomic", "Best in Class"],
    discount: "45%",
  }
];

const Banner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const currentBanner = bannerData[activeIndex];

  const startAutoSlide = () => {
    stopAutoSlide();
    
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerData.length);
      setProgress(0);
    }, 5000);

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50);
  };

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

  const goToNext = () => {
    stopAutoSlide();
    setActiveIndex((prev) => (prev + 1) % bannerData.length);
    setProgress(0);
    setTimeout(startAutoSlide, 2000);
  };

  const goToPrev = () => {
    stopAutoSlide();
    setActiveIndex((prev) => (prev === 0 ? bannerData.length - 1 : prev - 1));
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
    <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
      <div className="w-full rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl">
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Full Width Image with Overlay */}
          <div className="relative h-[180px] xs:h-[200px] sm:h-[280px] md:h-[350px] lg:h-[450px] xl:h-[500px]">
            {/* Background Image */}
            <img
              src={currentBanner.image}
              alt={currentBanner.title}
              className="w-full h-full object-cover transition-transform duration-1000"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)'
              }}
              draggable={false}
              loading="eager"
            />
            
            {/* Gradient Overlay - Different for mobile/desktop */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent lg:from-black/80 lg:via-black/50" />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                <div className="max-w-[65%] sm:max-w-[60%] md:max-w-[55%] lg:max-w-lg xl:max-w-xl">
                  
                  {/* Badge - Mobile Friendly */}
                  <div className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-500/30 backdrop-blur-sm border border-amber-400/30 mb-1.5 sm:mb-3 animate-fadeLeft">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" />
                    <span className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider">
                      {currentBanner.badge}
                    </span>
                  </div>

                  {/* Title - Smaller on mobile */}
                  <h1 className="text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black mb-0.5 sm:mb-2 text-white leading-tight animate-fadeLeft" style={{animationDelay: '0.1s'}}>
                    {currentBanner.title}
                  </h1>

                  {/* Subtitle - Hidden on very small screens */}
                  <h2 className="hidden xs:block text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold mb-1 sm:mb-2 text-amber-400 animate-fadeLeft" style={{animationDelay: '0.2s'}}>
                    {currentBanner.subtitle}
                  </h2>

                  {/* Description - Hidden on mobile, shown on tablet+ */}
                  <p className="hidden md:block text-xs lg:text-sm xl:text-base text-gray-200 mb-2 lg:mb-3 leading-relaxed max-w-md animate-fadeLeft" style={{animationDelay: '0.3s'}}>
                    {currentBanner.description}
                  </p>

                  {/* Features - Hidden on mobile/tablet, shown on desktop */}
                  <div className="hidden lg:flex gap-3 mb-3 xl:mb-4 animate-fadeLeft" style={{animationDelay: '0.4s'}}>
                    {currentBanner.features.slice(0, 2).map((feature, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button - Compact on mobile */}
                  <div className="flex items-center gap-2 sm:gap-3 animate-fadeLeft" style={{animationDelay: '0.5s'}}>
                    <Link
                      to={currentBanner.ctaLink}
                      className="group relative px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 rounded-full font-bold text-center overflow-hidden text-xs sm:text-sm lg:text-base"
                      style={{
                        backgroundColor: currentBanner.colors.primary,
                        color: 'white'
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-1">
                        {currentBanner.ctaText}
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Discount Badge - Compact */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-md blur-sm" />
                <div className="relative bg-gradient-to-br from-amber-500 to-yellow-400 rounded-md px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-lg">
                  <div className="text-center">
                    <div className="text-[8px] xs:text-[10px] font-bold text-amber-900">OFF</div>
                    <div className="text-xs xs:text-sm sm:text-base font-black text-white">{currentBanner.discount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Discount Badge */}
            <div className="absolute top-4 right-4 hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-lg blur-md" />
                <div className="relative bg-gradient-to-br from-amber-500 to-yellow-400 rounded-lg p-3 shadow-lg">
                  <div className="text-center">
                    <div className="text-xs font-bold text-amber-900 uppercase">OFF</div>
                    <div className="text-2xl font-black text-white mt-1">{currentBanner.discount}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar - Thinner on mobile */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-white/20">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Navigation Controls - Smaller on mobile */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 lg:gap-4 z-20">
            <button
              onClick={goToPrev}
              className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-black/60 transition-all hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" />
            </button>

            <div className="flex gap-1 sm:gap-1.5">
              {bannerData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 ${
                    index === activeIndex
                      ? 'w-4 sm:w-5 lg:w-6 h-1 sm:h-1.5 lg:h-2 bg-gradient-to-r from-amber-400 to-yellow-300'
                      : 'w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-white/50 hover:bg-white/80'
                  } rounded-full`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-black/60 transition-all hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;