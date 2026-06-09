import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isCompleted = completedSteps.includes(stepNum);
        const isCurrent = stepNum === currentStep;
        const isUpcoming = !isCompleted && !isCurrent;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all",
                  isCompleted && "bg-[#09090b] text-white",
                  isCurrent && "bg-[#0098f2] text-white ring-4 ring-[#0098f2]/20",
                  isUpcoming && "bg-[#ececee] text-[#a1a1aa]"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-[11px] font-medium hidden sm:block",
                  isCompleted && "text-[#09090b]",
                  isCurrent && "text-[#0098f2]",
                  isUpcoming && "text-[#a1a1aa]"
                )}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-12 mx-2 mb-5 rounded-full sm:w-20",
                  isCompleted ? "bg-[#09090b]" : "bg-[#ececee]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
