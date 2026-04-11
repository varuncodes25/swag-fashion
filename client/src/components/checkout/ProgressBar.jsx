import React from 'react';
import { 
  MapPin, 
  CreditCard, 
  Package,
  CheckCircle
} from 'lucide-react';

const ProgressBar = ({ 
  currentStep = 1,
  addressSelected = false,
  paymentSelected = false,
  onStepChange
}) => {
  const steps = [
    { 
      id: 1, 
      title: 'Address', 
      icon: MapPin,
      enabled: true
    },
    { 
      id: 2, 
      title: 'Payment', 
      icon: CreditCard,
      enabled: addressSelected
    },
    { 
      id: 3, 
      title: 'Review', 
      icon: Package,
      enabled: addressSelected && paymentSelected
    },
  ];

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  const handleStepClick = (step) => {
    if (step.enabled && onStepChange) {
      onStepChange(step.id);
    }
  };

  return (
    <div className="w-full px-4 py-6">
      {/* Progress Bar */}
      <div className="relative mb-8">
        {/* Background line */}
        <div className="absolute top-6 left-0 right-0 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
        
        {/* Progress line */}
        <div 
          className="absolute top-6 left-0 h-1.5 bg-primary dark:bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isNext = step.id === currentStep + 1;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step circle */}
                <button
                  onClick={() => handleStepClick(step)}
                  disabled={!step.enabled}
                  className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2
                    transition-all duration-300
                    ${isCompleted 
                      ? 'bg-primary border-primary text-white' 
                      : isActive
                      ? 'bg-card border-primary text-blue-500 dark:text-primary'
                      : step.enabled
                      ? 'bg-card border-border text-muted-foreground hover:border-blue-300 dark:hover:border-primary'
                      : 'bg-muted border-border text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </button>

                {/* Step label */}
                <div className="mt-3 text-center">
                  <p className={`
                    text-sm font-medium
                    ${isActive ? 'text-primary dark:text-primary' : 
                     step.enabled ? 'text-muted-foreground' : 
                     'text-gray-400 dark:text-gray-600'}
                  `}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Step {step.id}
                  </p>
                </div>

                {/* Connector line (except last step) */}
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-full h-0.5 -z-10" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {currentStep === 1 && "Add your delivery address"}
          {currentStep === 2 && "Select payment method"}
          {currentStep === 3 && "Review & place order"}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;