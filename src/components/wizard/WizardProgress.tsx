import { WizardStep } from "@/types/wizard";

interface WizardProgressProps {
  currentStep: WizardStep;
  totalSteps?: number;
}

export function WizardProgress({ currentStep, totalSteps = 6 }: WizardProgressProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= stepNumber
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < totalSteps && (
              <div
                className={`w-12 h-1 mx-2 ${
                  currentStep > stepNumber ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 