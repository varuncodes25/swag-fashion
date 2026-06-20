import { POPULAR_SEARCH_TAGS } from "@/constants/productTags";

export default function PopularSearchTags({
  searchParams,
  onSelect,
  className = "",
  scrollable = false,
}) {
  const activeTag = searchParams.get("tags");
  const activeGroup = searchParams.get("tagGroup");

  const containerClass = scrollable
    ? "flex items-center gap-1.5 overflow-x-auto flex-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    : "flex flex-wrap items-center gap-2";

  return (
    <div className={`${containerClass} ${className}`}>
      <span className="text-[10px] font-medium text-muted-foreground shrink-0">
        Popular:
      </span>
      {POPULAR_SEARCH_TAGS.map((item) => {
        const isActive =
          (item.type === "tag" &&
            activeTag?.toLowerCase() === item.value.toLowerCase()) ||
          (item.type === "group" &&
            activeGroup?.toLowerCase() === item.value.toLowerCase());

        return (
          <button
            key={`${item.type}-${item.value}`}
            type="button"
            onClick={() => onSelect(item)}
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ${
              scrollable ? "whitespace-nowrap" : ""
            } ${
              isActive
                ? "border-primary bg-primary text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:bg-primary/5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
