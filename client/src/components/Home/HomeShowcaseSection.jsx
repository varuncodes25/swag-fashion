import { Link } from "react-router-dom";
import { SHOP_BY_STYLE_LINKS } from "@/constants/productEnums";
import {
  HOME_SECTION_COMPACT,
  HOME_SECTION_CONTAINER,
  HOME_SECTION_TOP_DIVIDER,
} from "./homeSectionStyles";

const showcaseImages = {
  graphic: "/images/home-showcase/graphic-prints.png",
  anime: "/images/home-showcase/anime.png",
  "acid-wash": "/images/home-showcase/acid-wash.png",
  minimalist: "/images/home-showcase/minimalist.png",
  solids: "/images/home-showcase/solids.png",
};

export default function HomeShowcaseSection() {
  return (
    <section className={`${HOME_SECTION_COMPACT} ${HOME_SECTION_TOP_DIVIDER}`}>
      <div className={HOME_SECTION_CONTAINER}>
        <div className="mb-3 text-center sm:mb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Shop by Style
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Graphic, anime, acid wash, minimal &amp; solids
          </p>
        </div>

        {/* Mobile + tablet: round chips, horizontal scroll */}
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 scroll-smooth scrollbar-hide sm:gap-5 lg:hidden">
          {SHOP_BY_STYLE_LINKS.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="group flex w-[4.5rem] shrink-0 snap-start flex-col items-center gap-2 sm:w-20"
            >
              <div className="h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full border-2 border-border bg-muted shadow-sm transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-md sm:h-20 sm:w-20">
                <img
                  src={showcaseImages[item.id] || "/tshirt_model.png"}
                  alt={item.label}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/tshirt_model.png";
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <span className="max-w-[4.5rem] text-center text-[11px] font-medium leading-tight text-foreground group-hover:text-primary sm:max-w-20 sm:text-xs">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop: round row, all visible */}
        <div className="hidden justify-center gap-8 lg:flex">
          {SHOP_BY_STYLE_LINKS.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="group flex w-24 flex-col items-center gap-2.5"
            >
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-muted shadow-sm transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-md">
                <img
                  src={showcaseImages[item.id] || "/tshirt_model.png"}
                  alt={item.label}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/tshirt_model.png";
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <span className="text-center text-sm font-medium text-foreground group-hover:text-primary">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
