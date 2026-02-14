import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
  Star
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

  // Icon mapping
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('men') || name.includes('man')) {
      return <Shirt className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={1.5} />;
    } else if (name.includes('women') || name.includes('woman')) {
      return <ShirtIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={1.5} />;
    } else if (name.includes('kids') || name.includes('child')) {
      return <Baby className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={1.5} />;
    } else if (name.includes('collection')) {
      return <Package className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={1.5} />;
    } else if (name.includes('style')) {
      return <StyleIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={1.5} />;
    }
    
    return <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={1.5} />;
  };

  // Simple colors
  const getCategoryColor = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('men')) {
      return "bg-blue-500";
    } else if (name.includes('women')) {
      return "bg-pink-500";
    } else if (name.includes('kids')) {
      return "bg-green-500";
    } else if (name.includes('collection')) {
      return "bg-purple-500";
    } else if (name.includes('style')) {
      return "bg-orange-500";
    }
    
    return "bg-gray-500";
  };

  // Filter categories
  const categoryKeywords = ['men', 'women', 'kids', 'collection', 'style'];
  
  const filteredCategories = categories.filter(cat => 
    categoryKeywords.some(keyword => 
      cat.name.toLowerCase().includes(keyword)
    )
  ).slice(0, 5);

  if (loading) {
    return (
      <section className="py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              Shop by Category
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex-shrink-0 animate-pulse">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200"></div>
                <div className="w-12 h-3 bg-gray-200 rounded mt-2 mx-auto"></div>
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
    <section className="py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
       <div className="text-center mb-6">
  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
    Shop by Category
  </h2>
  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
    Find your perfect style
  </p>
</div>

        {/* Horizontal Scroll Categories */}
        <div className="relative">
          {/* Gradient Overlays */}
          {/* <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div> */}
          
          {/* Scrollable Container */}
          <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 px-2  snap-x snap-mandatory items-center lg:justify-center">
            {filteredCategories.map((category) => {
              const bgColor = getCategoryColor(category.name);
              
              return (
                <Link
                  key={category._id}
                  to={`/category/${category.slug}`}
                  className="flex-shrink-0 snap-center"
                >
                  <div className="flex flex-col items-center">
                    {/* Circular Card */}
                    <div className={`
                      w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
                      rounded-full flex items-center justify-center
                      ${bgColor} text-white
                    `}>
                      {getCategoryIcon(category.name)}
                    </div>

                    {/* Category Name */}
                    <span className="mt-2 text-xs sm:text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* View All Link */}
        {categories.length > 5 && (
          <div className="text-center mt-6">
            <Link
              to="/categories"
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* CSS for scrollbar hiding */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}