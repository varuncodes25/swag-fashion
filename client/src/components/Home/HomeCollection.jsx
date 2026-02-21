import { Link } from "react-router-dom";
import React ,{ useEffect, useState } from "react";
import axios from "axios";
import { 
  ArrowRight, 
  Sparkles,
  Shirt,
  ShirtIcon,
  Baby,
  Package,
  Sparkles as StyleIcon,
  Heart,
  Star,
  Users,
  ShoppingBag,
  
} from "lucide-react";

export default function HomeCollections() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Enhanced icon mapping with more options
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('men') || name.includes('man')) {
      return <Users className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.5} />;
    } else if (name.includes('women') || name.includes('woman')) {
      return <Heart className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.5} />;
    } else if (name.includes('kids') || name.includes('child')) {
      return <Baby className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.5} />;
    } else if (name.includes('collection')) {
      return <Package className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.5} />;
    } else if (name.includes('style')) {
      return <StyleIcon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.5} />;
    }
    
    // Default icon for any other category
    return <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.5} />;
  };
  // Gradient colors for rectangles
  const getCategoryGradient = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    const gradients = [
      "from-blue-500 to-cyan-400",
      "from-purple-500 to-pink-400",
      "from-green-500 to-emerald-400",
      "from-orange-500 to-amber-400",
      "from-red-500 to-rose-400",
      "from-indigo-500 to-purple-400",
      "from-pink-500 to-red-400",
      "from-teal-500 to-green-400",
      "from-yellow-500 to-orange-400",
      "from-gray-700 to-gray-500"
    ];
    
    // Use name length to pick a consistent gradient
    const index = name.length % gradients.length;
    return gradients[index];
  };

  // Filter categories - get top 6 for better grid
  const categoryKeywords = ['men', 'women', 'kids', 'collection', 'style', 'shirt', 'shoe', 'accessory'];
  
  const filteredCategories = categories.filter(cat => 
    categoryKeywords.some(keyword => 
      cat.name.toLowerCase().includes(keyword)
    )
  ).slice(0, 6);

  if (loading) {
    return (
      <section className="py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Shop by Category
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Find your perfect style
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-2 w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (filteredCategories.length === 0) {
    return null;
  }

 return (
    <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 pt-6">
            Shop by Category
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our curated collections and find your perfect style
          </p>
        </div>

        {/* Categories - BUTTON SHAPE */}
     <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
  {filteredCategories.map((category) => {
    const gradient = getCategoryGradient(category.name);
    
    return (
      <Link
        key={category._id}
        to={`/category/${category.slug}`}
        className="group inline-block"
      >
        {/* Button Shape Category - Ultra Thin */}
        <div className={`
          relative px-3 py-1.5 sm:px-4 sm:py-2
          bg-gradient-to-r ${gradient}
          rounded-full shadow-sm hover:shadow-md
          transition-all duration-300 hover:scale-105
          flex items-center gap-1.5 sm:gap-2
          border border-white/30 hover:border-white/40
        `}>
          {/* Icon - Chhota */}
          <div className="text-white">
            {React.cloneElement(getCategoryIcon(category.name), {
              className: "w-4 h-4 sm:w-5 sm:h-5"
            })}
          </div>
          
          {/* Category Name - Patla Font */}
          <span className="text-xs sm:text-sm font-normal text-white tracking-wide">
            {category.name}
          </span>

          {/* Arrow - Very Small */}
          <ArrowRight className="w-3 h-3 text-white/60 group-hover:translate-x-0.5 transition-transform" />

          {/* Subtle Glow */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        </div>
      </Link>
    );
  })}
</div>

        {/* View All Button */}
        {categories.length > 6 && (
          <div className="text-center mt-10">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
            >
              <span>Explore All Categories</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}