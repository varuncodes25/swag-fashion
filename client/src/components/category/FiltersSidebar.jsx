import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  ChevronUp,
  Star,
  Filter,
  IndianRupee,
  Percent,
  Palette,
  Ruler,
  Tag,
  LayoutGrid,
  Shirt,
  Sparkles,
  Baby,
  ShoppingBag,
  Moon,
  Sun,
  X,
} from "lucide-react";

export default function FiltersSidebar({ selectedFilters = {}, updateFilter }) {
  const { slug, subSlug } = useParams();
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(slug);
  const [customMinPrice, setCustomMinPrice] = useState("");
  const [customMaxPrice, setCustomMaxPrice] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  /* ================= TOGGLE DARK MODE ================= */
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Initialize dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(res.data);
      setOpenCategory(slug);
    };
    fetchCategories();
  }, [slug]);

  /* ================= APPLY CUSTOM PRICE ================= */
  const applyCustomPrice = () => {
    if (customMinPrice || customMaxPrice) {
      const priceValue = `${customMinPrice || "0"}-${customMaxPrice || "999999"}`;
      updateFilter("priceRange", priceValue);
    }
  };

  /* ================= CLEAR ALL FILTERS ================= */
  const clearAllFilters = () => {
    const keys = Object.keys(selectedFilters);
    keys.forEach((key) => {
      if (selectedFilters[key] && selectedFilters[key].length > 0) {
        selectedFilters[key].forEach((value) => {
          updateFilter(key, value);
        });
      }
    });
    setCustomMinPrice("");
    setCustomMaxPrice("");
  };

  // Helper functions with dark mode support
  const getCategoryIcon = (slug, isActive = false) => {
    const iconProps = { size: 16 };

    if (isActive) {
      iconProps.className = getIconColor(slug, true, darkMode);
    } else {
      iconProps.className = darkMode ? "text-gray-400" : "text-gray-600";
    }

    switch (slug) {
      case "men":
        return <Shirt {...iconProps} />;
      case "women":
        return <Sparkles {...iconProps} />;
      case "kids":
        return <Baby {...iconProps} />;
      case "collections":
        return <Star {...iconProps} />;
      case "style":
        return <Palette {...iconProps} />;
      default:
        return <ShoppingBag {...iconProps} />;
    }
  };

  const getIconColor = (slug, isActive, isDark) => {
    if (!isActive) return isDark ? "text-gray-400" : "text-gray-600";

    switch (slug) {
      case "men":
        return isDark ? "text-blue-400" : "text-blue-600";
      case "women":
        return isDark ? "text-pink-400" : "text-pink-600";
      case "kids":
        return isDark ? "text-green-400" : "text-green-600";
      case "collections":
        return isDark ? "text-yellow-400" : "text-yellow-600";
      case "style":
        return isDark ? "text-purple-400" : "text-purple-600";
      default:
        return isDark ? "text-gray-400" : "text-gray-600";
    }
  };

  const getBgColor = (slug, isActive, isDark) => {
    if (!isActive) return isDark ? "bg-gray-800" : "bg-gray-100";

    switch (slug) {
      case "men":
        return isDark ? "bg-blue-900/30" : "bg-blue-100";
      case "women":
        return isDark ? "bg-pink-900/30" : "bg-pink-100";
      case "kids":
        return isDark ? "bg-green-900/30" : "bg-green-100";
      case "collections":
        return isDark ? "bg-yellow-900/30" : "bg-yellow-100";
      case "style":
        return isDark ? "bg-purple-900/30" : "bg-purple-100";
      default:
        return isDark ? "bg-gray-800" : "bg-gray-100";
    }
  };

  const getActiveGradient = (slug, isDark) => {
    const darkBase = "border-gray-700";
    const lightBase = "border-gray-200";
    
    if (isDark) {
      switch (slug) {
        case "men":
          return `${darkBase} bg-gradient-to-r from-blue-900/20 to-blue-800/10`;
        case "women":
          return `${darkBase} bg-gradient-to-r from-pink-900/20 to-pink-800/10`;
        case "kids":
          return `${darkBase} bg-gradient-to-r from-green-900/20 to-green-800/10`;
        case "collections":
          return `${darkBase} bg-gradient-to-r from-yellow-900/20 to-yellow-800/10`;
        case "style":
          return `${darkBase} bg-gradient-to-r from-purple-900/20 to-purple-800/10`;
        default:
          return `${darkBase} bg-gradient-to-r from-gray-800 to-gray-900/50`;
      }
    } else {
      switch (slug) {
        case "men":
          return "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50";
        case "women":
          return "border-pink-200 bg-gradient-to-r from-pink-50 to-pink-100/50";
        case "kids":
          return "border-green-200 bg-gradient-to-r from-green-50 to-green-100/50";
        case "collections":
          return "border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100/50";
        case "style":
          return "border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100/50";
        default:
          return "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50";
      }
    }
  };

  // Color classes for dark mode
  const getColorClass = (color, isDark) => {
    if (isDark) {
      switch (color) {
        case "from-green-50 to-green-100": return "from-green-900/30 to-green-800/20";
        case "from-blue-50 to-blue-100": return "from-blue-900/30 to-blue-800/20";
        case "from-purple-50 to-purple-100": return "from-purple-900/30 to-purple-800/20";
        case "from-orange-50 to-orange-100": return "from-orange-900/30 to-orange-800/20";
        case "from-pink-50 to-pink-100": return "from-pink-900/30 to-pink-800/20";
        case "from-red-50 to-red-100": return "from-red-900/30 to-red-800/20";
        case "from-gray-50 to-white": return "from-gray-800 to-gray-900";
        case "from-yellow-50 to-amber-50": return "from-yellow-900/20 to-amber-900/10";
        case "from-blue-50 to-indigo-50": return "from-blue-900/20 to-indigo-900/10";
        default: return color;
      }
    }
    return color;
  };

  return (
    <div className={`
      w-72 rounded-2xl shadow-lg sticky top-5 h-[85vh] flex flex-col
      transition-colors duration-300
      ${darkMode 
        ? "bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700" 
        : "bg-gradient-to-b from-white to-gray-50 border-gray-200"
      } border
    `}>
      {/* ================= FIXED HEADER ================= */}
      <div className={`
        p-2 flex-shrink-0 transition-colors duration-300
        ${darkMode ? "border-gray-700" : "border-gray-300"}
        border-b
      `}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Filter size={20} className="text-white" />
            </div>
            <div>
              <h2 className={`
                text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent
                ${darkMode 
                  ? "from-gray-100 to-gray-300" 
                  : "from-gray-900 to-gray-700"
                }
              `}>
                Filters
              </h2>
              <p className={`
                text-xs transition-colors duration-300
                ${darkMode ? "text-gray-400" : "text-gray-500"}
              `}>
                Refine your search
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`
                p-2 rounded-full transition-all duration-300
                ${darkMode 
                  ? "bg-gray-700 text-yellow-300 hover:bg-gray-600" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={clearAllFilters}
              className={`
                text-sm font-medium px-3 py-1 rounded-full transition-all
                ${darkMode 
                  ? "text-red-400 hover:text-red-300 hover:bg-red-900/30" 
                  : "text-red-500 hover:text-red-700 hover:bg-red-50"
                }
              `}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* ================= SCROLLABLE FILTERS CONTENT ================= */}
      <div className={`
        flex-1 overflow-y-auto p-5 space-y-5 transition-colors duration-300
        ${darkMode ? "text-gray-200" : ""}
      `}>
        {/* CATEGORIES */}
        <FilterSection
          title="Categories"
          icon={<LayoutGrid size={18} className={darkMode ? "text-blue-400" : "text-blue-600"} />}
          defaultOpen={true}
          darkMode={darkMode}
        >
          <div className="space-y-2">
            {categories.map((cat) => {
              const isOpen = openCategory === cat.slug;
              const isActiveCategory = slug === cat.slug;

              return (
                <div key={cat.slug} className="group">
                  {/* CATEGORY BUTTON */}
                  <button
                    onClick={() => setOpenCategory(isOpen ? null : cat.slug)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-xl
                      transition-all duration-300
                      ${isActiveCategory
                        ? `${getActiveGradient(cat.slug, darkMode)} border shadow-sm`
                        : darkMode
                          ? "bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600"
                          : "bg-white hover:bg-gray-50 border border-gray-100 hover:border-gray-200"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${getBgColor(cat.slug, isActiveCategory, darkMode)}`}
                      >
                        {getCategoryIcon(cat.slug, isActiveCategory, darkMode)}
                      </div>
                      <span
                        className={`
                          font-medium transition-colors duration-300
                          ${isActiveCategory
                            ? {
                                men: darkMode ? "text-blue-400" : "text-blue-700",
                                women: darkMode ? "text-pink-400" : "text-pink-700",
                                kids: darkMode ? "text-green-400" : "text-green-700",
                                collections: darkMode ? "text-yellow-400" : "text-yellow-700",
                                style: darkMode ? "text-purple-400" : "text-purple-700",
                              }[cat.slug]
                            : darkMode ? "text-gray-200" : "text-gray-800"
                          }
                        `}
                      >
                        {cat.name}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`
                        transition-all duration-300
                        ${isOpen ? "rotate-180" : ""}
                        ${isActiveCategory 
                          ? getIconColor(cat.slug, true, darkMode)
                          : darkMode ? "text-gray-400" : "text-gray-400"
                        }
                      `}
                    />
                  </button>

                  {/* SUBCATEGORIES */}
                  {isOpen && (
                    <div className={`
                      ml-10 mt-2 space-y-1.5 pl-4 transition-colors duration-300
                      ${darkMode ? "border-gray-600" : "border-blue-100"}
                      border-l-2
                    `}>
                      {cat.subCategories.map((sub) => {
                        const isActiveSub = subSlug === sub.slug;

                        return (
                          <Link
                            key={sub.slug}
                            to={`/category/${cat.slug}/${sub.slug}`}
                            className={`
                              flex items-center gap-2 p-2 rounded-lg text-sm
                              transition-all duration-200
                              ${isActiveSub
                                ? darkMode
                                  ? "bg-blue-900/30 text-blue-400 font-medium"
                                  : "bg-blue-100 text-blue-700 font-medium"
                                : darkMode
                                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              }
                            `}
                          >
                            <div
                              className={`
                                w-1.5 h-1.5 rounded-full transition-colors duration-300
                                ${isActiveSub
                                  ? darkMode ? "bg-blue-500" : "bg-blue-500"
                                  : darkMode ? "bg-gray-600" : "bg-gray-300"
                                }
                              `}
                            ></div>
                            <span>{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FilterSection>

        {/* PRICE RANGE */}
        <FilterSection
          title="Price Range"
          icon={<IndianRupee size={18} className={darkMode ? "text-gray-300" : ""} />}
          defaultOpen={true}
          darkMode={darkMode}
        >
          <div className="space-y-4">
            {/* QUICK PRICE OPTIONS */}
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Under ₹500",
                  value: "0-500",
                  color: "from-green-50 to-green-100",
                },
                {
                  label: "₹500-₹1k",
                  value: "500-1000",
                  color: "from-blue-50 to-blue-100",
                },
                {
                  label: "₹1k-₹2k",
                  value: "1000-2000",
                  color: "from-purple-50 to-purple-100",
                },
                {
                  label: "₹2k-₹5k",
                  value: "2000-5000",
                  color: "from-orange-50 to-orange-100",
                },
                {
                  label: "₹5k-₹10k",
                  value: "5000-10000",
                  color: "from-pink-50 to-pink-100",
                },
                {
                  label: "₹10k+",
                  value: "10000-999999",
                  color: "from-red-50 to-red-100",
                },
              ].map((option) => {
                const isChecked = selectedFilters.priceRange?.includes(
                  option.value,
                );
                const colorClass = getColorClass(option.color, darkMode);

                return (
                  <button
                    key={option.value}
                    onClick={() => updateFilter("priceRange", option.value)}
                    className={`
                      p-3 rounded-xl border text-sm font-medium text-center
                      transition-all duration-200
                      ${isChecked
                        ? `bg-gradient-to-r ${colorClass} border-transparent shadow-sm ${darkMode ? "text-gray-100" : "text-gray-900"}`
                        : darkMode
                          ? "bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-500 hover:shadow-lg"
                          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* CUSTOM PRICE INPUT */}
            <div className={`
              p-4 rounded-xl border transition-colors duration-300
              ${darkMode 
                ? "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700" 
                : "bg-gradient-to-r from-gray-50 to-white border-gray-200"
              }
            `}>
              <h4 className={`
                text-sm font-medium mb-3 flex items-center gap-2 transition-colors duration-300
                ${darkMode ? "text-gray-300" : "text-gray-800"}
              `}>
                <Tag size={16} className={darkMode ? "text-blue-400" : "text-blue-500"} />
                Custom Price Range
              </h4>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <div className="relative">
                    <span className={`
                      absolute left-3 top-1/2 transform -translate-y-1/2 font-medium
                      ${darkMode ? "text-gray-400" : "text-gray-500"}
                    `}>
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Min"
                      className={`
                        w-full pl-10 pr-3 py-2.5 rounded-lg text-sm focus:outline-none
                        transition-colors duration-300
                        ${darkMode
                          ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                        } border
                      `}
                      value={customMinPrice}
                      onChange={(e) => setCustomMinPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className={darkMode ? "text-gray-500" : "text-gray-400"}>-</div>
                <div className="flex-1">
                  <div className="relative">
                    <span className={`
                      absolute left-3 top-1/2 transform -translate-y-1/2 font-medium
                      ${darkMode ? "text-gray-400" : "text-gray-500"}
                    `}>
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      className={`
                        w-full pl-10 pr-3 py-2.5 rounded-lg text-sm focus:outline-none
                        transition-colors duration-300
                        ${darkMode
                          ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                        } border
                      `}
                      value={customMaxPrice}
                      onChange={(e) => setCustomMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={applyCustomPrice}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm hover:shadow"
              >
                Apply Price
              </button>
            </div>
          </div>
        </FilterSection>

        {/* DISCOUNT */}
        <FilterSection
          title="Discount Offers"
          icon={<Percent size={18} className={darkMode ? "text-gray-300" : ""} />}
          defaultOpen={true}
          darkMode={darkMode}
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "10% OFF",
                value: "10",
                color: "from-green-400 to-emerald-500",
              },
              {
                label: "20% OFF",
                value: "20",
                color: "from-blue-400 to-cyan-500",
              },
              {
                label: "30% OFF",
                value: "30",
                color: "from-purple-400 to-violet-500",
              },
              {
                label: "40% OFF",
                value: "40",
                color: "from-orange-400 to-amber-500",
              },
              {
                label: "50% OFF",
                value: "50",
                color: "from-pink-400 to-rose-500",
              },
              {
                label: "60%+ OFF",
                value: "60",
                color: "from-red-400 to-pink-500",
              },
            ].map((option) => {
              const isChecked = selectedFilters.discount?.includes(
                option.value,
              );

              return (
                <button
                  key={option.value}
                  onClick={() => updateFilter("discount", option.value)}
                  className={`
                    relative p-4 rounded-xl text-white font-bold text-center
                    bg-gradient-to-r ${option.color}
                    transition-transform duration-200
                    ${isChecked
                      ? "ring-2 ring-white ring-offset-2 transform scale-[1.02]"
                      : "hover:scale-[1.02] opacity-90 hover:opacity-100"
                    }
                    ${darkMode ? "ring-offset-gray-800" : ""}
                  `}
                >
                  {option.label}
                  {isChecked && (
                    <div className={`
                      absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center
                      ${darkMode ? "bg-gray-800" : "bg-white"}
                    `}>
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* CUSTOMER RATING */}
        <FilterSection
          title="Customer Ratings"
          icon={<Star size={18} className="fill-yellow-400 text-yellow-400" />}
          defaultOpen={true}
          darkMode={darkMode}
        >
          <div className="space-y-3">
            {[
              { stars: 5, label: "5 Stars & above", value: "5" },
              { stars: 4, label: "4 Stars & above", value: "4" },
              { stars: 3, label: "3 Stars & above", value: "3" },
              { stars: 2, label: "2 Stars & above", value: "2" },
              { stars: 1, label: "1 Star & above", value: "1" },
            ].map((option) => {
              const isChecked = selectedFilters.rating?.includes(option.value);
              const bgColor = getColorClass("from-yellow-50 to-amber-50", darkMode);

              return (
                <label
                  key={option.value}
                  className={`
                    flex items-center justify-between p-3 rounded-xl cursor-pointer
                    transition-all duration-200 border
                    ${isChecked
                      ? `bg-gradient-to-r ${bgColor} ${darkMode ? "border-yellow-800" : "border-yellow-200"}`
                      : darkMode
                        ? "bg-gray-800 border-gray-700 hover:border-yellow-700"
                        : "bg-white border-gray-100 hover:border-yellow-200"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-5 h-5 rounded-md border flex items-center justify-center
                        ${isChecked 
                          ? "bg-yellow-500 border-yellow-500" 
                          : darkMode 
                            ? "border-gray-600" 
                            : "border-gray-300"
                        }
                      `}
                    >
                      {isChecked && (
                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < option.stars ? "#fbbf24" : darkMode ? "#374151" : "#d1d5db"}
                            className="text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className={`
                        text-sm font-medium transition-colors duration-300
                        ${darkMode ? "text-gray-200" : "text-gray-800"}
                      `}>
                        {option.label}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => updateFilter("rating", option.value)}
                    className="hidden"
                  />
                </label>
              );
            })}
          </div>
        </FilterSection>

        {/* COLORS */}
        <FilterSection
          title="Colors"
          icon={<Palette size={18} className={darkMode ? "text-gray-300" : ""} />}
          defaultOpen={true}
          darkMode={darkMode}
        >
          <div className="grid grid-cols-6 gap-3">
            {[
              {
                name: "Red",
                value: "red",
                bg: "bg-gradient-to-r from-red-500 to-red-600",
              },
              {
                name: "Blue",
                value: "blue",
                bg: "bg-gradient-to-r from-blue-500 to-blue-600",
              },
              {
                name: "Green",
                value: "green",
                bg: "bg-gradient-to-r from-green-500 to-emerald-600",
              },
              {
                name: "Black",
                value: "black",
                bg: "bg-gradient-to-r from-gray-800 to-gray-900",
              },
              {
                name: "White",
                value: "white",
                bg: "bg-gradient-to-r from-gray-100 to-gray-200 border",
              },
              {
                name: "Yellow",
                value: "yellow",
                bg: "bg-gradient-to-r from-yellow-400 to-amber-500",
              },
              {
                name: "Purple",
                value: "purple",
                bg: "bg-gradient-to-r from-purple-500 to-violet-600",
              },
              {
                name: "Pink",
                value: "pink",
                bg: "bg-gradient-to-r from-pink-500 to-rose-600",
              },
              {
                name: "Orange",
                value: "orange",
                bg: "bg-gradient-to-r from-orange-500 to-amber-600",
              },
              {
                name: "Gray",
                value: "gray",
                bg: "bg-gradient-to-r from-gray-400 to-gray-500",
              },
              {
                name: "Brown",
                value: "brown",
                bg: "bg-gradient-to-r from-amber-700 to-amber-900",
              },
              {
                name: "Multi",
                value: "multi",
                bg: "bg-gradient-to-r from-red-400 via-purple-400 to-blue-400",
              },
            ].map((color) => {
              const isSelected = selectedFilters.colors?.includes(color.value);
              const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
              const hoverBorderColor = darkMode ? "border-gray-500" : "border-gray-300";

              return (
                <div key={color.value} className="text-center group">
                  <button
                    onClick={() => updateFilter("colors", color.value)}
                    className={`
                      relative w-10 h-10 rounded-full mx-auto mb-1.5
                      ${color.bg} border-2
                      transition-all duration-300
                      ${isSelected
                        ? "border-white ring-4 transform scale-110"
                        : `${borderColor} hover:border-white hover:ring-2 hover:${hoverBorderColor} hover:scale-105`
                      }
                      ${isSelected && darkMode ? "ring-blue-500" : ""}
                      ${isSelected && !darkMode ? "ring-blue-400" : ""}
                    `}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                        </div>
                      </div>
                    )}
                  </button>
                  <span className={`
                    text-xs font-medium transition-colors duration-300
                    ${darkMode ? "text-gray-400 group-hover:text-gray-300" : "text-gray-700 group-hover:text-gray-900"}
                  `}>
                    {color.name}
                  </span>
                </div>
              );
            })}
          </div>
        </FilterSection>

        {/* SIZES */}
        <FilterSection
          title="Sizes"
          icon={<Ruler size={18} className={darkMode ? "text-gray-300" : ""} />}
          defaultOpen={true}
          darkMode={darkMode}
        >
          <div className="space-y-4">
            {/* CLOTHING SIZES */}
            <div>
              <h4 className={`
                text-sm font-medium mb-2 transition-colors duration-300
                ${darkMode ? "text-gray-300" : "text-gray-700"}
              `}>
                Clothing Sizes
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((size) => {
                  const isSelected = selectedFilters.sizes?.includes(size);

                  return (
                    <button
                      key={size}
                      onClick={() => updateFilter("sizes", size)}
                      className={`
                        py-2.5 text-sm font-bold rounded-lg
                        transition-all duration-200
                        ${isSelected
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105"
                          : darkMode
                            ? "bg-gray-800 text-gray-300 border border-gray-700 hover:border-blue-500 hover:text-blue-400 hover:shadow-lg"
                            : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:shadow"
                        }
                      `}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* NUMBER SIZES */}
            <div>
              <h4 className={`
                text-sm font-medium mb-2 transition-colors duration-300
                ${darkMode ? "text-gray-300" : "text-gray-700"}
              `}>
                Number Sizes
              </h4>
              <div className="grid grid-cols-6 gap-2">
                {[
                  "28", "30", "32", "34", "36", "38", "40", "42", "44", "46",
                ].map((size) => {
                  const isSelected = selectedFilters.sizes?.includes(size);

                  return (
                    <button
                      key={size}
                      onClick={() => updateFilter("sizes", size)}
                      className={`
                        py-2 text-sm font-medium rounded-lg
                        transition-all duration-200
                        ${isSelected
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                          : darkMode
                            ? "bg-gray-800 text-gray-300 border border-gray-700 hover:border-purple-500 hover:text-purple-400"
                            : "bg-white text-gray-700 border border-gray-300 hover:border-purple-400 hover:text-purple-600"
                        }
                      `}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </FilterSection>

        {/* APPLIED FILTERS BADGES */}
        {Object.keys(selectedFilters).some(
          (key) => selectedFilters[key] && selectedFilters[key].length > 0,
        ) && (
          <div className={`
            mt-6 pt-5 transition-colors duration-300
            ${darkMode ? "border-gray-700" : "border-gray-300"}
            border-t
          `}>
            <h3 className={`
              text-sm font-medium mb-3 transition-colors duration-300
              ${darkMode ? "text-gray-300" : "text-gray-700"}
            `}>
              Applied Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedFilters).map(([key, values]) =>
                values?.map((value) => (
                  <div
                    key={`${key}-${value}`}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-full border
                      transition-colors duration-300
                      ${darkMode
                        ? "bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border-blue-800"
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                      }
                    `}
                  >
                    <span className={`
                      text-xs font-medium transition-colors duration-300
                      ${darkMode ? "text-blue-300" : "text-blue-700"}
                    `}>
                      {value}
                    </span>
                    <button
                      onClick={() => updateFilter(key, value)}
                      className={`
                        w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-300
                        ${darkMode
                          ? "bg-blue-900/50 text-blue-400 hover:bg-blue-800"
                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        }
                      `}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= BEAUTIFUL FILTER SECTION ================= */
function FilterSection({ title, children, icon, defaultOpen = true, darkMode = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`
      mb-5 pb-5 transition-colors duration-300 last:border-0 last:mb-0 last:pb-0
      ${darkMode ? "border-gray-700" : "border-gray-300"}
      border-b
    `}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full group"
      >
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-xl transition-colors duration-300
            ${darkMode 
              ? "bg-gradient-to-br from-gray-800 to-gray-900" 
              : "bg-gradient-to-br from-gray-100 to-gray-200"
            }
          `}>
            <div className={darkMode ? "text-gray-300" : "text-gray-700"}>
              {typeof icon === "string" ? (
                <span className="text-lg">{icon}</span>
              ) : (
                icon
              )}
            </div>
          </div>
          <h3 className={`
            text-lg font-bold transition-colors duration-300
            ${darkMode 
              ? "text-gray-100 group-hover:text-gray-300" 
              : "text-gray-900 group-hover:text-gray-700"
            }
          `}>
            {title}
          </h3>
        </div>
        <div className={`
          p-1.5 rounded-lg transition-colors duration-300
          ${darkMode 
            ? "bg-gray-800 group-hover:bg-gray-700" 
            : "bg-gray-100 group-hover:bg-gray-200"
          }
        `}>
          {open ? (
            <ChevronUp size={18} className={darkMode ? "text-gray-400" : "text-gray-600"} />
          ) : (
            <ChevronDown size={18} className={darkMode ? "text-gray-400" : "text-gray-600"} />
          )}
        </div>
      </button>

      {open && <div className="mt-4 animate-slideDown">{children}</div>}
    </div>
  );
}