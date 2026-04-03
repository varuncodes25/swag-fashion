import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  ArrowRight, 
  Baby,
  Package,
  Heart,
  Users,
  ShoppingBag,
  Sparkles
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

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('men')) return <Users className="w-4 h-4" strokeWidth={1.5} />;
    if (name.includes('women')) return <Heart className="w-4 h-4" strokeWidth={1.5} />;
    if (name.includes('kids')) return <Baby className="w-4 h-4" strokeWidth={1.5} />;
    if (name.includes('collection')) return <Package className="w-4 h-4" strokeWidth={1.5} />;
    if (name.includes('new')) return <Sparkles className="w-4 h-4" strokeWidth={1.5} />;
    
    return <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />;
  };

  const getColors = (name) => {
    const colors = {
      men: "bg-blue-500 hover:bg-blue-600",
      women: "bg-pink-500 hover:bg-pink-600",
      kids: "bg-green-500 hover:bg-green-600",
      collection: "bg-purple-500 hover:bg-purple-600",
      new: "bg-amber-500 hover:bg-amber-600",
    };
    
    const key = Object.keys(colors).find(k => name.toLowerCase().includes(k));
    return colors[key] || "bg-gray-500 hover:bg-gray-600";
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-10 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Modern Pill Buttons */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category._id}
              to={`/category/${category.slug}`}
              className="group relative"
            >
              <div className={`
                relative px-5 py-2.5 md:px-6 md:py-3
                ${getColors(category.name)}
                rounded-full shadow-md
                transition-all duration-300
                hover:shadow-xl hover:-translate-y-0.5
                active:scale-95
                flex items-center gap-2
                overflow-hidden
              `}>
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                
                {/* Icon */}
                <span className="relative z-10 text-white">
                  {getCategoryIcon(category.name)}
                </span>
                
                {/* Text */}
                <span className="relative z-10 text-sm md:text-base font-medium text-white">
                  {category.name}
                </span>
                
                {/* Arrow */}
                <ArrowRight className="relative z-10 w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}