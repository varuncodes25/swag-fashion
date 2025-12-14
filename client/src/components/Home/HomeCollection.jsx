import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

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

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading categories...
      </div>
    );
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-10">
        Shop by Category
      </h2>

      <div className="flex justify-center">
        <div className="flex gap-8 overflow-x-auto px-6 scrollbar-hide">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/category/${category.slug}`}
              className="
                min-w-[260px] bg-white rounded-2xl
                shadow-md hover:shadow-2xl
                transition-all duration-300
                block
              "
            >
              {/* Image */}
              <div className="h-48 overflow-hidden rounded-t-2xl">
                <img
                  src={category.image?.url}
                  alt={category.name}
                  className="h-full w-full object-cover hover:scale-105 transition"
                />
              </div>

              {/* Text */}
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold">
                  {category.name}
                </h3>
                <span className="text-sm text-gray-500">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
