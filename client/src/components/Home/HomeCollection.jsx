import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  ArrowRight, 
  Baby,
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
    if (name.includes('men')) return <Users className="w-3.5 h-3.5" />;
    if (name.includes('women')) return <Heart className="w-3.5 h-3.5" />;
    if (name.includes('kids')) return <Baby className="w-3.5 h-3.5" />;
    if (name.includes('new')) return <Sparkles className="w-3.5 h-3.5" />;
    return <ShoppingBag className="w-3.5 h-3.5" />;
  };

  const getColor = (name) => {
    const colors = {
      men: "bg-primary hover:bg-primary/90",
      women: "bg-primary/100 hover:bg-primary",
      kids: "bg-emerald-500 hover:bg-emerald-600",
      new: "bg-highlight hover:bg-amber-600",
    };
    const key = Object.keys(colors).find(k => name.toLowerCase().includes(k));
    return colors[key] || "bg-gray-500 hover:bg-gray-600";
  };

  if (loading || categories.length === 0) return null;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category._id}
              to={`/category/${category.slug}`}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2
                ${getColor(category.name)}
                rounded-full text-xs font-medium text-white
                transition-all duration-200
                hover:scale-105 hover:shadow-md
                active:scale-95
              `}
            >
              {getCategoryIcon(category.name)}
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}