import { Link } from "react-router-dom";
import {
  GraduationCap,
  Dumbbell,
  Plane,
  Sun,
  Flame,
  Sparkles,
} from "lucide-react";
import {
  SHOP_BY_MOOD_TILES,
  getMoodFilterHref,
} from "@/constants/shopByMood";
import HomeSectionHeader from "@/components/Home/HomeSectionHeader";
import {
  HOME_SECTION_CLASS,
  HOME_SECTION_CONTAINER,
  HOME_SECTION_TOP_DIVIDER,
} from "./homeSectionStyles";

const MOOD_ICONS = {
  college: GraduationCap,
  gym: Dumbbell,
  travel: Plane,
  casual: Sun,
  streetwear: Flame,
};

function MoodCard({ id, label, tagline, occasion, gradient }) {
  const Icon = MOOD_ICONS[id] || Sparkles;

  return (
    <Link
      to={getMoodFilterHref(occasion)}
      className={`group relative flex min-h-[7.5rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-4 shadow-md ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] sm:min-h-[8.5rem] sm:p-5`}
    >
      <div
        className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/15"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm sm:h-11 sm:w-11">
          <Icon className="h-5 w-5 sm:h-5 sm:w-5" strokeWidth={2} />
        </div>
      </div>
      <div className="relative mt-auto pt-3">
        <p className="text-sm font-bold tracking-tight text-white sm:text-base">
          {label}
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-white/85 sm:text-xs">
          {tagline}
        </p>
      </div>
    </Link>
  );
}

export default function ShopByMoodSection() {
  return (
    <section className={`${HOME_SECTION_CLASS} ${HOME_SECTION_TOP_DIVIDER}`}>
      <div className={HOME_SECTION_CONTAINER}>
        <HomeSectionHeader
          badge="Curated"
          badgeIcon={Sparkles}
          title="Shop By Mood"
          subtitle="Pick a vibe — college, gym, travel, casual & street."
          viewAllHref="/category/all"
          viewAllLabel="Browse all"
        />

        {/* Mobile: horizontal scroll */}
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scroll-smooth scrollbar-hide sm:hidden">
          {SHOP_BY_MOOD_TILES.map((tile) => (
            <div key={tile.id} className="w-[42vw] min-w-[9.5rem] max-w-[11rem]">
              <MoodCard {...tile} />
            </div>
          ))}
        </div>

        {/* Tablet + desktop: full-width grid */}
        <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {SHOP_BY_MOOD_TILES.map((tile) => (
            <MoodCard key={tile.id} {...tile} />
          ))}
        </div>
      </div>
    </section>
  );
}
