import { BadgeCheck } from "lucide-react";

export default function VerifiedPurchaseBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 sm:text-[11px] ${className}`}
    >
      <BadgeCheck className="h-3 w-3 shrink-0" aria-hidden />
      Verified Purchase
    </span>
  );
}

/** Reviews on this store require a delivered order — show badge unless explicitly false */
export function isVerifiedPurchaseReview(review) {
  if (!review) return false;
  if (review.verifiedPurchase === false) return false;
  return true;
}
