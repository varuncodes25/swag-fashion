import { ShieldCheck } from "lucide-react";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI" },
  { id: "razorpay", label: "Razorpay" },
  { id: "visa", label: "Visa" },
  { id: "mastercard", label: "Mastercard" },
  { id: "cod", label: "COD" },
];

export default function PaymentTrustRow({
  title = "100% secure payments",
  compact = false,
  className = "",
}) {
  return (
    <div className={`rounded-lg border border-border bg-muted/30 p-3 ${className}`}>
      <div className="mb-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
        <span className="font-medium text-foreground">{title}</span>
      </div>
      <div
        className={`flex flex-wrap items-center gap-2 ${
          compact ? "justify-center" : "justify-center sm:justify-start"
        }`}
      >
        {PAYMENT_METHODS.map((method) => (
          <span
            key={method.id}
            className="rounded-md border border-border bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[11px]"
          >
            {method.label}
          </span>
        ))}
      </div>
    </div>
  );
}
