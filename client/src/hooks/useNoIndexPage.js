import { useEffect } from "react";
import { applySeoMeta } from "@/utils/seo";

export const NOINDEX_ROBOTS = "noindex,nofollow";

const NOINDEX_PREFIXES = [
  "/login",
  "/signup",
  "/checkout",
  "/admin",
  "/account",
  "/orders",
  "/auth/",
  "/forgot-password",
  "/reset-password",
  "/success",
];

export const pathShouldNoIndex = (pathname = "") =>
  NOINDEX_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  );

/** Tell search engines not to index private / transactional pages. */
export function useNoIndexPage(title = "Swag Fashion") {
  useEffect(() => {
    applySeoMeta({
      title,
      robots: NOINDEX_ROBOTS,
    });
  }, [title]);
}
