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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t dark:border-gray-700 shadow-2xl p-4 z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Payable</p>
            <p className="font-bold text-foreground text-xl">₹{total.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
          </div>
          <div className="flex-1 max-w-[200px]">
            <PlaceOrderButton isDisabled={!paymentMethod} />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'summary') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t dark:border-gray-700 shadow-2xl p-4 z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Payable</p>
            <p className="font-bold text-foreground text-xl">₹{total.toFixed(2)}</p>
          </div>
          <button
            onClick={() => setCurrentStep('payment')}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2"
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t dark:border-gray-700 shadow-2xl p-4 z-50">
        <div className="flex items-center justify-between">
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
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-lg shadow-lg active:scale-95 transition-transform"
            >
              Continue
            </button>
          ) : (
            <button
              disabled
              className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-muted-foreground font-semibold rounded-lg"
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