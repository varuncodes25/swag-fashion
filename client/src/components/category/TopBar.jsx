import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Search, ArrowUpDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "best_seller", label: "Best Seller" },
  { value: "discount", label: "Biggest Discount" },
];

export default function TopBar({
  productsCount,
  searchTerm = "",
  onSearchChange = () => {},
  sortBy = "newest",
  onSortChange = () => {},
}) {
  const sortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "Newest";

  return (
    <div
      className="
        flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between
        p-5 rounded-2xl border shadow-md
        bg-white dark:bg-zinc-900
        border-gray-200 dark:border-zinc-800
      "
    >
      <div className="flex items-center gap-4">
        <p className="hidden lg:block text-sm text-gray-700 dark:text-zinc-300">
          Showing{" "}
          <span className="font-semibold text-gray-900 dark:text-zinc-100">
            {productsCount}
          </span>{" "}
          products
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-[260px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
          />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-primary"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="
              inline-flex items-center gap-2 border px-4 py-2.5 rounded-lg text-sm shadow-sm
              bg-white dark:bg-zinc-800
              border-gray-200 dark:border-zinc-700
              text-gray-700 dark:text-zinc-100
              hover:bg-gray-100 dark:hover:bg-zinc-700 transition
            "
          >
            <ArrowUpDown size={14} />
            Sort: {sortLabel}
          </DropdownMenuTrigger>

          <DropdownMenuContent className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700">
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem key={opt.value} onClick={() => onSortChange(opt.value)}>
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}