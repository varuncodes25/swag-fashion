import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  SHOP_BY_MOOD_TILES,
  MOOD_FALLBACK_IMAGES,
  getMoodFilterHref,
} from "@/constants/shopByMood";
import {
  getImageUrl,
  optimizeGalleryImage,
  resolveImagesForColor,
} from "@/utils/productImages";
import {
  HOME_SECTION_COMPACT,
  HOME_SECTION_CONTAINER,
  HOME_SECTION_TOP_DIVIDER,
} from "./homeSectionStyles";

function pickProductImage(product) {
  if (!product) return "";
  const color = product?.variants?.[0]?.color;
  const imgs = resolveImagesForColor(product, color);
  const raw =
    imgs.find((img) => img.isMain)?.url ||
    imgs[0]?.url ||
    getImageUrl(product?.image);
  return raw ? optimizeGalleryImage(raw, { thumb: true, square: true }) : "";
}

function MoodChip({ id, label, occasion, imageSrc, compact = false }) {
  const chipSize = compact
    ? "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20"
    : "h-24 w-24";
  const linkWidth = compact ? "w-[4.5rem] sm:w-20" : "w-24";
  const labelClass = compact
    ? "max-w-[4.5rem] text-center text-[11px] font-medium leading-tight text-foreground group-hover:text-primary sm:max-w-20 sm:text-xs"
    : "text-center text-sm font-medium text-foreground group-hover:text-primary";
  const gap = compact ? "gap-2" : "gap-2.5";
  const fallback = MOOD_FALLBACK_IMAGES[id] || "/tshirt_model.png";
  const src = imageSrc || fallback;
  const isLocalAsset =
    src.startsWith("/images/") || src.startsWith("/tshirt_model");

  return (
    <Link
      to={getMoodFilterHref(occasion)}
      className={`group flex ${linkWidth} shrink-0 snap-start flex-col items-center ${gap}`}
    >
      <div
        className={`${chipSize} overflow-hidden rounded-full border-2 border-border bg-muted p-[3px] shadow-sm transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-md sm:p-1`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full bg-muted">
          <img
            src={src}
            alt={label}
            loading="lazy"
            onError={(e) => {
              const el = e.currentTarget;
              if (el.dataset.fallbackApplied === "1") {
                el.src = "/tshirt_model.png";
                return;
              }
              el.dataset.fallbackApplied = "1";
              el.src = fallback;
            }}
            className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
              isLocalAsset
                ? "object-contain object-center"
                : "object-cover object-center"
            }`}
          />
        </div>
      </div>
      <span className={labelClass}>{label}</span>
    </Link>
  );
}

export default function ShopByMoodSection() {
  const [moodImages, setMoodImages] = useState(MOOD_FALLBACK_IMAGES);

  useEffect(() => {
    let cancelled = false;

    const fetchMoodImages = async () => {
      const results = await Promise.all(
        SHOP_BY_MOOD_TILES.map(async (tile) => {
          try {
            const res = await axios.get(
              `${import.meta.env.VITE_API_URL}/get-products`,
              {
                params: {
                  occasion: tile.occasion,
                  inStock: true,
                  limit: 1,
                  page: 1,
                },
              },
            );
            const product = res.data?.data?.[0];
            const url = pickProductImage(product);
            return [tile.id, url || MOOD_FALLBACK_IMAGES[tile.id]];
          } catch {
            return [tile.id, MOOD_FALLBACK_IMAGES[tile.id]];
          }
        }),
      );

      if (!cancelled) {
        setMoodImages(Object.fromEntries(results));
      }
    };

    fetchMoodImages();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={`${HOME_SECTION_COMPACT} ${HOME_SECTION_TOP_DIVIDER}`}>
      <div className={HOME_SECTION_CONTAINER}>
        <div className="mb-3 text-center sm:mb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Shop by Mood
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            College, gym, travel, casual &amp; street
          </p>
        </div>

        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 scroll-smooth scrollbar-hide sm:gap-5 lg:hidden">
          {SHOP_BY_MOOD_TILES.map((item) => (
            <MoodChip
              key={item.id}
              {...item}
              imageSrc={moodImages[item.id]}
              compact
            />
          ))}
        </div>

        <div className="hidden justify-center gap-8 lg:flex">
          {SHOP_BY_MOOD_TILES.map((item) => (
            <MoodChip key={item.id} {...item} imageSrc={moodImages[item.id]} />
          ))}
        </div>
      </div>
    </section>
  );
}
