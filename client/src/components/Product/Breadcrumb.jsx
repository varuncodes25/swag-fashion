import { ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBreadcrumbCategorySlug } from "@/utils/categoryNav";

const Breadcrumb = ({ category, clothingType, gender, productName }) => {
  const navigate = useNavigate();
  const baseSlug = getBreadcrumbCategorySlug(category);

  const buildCategoryUrl = (extra = {}) => {
    const params = new URLSearchParams();
    if (clothingType) params.set("clothingType", clothingType);
    if (extra.gender) params.set("gender", String(extra.gender).toLowerCase());
    const qs = params.toString();
    return `/category/${baseSlug}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
      <nav className="flex items-center flex-wrap gap-y-1 space-x-2 text-sm">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <Home className="h-4 w-4 mr-1" />
          Home
        </button>

        {clothingType && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
            <button
              type="button"
              onClick={() => navigate(buildCategoryUrl())}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              {clothingType}
            </button>
          </>
        )}

        {gender && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
            <button
              type="button"
              onClick={() => navigate(buildCategoryUrl({ gender }))}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              {gender}
            </button>
          </>
        )}

        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-[12rem] sm:max-w-xs">
          {productName}
        </span>
      </nav>
    </div>
  );
};

export default Breadcrumb;
