import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Baby, Heart, Users } from "lucide-react";
import {
  HOME_SECTION_COMPACT,
  HOME_SECTION_CONTAINER,
  HOME_SECTION_TOP_DIVIDER,
} from "./homeSectionStyles";

function normalizeCategories(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.categories)) return data.categories;
  return [];
}

const GENDER_ORDER = ["women", "kids", "men"];

function getCategoryIcon(categoryName) {
  const name = categoryName.toLowerCase();
  if (name.includes("men")) return <Users className="h-3.5 w-3.5" />;
  if (name.includes("women")) return <Heart className="h-3.5 w-3.5" />;
  if (name.includes("kids")) return <Baby className="h-3.5 w-3.5" />;
  return <Users className="h-3.5 w-3.5" />;
}

function getColor(name) {
  const colors = {
    men: "bg-primary hover:bg-primary/90",
    women: "bg-primary hover:bg-primary/90",
    kids: "bg-emerald-500 hover:bg-emerald-600",
  };
  const key = Object.keys(colors).find((k) => name.toLowerCase().includes(k));
  return colors[key] || "bg-gray-500 hover:bg-gray-600";
}

function getGenderKey(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("women") || lower.includes("woman")) return "women";
  if (lower.includes("kid")) return "kids";
  if (lower.includes("men") || lower.includes("man")) return "men";
  return null;
}

function sortGenderCategories(categories) {
  return [...categories].sort((a, b) => {
    const aKey = getGenderKey(a.name);
    const bKey = getGenderKey(b.name);
    const aIdx = aKey ? GENDER_ORDER.indexOf(aKey) : 99;
    const bIdx = bKey ? GENDER_ORDER.indexOf(bKey) : 99;
    return aIdx - bIdx;
  });
}

export default function HomeCollections() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/categories`,
        );
        setCategories(normalizeCategories(res.data));
      } catch (error) {
        console.error("Error fetching categories", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const categoryList = sortGenderCategories(
    Array.isArray(categories) ? categories : [],
  ).slice(0, 3);

  if (loading || categoryList.length === 0) return null;

  return (
    <section className={`${HOME_SECTION_COMPACT} ${HOME_SECTION_TOP_DIVIDER}`}>
      <div className={HOME_SECTION_CONTAINER}>
        <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-2.5">
          {categoryList.map((category) => (
            <Link
              key={category._id}
              to={`/category/${category.slug}`}
              className={`
                inline-flex shrink-0 items-center justify-center gap-1.5
                rounded-full px-3 py-1.5
                text-[11px] font-medium text-white sm:text-xs
                transition-all duration-200
                hover:scale-105 hover:shadow-md
                active:scale-95
                ${getColor(category.name)}
              `}
            >
              {getCategoryIcon(category.name)}
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
