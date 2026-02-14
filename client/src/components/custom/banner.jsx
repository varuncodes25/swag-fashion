import React, { useEffect, useRef, useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Zap,
  CheckCircle
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
    description: "Experience unparalleled elegance with our exclusive designer pieces",
    ctaText: "Explore Luxury",
    ctaLink: "/collection/luxe",
    badge: "Exclusive",
    colors: {
      primary: "#B8860B",
      secondary: "#DAA520",
    },
    features: ["Handcrafted Details", "Premium Materials", "Limited Edition"],
    discount: "60%",
  },  
  {
    id: 2,
    image: banner2,
    title: "Summer Vibes",
    subtitle: "Up to 60% OFF",
    description: "Fresh styles for sunny days",
    ctaText: "Shop Summer",
    ctaLink: "/sale/summer",
    badge: "Hot Deal",
    colors: {
      primary: "#FF6B6B",
      secondary: "#4ECDC4",
    },
    features: ["Fast Delivery", "Easy Returns", "Best Price Guarantee"],
    discount: "60%",
  },
  {
    id: 3,
    image: banner3,
    title: "Tech Revolution",
    subtitle: "Next-Gen Innovation",
    description: "Cutting-edge technology for the modern lifestyle",
    ctaText: "Discover Tech",
    ctaLink: "/category/electronics",
    badge: "New",
    colors: {
      primary: "#2563EB",
      secondary: "#7C3AED",
    },
    features: ["Latest Technology", "2-Year Warranty", "24/7 Support"],
    discount: "40%",
  },
  {
    id: 4,
    image: banner4,
    title: "Home Sanctuary",
    subtitle: "Comfort & Style",
    description: "Transform your space with our premium home collection",
    ctaText: "Shop Home",
    ctaLink: "/category/home",
    badge: "Bestseller",
    colors: {
      primary: "#059669",
      secondary: "#10B981",
    },
    features: ["Eco-Friendly", "Premium Quality", "Modern Designs"],
    discount: "50%",
  },
  {
    id: 5,
    image: banner5,
    title: "Fitness Elite",
    subtitle: "Train Like a Champion",
    description: "Professional equipment for your fitness transformation",
    ctaText: "Get Fit",
    ctaLink: "/category/fitness",
    badge: "Trending",
    colors: {
      primary: "#DC2626",
      secondary: "#EA580C",
    },
    features: ["Premium Build", "Ergonomic Design", "Best in Class"],
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

  // Enhanced auto slide with smooth transitions
  const startAutoSlide = () => {
    stopAutoSlide();
    
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerData.length);
      setProgress(0);
    }, 5500);

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 55);
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
    <div className="w-full">
      {/* Main Hero Banner - Full Width */}
      <div className="w-full px-0">
        <div 
          className="relative overflow-hidden shadow-2xl bg-transparent"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Banner Content */}
          <div className="relative h-[500px] lg:h-[600px] flex flex-col lg:flex-row bg-transparent">
            
            {/* Left Content - Text & CTA (20% width) */}
            <div className="lg:w-1/5 p-6 lg:p-8 xl:p-10 flex flex-col justify-center text-gray-800 z-10 bg-white/80 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-0">
              
              {/* Flash Badge */}
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-900 w-fit mb-4">
                <Zap className="w-3 h-3" />
                <span className="text-xs font-bold">
                  {currentBanner.badge}
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black mb-3 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {currentBanner.title}
              </h1>

              {/* Subtitle */}
              <h2 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-4 text-gray-800">
                {currentBanner.subtitle}
              </h2>

              {/* Description */}
              <p className="text-sm lg:text-base xl:text-lg mb-6 text-gray-700 leading-relaxed">
                {currentBanner.description}
              </p>

              {/* Premium Features */}
              <div className="mb-8 space-y-1.5">
                {currentBanner.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs lg:text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button and Discount Badge - Side by Side */}
              <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
                {/* CTA Button */}
                <Link
                  to={currentBanner.ctaLink}
                  className="group relative px-6 py-3 rounded-full font-bold text-center overflow-hidden w-full lg:w-auto"
                  style={{
                    backgroundColor: currentBanner.colors.primary,
                    color: 'white'
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm lg:text-base">
                    {currentBanner.ctaText}
                    <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                </Link>

                {/* Discount Badge - Side by Side */}
                <div className="relative w-full lg:w-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-lg blur-md opacity-60" />
                  <div className="relative bg-gradient-to-br from-amber-500 to-yellow-400 rounded-lg p-3 shadow-lg">
                    <div className="text-center">
                      <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Limited Offer
                      </div>
                      <div className="text-2xl font-black text-white mt-1 drop-shadow-lg">
                        {currentBanner.discount}
                      </div>
                      <div className="text-xs font-bold text-amber-900 mt-0.5">
                        OFF
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Image Only (80% width) */}
            <div className="lg:w-4/5 relative">
              <div className="relative h-full w-full overflow-hidden">
                <img
                  src={currentBanner.image}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover transition-transform duration-700"
                  style={{
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                  }}
                  draggable={false}
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Combined Navigation Controls - All in one line */}
          <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            {/* Left Arrow */}
            <button
              onClick={goToPrev}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-xl hover:bg-black/50 transition-all z-20 group"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Slide Indicators */}
            <div className="flex gap-2">
              {bannerData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 ${
                    index === activeIndex
                      ? 'w-8 bg-gradient-to-r from-amber-400 to-yellow-300'
                      : 'w-2 bg-white/60 hover:bg-white/80 hover:w-3'
                  } h-2 rounded-full`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={goToNext}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-xl hover:bg-black/50 transition-all z-20 group"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;