import { useState } from "react";
import { Filter, X, ChevronRight, Check, SlidersHorizontal } from "lucide-react";
import FiltersSidebar from "./FiltersSidebar";

export default function MobileFilterButton({ 
  selectedFilters = {},
  updateFilter = () => {},
  clearAllFilters = () => {}  // ✅ Clear function prop add किया
}) {
  const [open, setOpen] = useState(false);

  // Calculate applied filters count
  const appliedFilterCount = Object.values(selectedFilters)
    .flat()
    .filter(Boolean).length;

  // ✅ Apply filters and close drawer
  const handleApplyFilters = () => {
    setOpen(false);
    // Filters automatically apply हो जाएंगे क्योंकि selectedFilters update हो रहे हैं
  };

  return (
    <>
      {/* MODERN FILTER BUTTON */}
<button
  onClick={() => setOpen(true)}
  className="
    fixed bottom-8 right-8 z-50
    lg:hidden
    p-3.5
    bg-gradient-to-br from-blue-500 to-indigo-600
    dark:from-blue-600 dark:to-indigo-700
    text-white rounded-2xl
    shadow-lg
    hover:shadow-xl
    active:scale-95
    transition-all duration-300
    group
    overflow-visible
    border border-white/20
  "
>
  {/* Applied filters badge - OUTSIDE the button */}
  {appliedFilterCount > 0 && (
    <div className="
      absolute -top-2 -right-2 z-20
      w-7 h-7
      bg-white
      border-2 border-blue-500
      text-blue-600 dark:text-blue-700
      font-bold text-sm rounded-full
      flex items-center justify-center
     
      transform group-hover:scale-110 group-hover:-rotate-12
      transition-all duration-300
      animate-bounce-subtle
    ">
      {appliedFilterCount}
    </div>
  )}
  
  {/* Glow effect */}
  <div className=" "/>

  {/* Shine effect */}
  <div className="" />
  
  {/* Main icon with 3D effect */}
  <div className="relative z-10 transform group-hover:scale-110 group-active:scale-95 transition-transform duration-300">
    <SlidersHorizontal size={26} className="text-white drop-shadow-lg" />
  </div>
  
  {/* Pulse animation ring */}
  <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping-slow opacity-0 group-hover:opacity-100"></div>
  
  {/* Floating particles */}
  
  
  {/* Tooltip */}
  <div className="
    absolute bottom-full right-0 mb-3
    px-4 py-3
    bg-gradient-to-r from-gray-900 to-gray-800
    dark:from-gray-800 dark:to-gray-900
    text-white text-sm font-medium rounded-xl
    opacity-0 group-hover:opacity-100
    transition-all duration-300
    whitespace-nowrap
    shadow-2xl
    transform translate-y-2 group-hover:translate-y-0
    pointer-events-none
    border border-gray-700
    backdrop-blur-sm
  ">
    <div className="flex items-center gap-2">
      <Filter size={16} className="text-blue-300" />
      {appliedFilterCount > 0 
        ? `${appliedFilterCount} filter${appliedFilterCount > 1 ? 's' : ''} applied`
        : 'Open filters'}
    </div>
    
    {/* Tooltip arrow */}
    <div className="absolute top-full right-3 -mt-1 w-3 h-3 
      bg-gradient-to-r from-gray-900 to-gray-800 
      dark:from-gray-800 dark:to-gray-900
      transform rotate-45 border-r border-b border-gray-700"></div>
  </div>
</button>

      {/* MODERN DRAWER OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          
          {/* Animated Drawer */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              absolute inset-y-0 right-0
              w-full max-w-xs sm:max-w-sm
              bg-gradient-to-b from-white to-gray-50
              dark:from-zinc-900 dark:to-zinc-950
              shadow-2xl shadow-black/30
              transform transition-transform duration-500 ease-out
              flex flex-col
            "
            style={{ 
              animation: 'slideInRight 0.3s ease-out forwards'
            }}
          >
            {/* Drawer Header */}
            <div className="
              sticky top-0 z-10
              px-6 py-5
              bg-gradient-to-r from-blue-500 to-indigo-600
              dark:from-blue-600 dark:to-indigo-700
              text-white
              shadow-lg
            ">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Filter size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Filters</h2>
                    <p className="text-sm text-white/90 opacity-90">
                      Refine your product search
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setOpen(false)}
                  className="
                    p-2 rounded-xl
                    bg-white/20 hover:bg-white/30
                    backdrop-blur-sm
                    transition-colors duration-300
                  "
                >
                  <X size={20} />
                </button>
              </div>

              {/* Applied filters summary */}
              {appliedFilterCount > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-300" />
                    <span className="text-sm font-medium">
                      {appliedFilterCount} filter{appliedFilterCount > 1 ? 's' : ''} active
                    </span>
                  </div>
                  <button
                    onClick={clearAllFilters}  // ✅ Correct function call
                    className="
                      text-sm font-medium
                      text-white/90 hover:text-white
                      underline decoration-dotted
                    "
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Content */}
            <div className="flex-1  p-6">
              <FiltersSidebar 
                selectedFilters={selectedFilters}
                updateFilter={updateFilter}
              />
            </div>

            {/* Fixed Bottom Actions - ✅ ADDED */}
            <div className="
              sticky bottom-0
              p-6 pt-4
              border-t border-gray-200 dark:border-zinc-800
              bg-white dark:bg-zinc-900
              shadow-lg
            ">
              <div className="flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="
                    flex-1 py-3 px-4
                    border border-gray-300 dark:border-zinc-700
                    text-gray-700 dark:text-gray-300
                    font-medium rounded-xl
                    hover:bg-gray-50 dark:hover:bg-zinc-800
                    transition-colors duration-200
                  "
                >
                  Clear All
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="
                    flex-1 py-3 px-4
                    bg-gradient-to-r from-blue-500 to-indigo-600
                    dark:from-blue-600 dark:to-indigo-700
                    text-white font-medium rounded-xl
                    hover:from-blue-600 hover:to-indigo-700
                    dark:hover:from-blue-700 dark:hover:to-indigo-800
                    transition-all duration-200
                    shadow-md
                  "
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
        
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
}