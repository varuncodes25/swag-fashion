/** Broad browse filters — ?tagGroup=gods matches ANY tag in the group (OR). */
const TAG_FILTER_GROUPS = {
  gods: [
    "Gods",
    "Krishna",
    "Shiva",
    "Ganesha",
    "Hanuman",
    "Ram",
    "Vishnu",
    "Durga",
    "Lakshmi",
  ],
  cartoon: ["Cartoon", "Anime", "Disney", "Marvel", "DC", "Ben 10"],
};

function resolveTagsForFilter(tagsParam, tagGroupParam) {
  const tags = String(tagsParam || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const groupKey = String(tagGroupParam || "").trim().toLowerCase();
  if (groupKey && TAG_FILTER_GROUPS[groupKey]) {
    return [...new Set([...tags, ...TAG_FILTER_GROUPS[groupKey]])];
  }

  return tags;
}

module.exports = { TAG_FILTER_GROUPS, resolveTagsForFilter };
