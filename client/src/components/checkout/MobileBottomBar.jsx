import React from "react";
import PlaceOrderButton from "./PlaceOrderButton";
import { ArrowRight } from "lucide-react";

const barClass =
  "lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/95 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm safe-area-pb";

const MobileBottomBar = ({
  currentStep,
  addressId,
  total,
  paymentMethod,
  setCurrentStep,
}) => {
  if (currentStep === "payment") {
    return (
      <div className={barClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="text-base font-bold leading-tight text-foreground">
              ₹{total.toFixed(2)}
            </p>
          </div>
          <div className="min-w-[140px] flex-1 max-w-[200px]">
            <PlaceOrderButton isDisabled={!paymentMethod} />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "summary") {
    return (
      <div className={barClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="text-base font-bold leading-tight text-foreground">
              ₹{total.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep("payment")}
            className="btn-premium inline-flex shrink-0 items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            Payment
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === "address") {
    return (
      <div className={barClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {addressId ? (
              <p className="text-xs font-medium text-green-600">
                Address selected
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Select delivery address
              </p>
            )}
          </div>
          {addressId ? (
            <button
              type="button"
              onClick={() => setCurrentStep("summary")}
              className="btn-premium shrink-0 px-4 py-2 text-xs font-semibold"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="shrink-0 rounded-lg bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default MobileBottomBar;
