import { Truck, RefreshCw, ShieldCheck, Banknote } from "lucide-react";
import { HOME_SECTION_COMPACT, HOME_SECTION_CONTAINER } from "./homeSectionStyles";

const TRUST_ITEMS = [
  { icon: Truck, label: "Fast delivery" },
  { icon: RefreshCw, label: "7-day exchange" },
  { icon: Banknote, label: "COD available" },
  { icon: ShieldCheck, label: "Secure checkout" },
];

export default function HomeTrustStrip() {
  return (
    <section className={`${HOME_SECTION_COMPACT} border-b border-border/50 bg-card/50`}>
      <div className={HOME_SECTION_CONTAINER}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="trust-badge flex items-center justify-center gap-2 py-2 text-xs font-medium sm:text-sm"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
