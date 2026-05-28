import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const showcaseItems = [
  {
    id: "hyper-prints",
    title: "Hyper Prints",
    image: "/images/home-showcase/Hyper-Prints----men-1774502495.webp",
    href: "/category/all?search=graphic%20tee",
  },
  {
    id: "minimalistic",
    title: "Minimalistic",
    image: "/images/home-showcase/Minimal-Prints---men-1774502494.webp",
    href: "/category/all?search=minimal%20tshirt",
  },
  {
    id: "acid-washed",
    title: "Acid-Washed",
    image: "/images/home-showcase/Acid-Wash----men-1774502496.webp",
    href: "/category/all?washType=Acid%20Wash",
  },
  {
    id: "word-drip",
    title: "Word Drip",
    image: "/images/home-showcase/desktop-T-shirt-Widgets-worddrip-men-1774245323.webp",
    href: "/category/all?search=typography%20tshirt",
  },
  {
    id: "solids",
    title: "Solids",
    image: "/images/home-showcase/Solids----men-1774502493.webp",
    href: "/category/all?search=solid%20tshirt",
  },
  {
    id: "explore-all",
    title: "Explore All",
    image: "/images/home-showcase/Desktop-T-shirt-Widgets-360x400-6--1772133770.webp",
    href: "/category/all",
    isExploreAll: true,
  },
];

export default function HomeShowcaseSection() {
  return (
    <section className="bg-[#f5f5f5] px-2 pb-3 pt-2 sm:px-4">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-background p-2 sm:p-3">
        <div className="mb-2 text-center sm:mb-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Oversized Tees Haul
          </h2>
          <p className="text-sm text-muted-foreground underline decoration-yellow-400 decoration-2 underline-offset-4 sm:text-base">
            Bestsellers in one place
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:flex lg:flex-nowrap">
          {showcaseItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="group relative block overflow-hidden rounded-[4px] lg:w-[calc(16.666%-0.35rem)] lg:shrink-0"
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
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
              <div className="absolute bottom-2 left-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>

              {item.isExploreAll && (
                <>
                  <div className="absolute inset-0 bg-white/25" />
                </>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
