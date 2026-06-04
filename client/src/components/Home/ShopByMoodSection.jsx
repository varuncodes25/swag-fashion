import { Link } from "react-router-dom";
import {
  Briefcase,
  Dumbbell,
  Palmtree,
  Shirt,
  Sparkles,
} from "lucide-react";
import {
  HOME_SECTION_CLASS,
  HOME_SECTION_CONTAINER,
} from "./homeSectionStyles";

const moods = [
  {
    id: "college",
    label: "College",
    icon: Sparkles,
    href: "/category/all?search=college",
    gradient: "from-violet-500/20 to-purple-600/10",
  },
  {
    id: "gym",
    label: "Gym",
    icon: Dumbbell,
    href: "/category/all?occasion=Sports",
    gradient: "from-orange-500/20 to-red-600/10",
  },
  {
    id: "travel",
    label: "Travel",
    icon: Palmtree,
    href: "/category/all?occasion=Travel",
    gradient: "from-sky-500/20 to-blue-600/10",
  },
  {
    id: "casual",
    label: "Casual",
    icon: Shirt,
    href: "/category/all?occasion=Casual",
    gradient: "from-emerald-500/20 to-teal-600/10",
  },
  {
    id: "streetwear",
    label: "Streetwear",
    icon: Briefcase,
    href: "/category/all?search=streetwear",
    gradient: "from-amber-500/20 to-yellow-600/10",
  },
];

export default function ShopByMoodSection() {
  return (
    <section className={HOME_SECTION_CLASS}>
      <div className={HOME_SECTION_CONTAINER}>
        <div className="mb-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Your vibe
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Shop By Mood
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Tees that match where you&apos;re headed — campus, gym, or streets.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {moods.map(({ id, label, icon: Icon, href, gradient }) => (
            <Link
              key={id}
              to={href}
              className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-gradient-to-br ${gradient} p-6 transition hover:border-primary/40 hover:shadow-md active:scale-[0.98]`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 shadow-sm ring-1 ring-border/60 transition group-hover:scale-110">
                <Icon className="h-6 w-6 text-primary" />
              </span>
              <span className="text-sm font-semibold text-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
