import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const showcaseItems = [
  {
    id: "graphic-prints",
    title: "Graphic Prints",
    badge: "🔥",
    image: "/images/home-showcase/graphic-prints.webp",
    href: "/category/all?style=graphic",
  },
  {
    id: "anime",
    title: "Anime",
    image: "/images/home-showcase/anime.webp",
    href: "/category/all?search=anime",
  },
  {
    id: "acid-wash",
    title: "Acid Wash",
    image: "/images/home-showcase/acid-wash.webp",
    href: "/category/all?washType=Acid%20Wash",
  },
  {
    id: "minimalist",
    title: "Minimalist",
    image: "/images/home-showcase/minimalist.webp",
    href: "/category/all?style=minimalist",
  },
  {
    id: "solids",
    title: "Solids",
    image: "/images/home-showcase/solids.webp",
    href: "/category/all?style=solids",
  },
];

export default function HomeShowcaseSection() {
  return (
    <section className="bg-[#f5f5f5] px-2 pb-3 pt-2 sm:px-4">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-background p-2 sm:p-3">
        <div className="mb-2 text-center sm:mb-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Shop by Style
          </h2>
          <p className="text-sm text-muted-foreground underline decoration-yellow-400 decoration-2 underline-offset-4 sm:text-base">
            Graphic, anime, acid wash, minimal & solids
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-5">
          {showcaseItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="group relative block overflow-hidden rounded-[4px]"
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/tshirt_model.png";
                }}
                className="h-44 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-52"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />
              <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
                <span className="text-sm font-bold text-white drop-shadow-sm sm:text-base">
                  {item.title}
                  {item.badge ? ` ${item.badge}` : ""}
                </span>
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
