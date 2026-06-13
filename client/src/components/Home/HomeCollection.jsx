import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Baby, Heart, Users } from "lucide-react";
import {
  HOME_SECTION_CLASS,
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

const genderStyles = {
  women: {
    icon: Heart,
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200/80 dark:border-rose-800/50",
    iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400",
    text: "text-rose-700 dark:text-rose-300",
  },
  kids: {
    icon: Baby,
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200/80 dark:border-emerald-800/50",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  men: {
    icon: Users,
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200/80 dark:border-sky-800/50",
    iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400",
    text: "text-sky-700 dark:text-sky-300",
  },
};

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
    <section className={`${HOME_SECTION_CLASS} py-5 sm:py-6 ${HOME_SECTION_TOP_DIVIDER}`}>
      <div className={HOME_SECTION_CONTAINER}>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {categoryList.map((category) => {
            const genderKey = getGenderKey(category.name);
            const style = genderStyles[genderKey] || genderStyles.men;
            const Icon = style.icon;

            return (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className={`group flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition-all active:scale-[0.98] sm:gap-2 sm:px-3 sm:py-3 ${style.bg} ${style.border} hover:shadow-sm`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10 ${style.iconBg}`}
                >
                  <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                </div>
                <span
                  className={`text-center text-[11px] font-semibold leading-tight sm:text-xs ${style.text}`}
                >
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
