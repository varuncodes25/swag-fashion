import { POPULAR_SEARCH_TAGS } from "@/constants/productTags";

export default function PopularSearchTags({
  searchParams,
  onSelect,
  className = "",
}) {
  const activeTag = searchParams.get("tags");
  const activeGroup = searchParams.get("tagGroup");

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-[11px] font-medium text-muted-foreground shrink-0">
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
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
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
