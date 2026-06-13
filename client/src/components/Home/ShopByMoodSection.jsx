import { Link } from "react-router-dom";
import {
  SHOP_BY_MOOD_TILES,
  getMoodFilterHref,
} from "@/constants/shopByMood";
import {
  HOME_SECTION_CLASS,
  HOME_SECTION_CONTAINER,
  HOME_SECTION_TOP_DIVIDER,
} from "./homeSectionStyles";

export default function ShopByMoodSection() {
  return (
    <section className={`${HOME_SECTION_CLASS} ${HOME_SECTION_TOP_DIVIDER}`}>
      <div className={HOME_SECTION_CONTAINER}>
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
          <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg lg:text-xl">
            Shop By Mood
          </h2>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Campus · Gym · Travel · More
          </span>
        </div>

        <div className="mx-auto grid max-w-md grid-cols-5 gap-1.5 sm:max-w-lg sm:gap-2 lg:max-w-2xl lg:gap-3">
          {SHOP_BY_MOOD_TILES.map(
            ({ id, label, occasion, emoji, gradient }) => (
              <Link
                key={id}
                to={getMoodFilterHref(occasion)}
                className={`group flex aspect-square flex-col items-center justify-center gap-1 rounded-lg bg-gradient-to-br ${gradient} p-1 transition active:scale-[0.97] hover:brightness-105 sm:rounded-xl sm:p-1.5`}
              >
                <span
                  className="text-base leading-none sm:text-xl lg:text-2xl"
                  aria-hidden
                >
                  {emoji}
                </span>
                <span className="w-full truncate text-center text-[9px] font-semibold text-white sm:text-[10px] lg:text-xs">
                  {label}
                </span>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
