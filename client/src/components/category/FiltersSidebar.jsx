import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Star, Filter, IndianRupee, Percent, Palette, Ruler, Tag } from "lucide-react";

export default function FiltersSidebar({
  selectedFilters = {},
  updateFilter,
}) {
  
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
    keys.forEach(key => {
      if (selectedFilters[key] && selectedFilters[key].length > 0) {
        selectedFilters[key].forEach(value => {
          updateFilter(key, value);
        });
      }
    });
    setCustomMinPrice("");
    setCustomMaxPrice("");
  };

  return (
    <div className="w-72 bg-gradient-to-b from-white to-gray-50 rounded-2xl p-5 shadow-lg border border-gray-200">
      
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Filter size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Filters
            </h2>
            <p className="text-xs text-gray-500">Refine your search</p>
          </div>
        </div>
        
        <button
          onClick={clearAllFilters}
          className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-full hover:bg-red-50 transition-all"
        >
          Clear All
        </button>
      </div>

      {/* ================= CATEGORIES ================= */}
      <FilterSection 
        title="Categories" 
        icon="📁"
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
                    transition-all duration-300
                    ${isActiveCategory 
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm" 
                      : "bg-white hover:bg-gray-50 border border-gray-100 hover:border-gray-200"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActiveCategory ? "bg-blue-100" : "bg-gray-100"}`}>
                      <span className="text-sm">{isActiveCategory ? "📂" : "📁"}</span>
                    </div>
                    <span className={`font-medium ${isActiveCategory ? "text-blue-700" : "text-gray-800"}`}>
                      {cat.name}
                    </span>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${isActiveCategory ? "text-blue-500" : "text-gray-400"}`}
                  />
                </button>

                {/* SUBCATEGORIES */}
                {isOpen && (
                  <div className="ml-10 mt-2 space-y-1.5 pl-4 border-l-2 border-blue-100">
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
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }
                          `}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${isActiveSub ? "bg-blue-500" : "bg-gray-300"}`}></div>
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

      {/* ================= PRICE RANGE ================= */}
      <FilterSection 
        title="Price Range" 
        icon={<IndianRupee size={18} />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* QUICK PRICE OPTIONS */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Under ₹500", value: "0-500", color: "from-green-50 to-green-100" },
              { label: "₹500-₹1k", value: "500-1000", color: "from-blue-50 to-blue-100" },
              { label: "₹1k-₹2k", value: "1000-2000", color: "from-purple-50 to-purple-100" },
              { label: "₹2k-₹5k", value: "2000-5000", color: "from-orange-50 to-orange-100" },
              { label: "₹5k-₹10k", value: "5000-10000", color: "from-pink-50 to-pink-100" },
              { label: "₹10k+", value: "10000-999999", color: "from-red-50 to-red-100" }
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
                      ? `bg-gradient-to-r ${option.color} border-transparent shadow-sm text-gray-900`
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
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200">
            <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Tag size={16} className="text-blue-500" />
              Custom Price Range
            </h4>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    value={customMinPrice}
                    onChange={(e) => setCustomMinPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="text-gray-400">-</div>
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
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

      {/* ================= DISCOUNT ================= */}
      <FilterSection 
        title="Discount Offers" 
        icon={<Percent size={18} />}
        defaultOpen={true}
      >
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "10% OFF", value: "10", color: "from-green-400 to-emerald-500" },
            { label: "20% OFF", value: "20", color: "from-blue-400 to-cyan-500" },
            { label: "30% OFF", value: "30", color: "from-purple-400 to-violet-500" },
            { label: "40% OFF", value: "40", color: "from-orange-400 to-amber-500" },
            { label: "50% OFF", value: "50", color: "from-pink-400 to-rose-500" },
            { label: "60%+ OFF", value: "60", color: "from-red-400 to-pink-500" }
          ].map((option) => {
            const isChecked = selectedFilters.discount?.includes(option.value);
            
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
                `}
              >
                {option.label}
                {isChecked && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* ================= CUSTOMER RATING ================= */}
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
            { stars: 1, label: "1 Star & above", value: "1" }
          ].map((option) => {
            const isChecked = selectedFilters.rating?.includes(option.value);
            
            return (
              <label 
                key={option.value}
                className={`
                  flex items-center justify-between p-3 rounded-xl cursor-pointer
                  transition-all duration-200
                  ${isChecked
                    ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
                    : "bg-white border border-gray-100 hover:border-yellow-200"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isChecked ? "bg-yellow-500 border-yellow-500" : "border-gray-300"}`}>
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
                          className="text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{option.label}</span>
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

      {/* ================= COLORS ================= */}
      <FilterSection 
        title="Colors" 
        icon={<Palette size={18} />}
        defaultOpen={true}
      >
        <div className="grid grid-cols-6 gap-3">
          {[
            { name: "Red", value: "red", bg: "bg-gradient-to-r from-red-500 to-red-600" },
            { name: "Blue", value: "blue", bg: "bg-gradient-to-r from-blue-500 to-blue-600" },
            { name: "Green", value: "green", bg: "bg-gradient-to-r from-green-500 to-emerald-600" },
            { name: "Black", value: "black", bg: "bg-gradient-to-r from-gray-800 to-gray-900" },
            { name: "White", value: "white", bg: "bg-gradient-to-r from-gray-100 to-gray-200 border" },
            { name: "Yellow", value: "yellow", bg: "bg-gradient-to-r from-yellow-400 to-amber-500" },
            { name: "Purple", value: "purple", bg: "bg-gradient-to-r from-purple-500 to-violet-600" },
            { name: "Pink", value: "pink", bg: "bg-gradient-to-r from-pink-500 to-rose-600" },
            { name: "Orange", value: "orange", bg: "bg-gradient-to-r from-orange-500 to-amber-600" },
            { name: "Gray", value: "gray", bg: "bg-gradient-to-r from-gray-400 to-gray-500" },
            { name: "Brown", value: "brown", bg: "bg-gradient-to-r from-amber-700 to-amber-900" },
            { name: "Multi", value: "multi", bg: "bg-gradient-to-r from-red-400 via-purple-400 to-blue-400" }
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
                      ? "border-white ring-4 ring-blue-400 transform scale-110" 
                      : "border-gray-200 hover:border-white hover:ring-2 hover:ring-gray-300 hover:scale-105"
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
                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                  {color.name}
                </span>
              </div>
            );
          })}
        </div>
      </FilterSection>

      {/* ================= SIZES ================= */}
      <FilterSection 
        title="Sizes" 
        icon={<Ruler size={18} />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* CLOTHING SIZES */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Clothing Sizes</h4>
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
            <h4 className="text-sm font-medium text-gray-700 mb-2">Number Sizes</h4>
            <div className="grid grid-cols-6 gap-2">
              {["28", "30", "32", "34", "36", "38", "40", "42", "44", "46"].map((size) => {
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

      {/* ================= APPLIED FILTERS BADGES ================= */}
      {Object.keys(selectedFilters).some(key => 
        selectedFilters[key] && selectedFilters[key].length > 0
      ) && (
        <div className="mt-6 pt-5 border-t border-gray-300">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Applied Filters</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([key, values]) => (
              values?.map((value) => (
                <div
                  key={`${key}-${value}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200"
                >
                  <span className="text-xs font-medium text-blue-700">{value}</span>
                  <button
                    onClick={() => updateFilter(key, value)}
                    className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200"
                  >
                    ×
                  </button>
                </div>
              ))
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= BEAUTIFUL FILTER SECTION ================= */
function FilterSection({ 
  title, 
  children, 
  icon,
  defaultOpen = true 
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-5 pb-5 border-b border-gray-300 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
            <div className="text-gray-700">
              {typeof icon === 'string' ? (
                <span className="text-lg">{icon}</span>
              ) : (
                icon
              )}
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700">
            {title}
          </h3>
        </div>
        <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-gray-200">
          {open ? (
            <ChevronUp size={18} className="text-gray-600" />
          ) : (
            <ChevronDown size={18} className="text-gray-600" />
          )}
        </div>
      </button>

      {open && (
        <div className="mt-4 animate-slideDown">
          {children}
        </div>
      )}
    </div>
  );
}