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
  X,
} from "lucide-react";

export default function FiltersSidebar({ selectedFilters = {}, updateFilter }) {
  const { slug, subSlug } = useParams();
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(slug);
  const [customMinPrice, setCustomMinPrice] = useState("");
  const [customMaxPrice, setCustomMaxPrice] = useState("");

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

  // Helper functions
  const getCategoryIcon = (slug, isActive = false) => {
    const iconProps = { size: 16 };

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

  const getActiveGradient = (slug) => {
    switch (slug) {
      case "men":
        return "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:border-blue-800 dark:bg-gradient-to-r dark:from-blue-900/20 dark:to-blue-800/10";
      case "women":
        return "border-pink-200 bg-gradient-to-r from-pink-50 to-pink-100/50 dark:border-pink-800 dark:bg-gradient-to-r dark:from-pink-900/20 dark:to-pink-800/10";
      case "kids":
        return "border-green-200 bg-gradient-to-r from-green-50 to-green-100/50 dark:border-green-800 dark:bg-gradient-to-r dark:from-green-900/20 dark:to-green-800/10";
      case "collections":
        return "border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:border-yellow-800 dark:bg-gradient-to-r dark:from-yellow-900/20 dark:to-yellow-800/10";
      case "style":
        return "border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:border-purple-800 dark:bg-gradient-to-r dark:from-purple-900/20 dark:to-purple-800/10";
      default:
        return "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:border-gray-700 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900/50";
    }
  };

  const getBgColor = (slug, isActive) => {
    if (!isActive) return "bg-gray-100 dark:bg-gray-800";

    switch (slug) {
      case "men":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "women":
        return "bg-pink-100 dark:bg-pink-900/30";
      case "kids":
        return "bg-green-100 dark:bg-green-900/30";
      case "collections":
        return "bg-yellow-100 dark:bg-yellow-900/30";
      case "style":
        return "bg-purple-100 dark:bg-purple-900/30";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  const getIconColor = (slug, isActive) => {
    if (!isActive) return "text-gray-600 dark:text-gray-400";

    switch (slug) {
      case "men":
        return "text-blue-600 dark:text-blue-400";
      case "women":
        return "text-pink-600 dark:text-pink-400";
      case "kids":
        return "text-green-600 dark:text-green-400";
      case "collections":
        return "text-yellow-600 dark:text-yellow-400";
      case "style":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getTextColor = (slug, isActive) => {
    if (!isActive) return "text-gray-800 dark:text-gray-200";

    switch (slug) {
      case "men":
        return "text-blue-700 dark:text-blue-400";
      case "women":
        return "text-pink-700 dark:text-pink-400";
      case "kids":
        return "text-green-700 dark:text-green-400";
      case "collections":
        return "text-yellow-700 dark:text-yellow-400";
      case "style":
        return "text-purple-700 dark:text-purple-400";
      default:
        return "text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="
      w-72 rounded-2xl shadow-lg sticky top-5 h-[85vh] flex flex-col
      bg-gradient-to-b from-white to-gray-50 border border-gray-200
      dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 dark:border-gray-700
      transition-colors duration-300
    ">
      {/* ================= FIXED HEADER ================= */}
      <div className=" hidden lg:block p-2 flex-shrink-0 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Filter size={20} className="text-white" />
            </div>
            <div>
              <h2 className="
                text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 
                dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent
              ">
                Filters
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Refine your search
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SCROLLABLE FILTERS CONTENT ================= */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-gray-800 dark:text-gray-200">
        {/* CATEGORIES */}
        <FilterSection
          title="Categories"
          icon={<LayoutGrid size={18} className="text-blue-600 dark:text-blue-400" />}
          defaultOpen={true}
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
                      transition-all duration-300 border
                      ${isActiveCategory
                        ? `${getActiveGradient(cat.slug)} border shadow-sm`
                        : "bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 dark:hover:border-gray-600"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${getBgColor(cat.slug, isActiveCategory)}`}
                      >
                        {getCategoryIcon(cat.slug, isActiveCategory)}
                      </div>
                      <span className={`font-medium ${getTextColor(cat.slug, isActiveCategory)}`}>
                        {cat.name}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`
                        transition-all duration-300
                        ${isOpen ? "rotate-180" : ""}
                        ${isActiveCategory 
                          ? getIconColor(cat.slug, true)
                          : "text-gray-400 dark:text-gray-400"
                        }
                      `}
                    />
                  </button>

                  {/* SUBCATEGORIES */}
                  {isOpen && (
                    <div className="
                      ml-10 mt-2 space-y-1.5 pl-4 border-l-2 
                      border-blue-100 dark:border-gray-600
                    ">
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
                                ? "bg-blue-100 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-400"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                              }
                            `}
                          >
                            <div
                              className={`
                                w-1.5 h-1.5 rounded-full
                                ${isActiveSub
                                  ? "bg-blue-500 dark:bg-blue-500"
                                  : "bg-gray-300 dark:bg-gray-600"
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
          icon={<IndianRupee size={18} />}
          defaultOpen={true}
        >
          <div className="space-y-4">
            {/* QUICK PRICE OPTIONS */}
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Under ₹500",
                  value: "0-500",
                  color: "from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20",
                },
                {
                  label: "₹500-₹1k",
                  value: "500-1000",
                  color: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20",
                },
                {
                  label: "₹1k-₹2k",
                  value: "1000-2000",
                  color: "from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20",
                },
                {
                  label: "₹2k-₹5k",
                  value: "2000-5000",
                  color: "from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20",
                },
                {
                  label: "₹5k-₹10k",
                  value: "5000-10000",
                  color: "from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20",
                },
                {
                  label: "₹10k+",
                  value: "10000-999999",
                  color: "from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20",
                },
              ].map((option) => {
                const isChecked = selectedFilters.priceRange?.includes(option.value);

                return (
                  <button
                    key={option.value}
                    onClick={() => updateFilter("priceRange", option.value)}
                    className={`
                      p-3 rounded-xl border text-sm font-medium text-center
                      transition-all duration-200
                      ${isChecked
                        ? `bg-gradient-to-r ${option.color} border-transparent shadow-sm text-gray-900 dark:text-gray-100`
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:shadow-lg dark:text-gray-300"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* CUSTOM PRICE INPUT */}
            <div className="
              p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-white 
              border-gray-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700
            ">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-300">
                <Tag size={16} className="text-blue-500 dark:text-blue-400" />
                Custom Price Range
              </h4>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-medium text-gray-500 dark:text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Min"
                      className="
                        w-full pl-10 pr-3 py-2.5 rounded-lg text-sm border border-gray-300
                        focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
                        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 
                        dark:placeholder-gray-500 dark:focus:ring-blue-500 dark:focus:border-blue-500
                      "
                      value={customMinPrice}
                      onChange={(e) => setCustomMinPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="text-gray-400 dark:text-gray-500">-</div>
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-medium text-gray-500 dark:text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="
                        w-full pl-10 pr-3 py-2.5 rounded-lg text-sm border border-gray-300
                        focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
                        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 
                        dark:placeholder-gray-500 dark:focus:ring-blue-500 dark:focus:border-blue-500
                      "
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
          icon={<Percent size={16} className="text-emerald-600 dark:text-emerald-400" />}
          defaultOpen={true}
        >
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "10%",
                value: "10",
                color: "bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 dark:from-green-900/40 dark:to-emerald-900/30 dark:border-green-800/30",
                textColor: "text-green-700 dark:text-green-300",
                badgeColor: "bg-gradient-to-r from-green-400 to-emerald-500",
              },
              {
                label: "20%",
                value: "20",
                color: "bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 dark:from-blue-900/40 dark:to-cyan-900/30 dark:border-blue-800/30",
                textColor: "text-blue-700 dark:text-blue-300",
                badgeColor: "bg-gradient-to-r from-blue-400 to-cyan-500",
              },
              {
                label: "30%",
                value: "30",
                color: "bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 dark:from-purple-900/40 dark:to-violet-900/30 dark:border-purple-800/30",
                textColor: "text-purple-700 dark:text-purple-300",
                badgeColor: "bg-gradient-to-r from-purple-400 to-violet-500",
              },
              {
                label: "40%",
                value: "40",
                color: "bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 dark:from-orange-900/40 dark:to-amber-900/30 dark:border-orange-800/30",
                textColor: "text-orange-700 dark:text-orange-300",
                badgeColor: "bg-gradient-to-r from-orange-400 to-amber-500",
              },
              {
                label: "50%",
                value: "50",
                color: "bg-gradient-to-br from-pink-50 to-rose-100 border border-pink-200 dark:from-pink-900/40 dark:to-rose-900/30 dark:border-pink-800/30",
                textColor: "text-pink-700 dark:text-pink-300",
                badgeColor: "bg-gradient-to-r from-pink-400 to-rose-500",
              },
              {
                label: "60%+",
                value: "60",
                color: "bg-gradient-to-br from-red-50 to-pink-100 border border-red-200 dark:from-red-900/40 dark:to-pink-900/30 dark:border-red-800/30",
                textColor: "text-red-700 dark:text-red-300",
                badgeColor: "bg-gradient-to-r from-red-400 to-pink-500",
              },
            ].map((option) => {
              const isChecked = selectedFilters.discount?.includes(option.value);

              return (
                <button
                  key={option.value}
                  onClick={() => updateFilter("discount", option.value)}
                  className={`
                    relative p-2.5 rounded-lg transition-all duration-200
                    ${option.color}
                    ${isChecked 
                      ? "ring-2 ring-offset-1 transform scale-[1.02] shadow-md" 
                      : "hover:scale-[1.02] hover:shadow-sm"
                    }
                    ${isChecked 
                      ? "ring-emerald-400 ring-offset-white dark:ring-emerald-500 dark:ring-offset-gray-800" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }
                  `}
                >
                  {/* Discount Badge */}
                  <div className={`
                    absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center
                    ${option.badgeColor} text-white text-[10px] font-bold shadow-sm
                    ${isChecked ? "opacity-100" : "opacity-0"}
                    transition-opacity duration-200
                  `}>
                    ✓
                  </div>

                  {/* Discount Label */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={`
                      text-sm font-bold ${option.textColor}
                      ${isChecked ? "scale-110" : ""}
                      transition-transform duration-200
                    `}>
                      {option.label}
                    </span>
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                      OFF
                    </span>
                  </div>

                  {/* Active Indicator Line */}
                  <div className={`
                    absolute bottom-0 left-1/2 transform -translate-x-1/2
                    w-4 h-0.5 rounded-full mt-1
                    ${option.badgeColor}
                    transition-all duration-300
                    ${isChecked ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}
                  `}></div>
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

              return (
                <label
                  key={option.value}
                  className={`
                    flex items-center justify-between p-3 rounded-xl cursor-pointer
                    transition-all duration-200 border
                    ${isChecked
                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/10 dark:border-yellow-800"
                      : "bg-white border-gray-100 hover:border-yellow-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-yellow-700"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-5 h-5 rounded-md border flex items-center justify-center
                        ${isChecked 
                          ? "bg-yellow-500 border-yellow-500" 
                          : "border-gray-300 dark:border-gray-600"
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
                            fill={i < option.stars ? "#fbbf24" : "#d1d5db"}
                            className="text-yellow-400 dark:fill-gray-700"
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
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
          icon={<Palette size={18} />}
          defaultOpen={true}
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

              return (
                <div key={color.value} className="text-center group">
                  <button
                    onClick={() => updateFilter("colors", color.value)}
                    className={`
                      relative w-10 h-10 rounded-full mx-auto mb-1.5
                      ${color.bg} border-2
                      transition-all duration-300
                      ${isSelected
                        ? "border-white ring-4 transform scale-110 ring-blue-400 dark:ring-blue-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-white hover:ring-2 hover:border-gray-300 dark:hover:border-gray-500 hover:scale-105"
                      }
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
                  <span className="
                    text-xs font-medium text-gray-700 group-hover:text-gray-900 
                    dark:text-gray-400 dark:group-hover:text-gray-300
                  ">
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
          icon={<Ruler size={18} />}
          defaultOpen={true}
        >
          <div className="space-y-4">
            {/* CLOTHING SIZES */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                          : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:shadow dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:text-blue-400 dark:hover:shadow-lg"
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
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                          : "bg-white text-gray-700 border border-gray-300 hover:border-purple-400 hover:text-purple-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:border-purple-500 dark:hover:text-purple-400"
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
          <div className="mt-6 pt-5 border-t border-gray-300 dark:border-gray-700">
            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              Applied Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedFilters).map(([key, values]) =>
                values?.map((value) => (
                  <div
                    key={`${key}-${value}`}
                    className="
                      flex items-center gap-1.5 px-3 py-1.5 rounded-full border
                      bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200
                      dark:from-blue-900/30 dark:to-indigo-900/20 dark:border-blue-800
                    "
                  >
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      {value}
                    </span>
                    <button
                      onClick={() => updateFilter(key, value)}
                      className="
                        w-4 h-4 rounded-full flex items-center justify-center
                        bg-blue-100 text-blue-600 hover:bg-blue-200
                        dark:bg-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-800
                      "
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
function FilterSection({ title, children, icon, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="
      mb-5 pb-5 border-b border-gray-300 dark:border-gray-700 
      last:border-0 last:mb-0 last:pb-0
    ">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full group"
      >
        <div className="flex items-center gap-3">
          <div className="
            p-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200
            dark:from-gray-800 dark:to-gray-900
          ">
            {typeof icon === "string" ? (
              <span className="text-lg text-gray-700 dark:text-gray-300">{icon}</span>
            ) : (
              <div className="text-gray-700 dark:text-gray-300">{icon}</div>
            )}
          </div>
          <h3 className="
            text-lg font-bold text-gray-900 group-hover:text-gray-700
            dark:text-gray-100 dark:group-hover:text-gray-300
          ">
            {title}
          </h3>
        </div>
        <div className="
          p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200
          dark:bg-gray-800 dark:group-hover:bg-gray-700
        ">
          {open ? (
            <ChevronUp size={18} className="text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" />
          )}
        </div>
      </button>

      {open && <div className="mt-4 animate-slideDown">{children}</div>}
    </div>
  );
}