import { ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Breadcrumb = ({ category, subcategory, productName }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <nav className="flex items-center space-x-2 text-sm">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <Home className="h-4 w-4 mr-1" />
          Home
        </button>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        
        {category && (
          <>
            <button
              onClick={() => navigate(`/category/${category}`)}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              {category}
            </button>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        
        {subcategory && (
          <>
            <button
              onClick={() => navigate(`/category/${category}/${subcategory}`)}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              {subcategory}
            </button>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        
        <span className="text-gray-900 font-medium truncate max-w-xs">
          {productName}
        </span>
      </nav>
    </div>
  );
};

export default Breadcrumb;