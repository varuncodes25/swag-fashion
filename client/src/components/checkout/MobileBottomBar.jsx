// components/checkout/MobileBottomBar.jsx
import React from 'react';
import PlaceOrderButton from './PlaceOrderButton';
import { ArrowLeft } from 'lucide-react';

const MobileBottomBar = ({ 
  currentStep, 
  addressId, 
  total, 
  discount, 
  paymentMethod, 
  setCurrentStep 
}) => {
  if (currentStep === 'payment') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/95 p-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Total Payable</p>
            <p className="text-lg font-bold text-foreground">₹{total.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground">Inclusive of all taxes</p>
          </div>
          <div className="max-w-[180px] flex-1">
            <PlaceOrderButton isDisabled={!paymentMethod} />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'summary') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/95 p-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Total Payable</p>
            <p className="text-lg font-bold text-foreground">₹{total.toFixed(2)}</p>
          </div>
          <button
            onClick={() => setCurrentStep('payment')}
            className="btn-premium px-4 py-2 text-xs sm:text-sm"
          >
            <span>Continue to Payment</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'address') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/95 p-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            {addressId ? (
              <div className="text-success">
                <p className="text-sm font-medium">Address Selected ✓</p>
                <p className="text-xs">Ready to proceed</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">Select Address to Continue</p>
                <p className="text-xs text-muted-foreground">Choose delivery location</p>
              </div>
            )}
          </div>
          {addressId ? (
            <button
              onClick={() => setCurrentStep('summary')}
              className="btn-premium px-4 py-2 text-xs sm:text-sm"
            >
              Continue
            </button>
          ) : (
            <button
              disabled
              className="rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground sm:text-sm"
            >
              Select Address
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default MobileBottomBar;