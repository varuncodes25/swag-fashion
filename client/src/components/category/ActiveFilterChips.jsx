import { X } from "lucide-react";

const FILTER_LABELS = {
  clothingType: "Type",
  fit: "Fit",
  pattern: "Pattern",
  sleeveType: "Sleeve",
  neckType: "Neck",
  fabric: "Fabric",
  colors: "Color",
  sizes: "Size",
  brands: "Brand",
  priceRange: "Price",
  discount: "Discount",
  rating: "Rating",
};

export default function ActiveFilterChips({
  selectedFilters = {},
  updateFilter = () => {},
  clearAllFilters = () => {},
  urlFilterChips = [],
  onRemoveUrlFilter = () => {},
}) {
  const sidebarChips = Object.entries(selectedFilters).flatMap(([key, values]) =>
    (values || []).map((value) => ({
      key,
      value,
      label: FILTER_LABELS[key] || key,
      source: "sidebar",
    })),
  );

  const chips = [
    ...urlFilterChips.map((chip) => ({ ...chip, source: "url" })),
    ...sidebarChips,
  ];

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map(({ key, value, label, source }) => (
        <button
          key={`${source}-${key}-${value}`}
          type="button"
          onClick={() =>
            source === "url" ? onRemoveUrlFilter(key) : updateFilter(key, value)
          }
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/20 dark:border-primary/40 dark:bg-primary/15"
        >
          <span className="text-muted-foreground">{label}:</span>
          <span>{value}</span>
          <X size={14} className="opacity-70" />
        </button>
      ))}
      <button
        type="button"
        onClick={clearAllFilters}
        className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
