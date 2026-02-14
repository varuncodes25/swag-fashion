import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  ArrowRight, 
  Sparkles,
  User,
  Users,
  Baby,
  UserCheck,
  UserCircle,
  UserSquare,
  UserRound,
  UserRoundCheck,
  UserRoundCog,
  Star,
  Heart
} from "lucide-react";

export default function HomeCollections() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/categories`
        );
        setCategories(res.data);
      } catch (error) {
        console.error("Error fetching categories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Human figure icons mapping based on category name
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    const iconMap = {
      // मेन/पुरुष के लिए
      men: <User className="w-14 h-14" />,
      man: <User className="w-14 h-14" />,
      boys: <UserSquare className="w-14 h-14" />,
      
      // वुमन/महिलाओं के लिए
      women: <UserRound className="w-14 h-14" />,
      woman: <UserRound className="w-14 h-14" />,
      girls: <UserCircle className="w-14 h-14" />,
      
      // किड्स/बच्चों के लिए
      kids: <Baby className="w-14 h-14" />,
      children: <Baby className="w-14 h-14" />,
      baby: <Baby className="w-14 h-14" />,
      
      // यूनिसेक्स/मिक्स्ड के लिए
      unisex: <Users className="w-14 h-14" />,
      family: <Users className="w-14 h-14" />,
      couple: <UserCheck className="w-14 h-14" />,
      
      // अन्य के लिए
      premium: <UserRoundCheck className="w-14 h-14" />,
      exclusive: <UserRoundCog className="w-14 h-14" />,
      featured: <UserSquare className="w-14 h-14" />,
    };

    return iconMap[name] || <Users className="w-14 h-14" />;
  };

  // Enhanced color mapping with better gradients
  const getCategoryColors = (categoryName, index) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('men') || name.includes('man') || name.includes('boys')) {
      return {
        bg: "bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400",
        hover: "bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500",
        text: "text-blue-600",
        border: "border-blue-200",
        shadow: "shadow-blue-200/40",
        light: "bg-blue-50"
      };
    } else if (name.includes('women') || name.includes('woman') || name.includes('girls')) {
      return {
        bg: "bg-gradient-to-br from-pink-600 via-pink-500 to-pink-400",
        hover: "bg-gradient-to-br from-pink-700 via-pink-600 to-pink-500",
        text: "text-pink-600",
        border: "border-pink-200",
        shadow: "shadow-pink-200/40",
        light: "bg-pink-50"
      };
    } else if (name.includes('kids') || name.includes('children') || name.includes('baby')) {
      return {
        bg: "bg-gradient-to-br from-green-600 via-green-500 to-green-400",
        hover: "bg-gradient-to-br from-green-700 via-green-600 to-green-500",
        text: "text-green-600",
        border: "border-green-200",
        shadow: "shadow-green-200/40",
        light: "bg-green-50"
      };
    } else {
      const colors = [
        {
          bg: "bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400",
          hover: "bg-gradient-to-br from-purple-700 via-purple-600 to-purple-500",
          text: "text-purple-600",
          border: "border-purple-200",
          shadow: "shadow-purple-200/40",
          light: "bg-purple-50"
        },
        {
          bg: "bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400",
          hover: "bg-gradient-to-br from-orange-700 via-orange-600 to-orange-500",
          text: "text-orange-600",
          border: "border-orange-200",
          shadow: "shadow-orange-200/40",
          light: "bg-orange-50"
        },
        {
          bg: "bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400",
          hover: "bg-gradient-to-br from-teal-700 via-teal-600 to-teal-500",
          text: "text-teal-600",
          border: "border-teal-200",
          shadow: "shadow-teal-200/40",
          light: "bg-teal-50"
        },
      ];
      return colors[index % colors.length];
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-6 shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg">
              Loading categories...
            </p>
          </div>
          <div className="flex justify-center gap-10">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="w-28 h-4 bg-gray-200 rounded mt-6 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  // Get first 5 categories
  const displayedCategories = categories.slice(0, 5);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-14">

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-6">
            Discover our curated collections designed for every lifestyle
          </p>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full shadow-sm"></div>
        </div>

        {/* Enhanced Circular Categories */}
        <div className="flex justify-center flex-wrap gap-10 lg:gap-14">
          {displayedCategories.map((category, index) => {
            const colors = getCategoryColors(category.name, index);
            
            return (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="group relative"
                onMouseEnter={() => setHoveredCategory(category._id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {/* Circular Card Container */}
                <div className="relative">
                  {/* Outer Glow Effect */}
                  <div className={`absolute inset-0 rounded-full ${colors.bg} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-700`}></div>
                  
                  {/* Circular Card */}
                  <div 
                    className={`
                      relative w-44 h-44 rounded-full 
                      flex items-center justify-center
                      shadow-2xl transition-all duration-500
                      transform ${hoveredCategory === category._id ? 'scale-110 -translate-y-4' : ''}
                      ${hoveredCategory === category._id ? colors.hover : colors.bg}
                      border-8 ${colors.border}
                      ${hoveredCategory === category._id ? `shadow-3xl ${colors.shadow}` : ''}
                      overflow-hidden
                    `}
                  >
                    {/* Icon Container */}
                    <div className={`
                      text-white transition-all duration-700
                      ${hoveredCategory === category._id ? 'scale-125 rotate-6' : ''}
                    `}>
                      {getCategoryIcon(category.name)}
                    </div>
                    
                    {/* Shine Effect on Hover */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                      translate-x-[-100%] group-hover:translate-x-[100%]
                      transition-transform duration-1000
                    `}></div>

                    {/* Sparkle Effect */}
                    {hoveredCategory === category._id && (
                      <>
                        <div className="absolute top-3 left-3">
                          <Star className="w-4 h-4 text-white/80 animate-bounce" />
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <Heart className="w-4 h-4 text-white/80 animate-pulse" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Category Label */}
                  <div className="mt-8 text-center relative">
                    <div className={`absolute inset-0 ${colors.light} rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                    <span className={`
                      relative font-bold text-xl transition-all duration-300
                      ${hoveredCategory === category._id ? colors.text : 'text-gray-900'}
                      ${hoveredCategory === category._id ? 'tracking-wide' : ''}
                      px-6 py-3 rounded-full inline-block
                    `}>
                      {category.name}
                    </span>
                    
                    {/* Product Count */}
                    {category.productCount && (
                      <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm">
                        <span className="text-sm font-medium text-gray-600">
                          {category.productCount} products
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Animated Arrow */}
                  <div className={`
                    absolute -bottom-8 left-1/2 -translate-x-1/2
                    opacity-0 group-hover:opacity-100
                    transition-all duration-500 transform
                    ${hoveredCategory === category._id ? 'translate-y-0 animate-bounce' : 'translate-y-4'}
                  `}>
                    <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Enhanced View All Link */}
        {categories.length > 5 && (
          <div className="text-center mt-16 relative">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <Link
              to="/categories"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-900 to-black text-white font-bold rounded-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-xl"
            >
              <span>Explore All Categories</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}