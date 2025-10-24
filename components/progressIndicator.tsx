"use client";

import useCreationStore from "@/state/creationState";
import usePortalStore from "@/state/portal";

interface Step {
  id: string;
  label: string;
}

interface ProgressIndicatorProps {
  currentStep: number; // 0-based index
}

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const setRewindToStep = useCreationStore((state) => state.setRewindToStep);
  const openPortal = usePortalStore((state) => state.openPortal);

  const steps: Step[] = [
    { id: "title", label: "Title" },
    { id: "prerequisites", label: "Prerequisites" },
    { id: "target", label: "Target" },
    { id: "outline", label: "Outline" },
  ];
 
  const handleJumpToStep = (stepIndex: number) => {
    if (stepIndex >= currentStep) return; // Prevent jumping forward
    setRewindToStep(stepIndex + 1); // +1 because steps are 0-indexed
    openPortal("rewind");
  };
  return (
    <div className="w-full max-w-3xl mx-auto mt-4 mb-4 px-4 ">
      <div className="relative flex justify-between items-center">
        {/* Base Line */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-700 -translate-y-1/2 rounded-full" />

        {/* Active Line */}
        <div
          className="absolute top-1/2 left-0 h-[1px] bg-gray-500 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
          style={{
            width:
              currentStep === 0
                ? "0%"
                : `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center w-1/4 text-center"
            >
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full border-[2px] text-sm font-medium transition-all cursor-pointer duration-300 ${
                  isActive
                    ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/30 scale-110"
                    : isCompleted
                    ? "bg-gray-600 border-gray-500 text-white"
                    : "bg-[#1a1a1a] border-gray-600 text-gray-400"
                } hover:border-blue-400`}
                onClick={() => handleJumpToStep(index)}
              >
                {index + 1}
              </div>
              <span
                className={`mt-3 text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "text-blue-400"
                    : isCompleted
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
