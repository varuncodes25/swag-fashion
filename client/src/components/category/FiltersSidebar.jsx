import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

export default function FiltersSidebar({
  selectedFilters = {},
  updateFilter,
}) {
  const { slug, subSlug } = useParams();

  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/categories`
      );
      setCategories(res.data);

      // current category open by default
      setOpenCategory(slug);
    };

    fetchCategories();
  }, [slug]);

  return (
    <div className="space-y-6">

      {/* ================= CATEGORY + SUBCATEGORY ================= */}
      <div>
  <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">
    Categories
  </h3>

  {categories.map((cat) => {
    const isOpen = openCategory === cat.slug;
    const isActiveCategory = slug === cat.slug;

    return (
      <div
        key={cat.slug}
        className="border-b border-gray-200 dark:border-gray-700 pb-2"
      >
        {/* CATEGORY HEADER */}
        <button
          onClick={() =>
            setOpenCategory(isOpen ? null : cat.slug)
          }
          className={`
            w-full flex justify-between items-center
            px-3 py-2 rounded-md text-sm font-medium
            transition-colors
            ${
              isActiveCategory
                ? "bg-black text-white dark:bg-gray-100 dark:text-black"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }
          `}
        >
          <span>{cat.name}</span>

          <ChevronDown
            size={16}
            className={`
              transition-transform duration-200
              ${isOpen ? "rotate-180" : ""}
              text-gray-600 dark:text-gray-400
            `}
          />
        </button>

        {/* SUBCATEGORY DROPDOWN */}
        {isOpen && (
          <div className="ml-4 mt-2 space-y-1">
            {cat.subCategories.map((sub) => {
              const isActiveSub = sub.slug === subSlug;

              return (
                <Link
                  key={sub.slug}
                  to={`/category/${cat.slug}/${sub.slug}`}
                  className={`
                    block px-3 py-1.5 rounded text-sm
                    transition-colors
                    ${
                      isActiveSub
                        ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-black"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  {sub.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  })}
</div>


      {/* ================= PRICE RANGE ================= */}
      <FilterSection title="Price Range">
        <CheckboxList
          filterKey="priceRange"
          selectedFilters={selectedFilters}
          updateFilter={updateFilter}
          options={[
            { label: "₹0 – ₹199", value: "0-199" },
            { label: "₹200 – ₹499", value: "200-499" },
            { label: "₹500 – ₹999", value: "500-999" },
            { label: "₹1000 – ₹1999", value: "1000-1999" },
            { label: "₹2000 & above", value: "2000-999999" },
          ]}
        />
      </FilterSection>

      {/* ================= DISCOUNT ================= */}
      <FilterSection title="Discount">
        <CheckboxList
          filterKey="discount"
          selectedFilters={selectedFilters}
          updateFilter={updateFilter}
          options={[
            { label: "10% or more", value: "10" },
            { label: "20% or more", value: "20" },
            { label: "30% or more", value: "30" },
            { label: "40% or more", value: "40" },
            { label: "50% or more", value: "50" },
          ]}
        />
      </FilterSection>

    </div>
  );
}

/* ================= COLLAPSIBLE SECTION ================= */

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-2 font-semibold"
      >
        {title}
        <ChevronDown
          size={18}
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

/* ================= CHECKBOX LIST ================= */

function CheckboxList({
  options,
  filterKey,
  selectedFilters,
  updateFilter,
}) {
  return options.map((opt, i) => (
    <label
      key={i}
      className="flex items-center gap-3 cursor-pointer text-sm"
    >
      <Checkbox
        checked={selectedFilters[filterKey]?.includes(opt.value)}
        onCheckedChange={() =>
          updateFilter(filterKey, opt.value)
        }
      />
      <span>{opt.label}</span>
    </label>
  ));
}
