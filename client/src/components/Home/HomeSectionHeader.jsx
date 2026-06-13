import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Shared header for home page product sections (consistent layout + colors).
 */
export default function HomeSectionHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View all",
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 sm:mb-6 sm:gap-4">
      <div>
        {badge && (
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5" />}
            {badge}
          </div>
        )}
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 max-w-md text-xs text-muted-foreground sm:mt-1 sm:text-sm">{subtitle}</p>
        )}
      </div>
      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary/80 sm:inline-flex"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
