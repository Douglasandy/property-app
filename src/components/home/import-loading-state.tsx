"use client";

import { Check, Loader2 } from "lucide-react";
import { IMPORT_STEPS } from "@/services/propertypal";
import { cn } from "@/lib/utils";

interface ImportLoadingStateProps {
  currentStepIndex: number;
}

export function ImportLoadingState({
  currentStepIndex,
}: ImportLoadingStateProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Generating insight report"
    >
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-card-hover">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-purple-light">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">
              Building your report
            </p>
            <p className="text-xs text-muted-foreground">
              This usually takes a few seconds
            </p>
          </div>
        </div>

        <ol className="space-y-3">
          {IMPORT_STEPS.map((step, index) => {
            const isComplete = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <li
                key={step}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                  isActive && "bg-brand-purple-light/60",
                  isPending && "opacity-50"
                )}
              >
                <div
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full",
                    isComplete && "bg-success text-success-foreground",
                    isActive && "bg-primary text-primary-foreground",
                    isPending && "bg-secondary text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <Check className="size-3.5" strokeWidth={3} />
                  ) : isActive ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    isActive || isComplete
                      ? "font-medium text-navy"
                      : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
