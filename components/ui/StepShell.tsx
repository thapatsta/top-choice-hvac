import type { ReactNode } from "react";

export function StepShell({
  stepNumber,
  totalSteps,
  title,
  children,
  onBack,
}: {
  stepNumber: number;
  totalSteps: number;
  title: string;
  children: ReactNode;
  onBack?: () => void;
}) {
  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-muted">
          <span>
            Step {stepNumber} of {totalSteps}
          </span>
          {onBack && (
            <button type="button" onClick={onBack} className="font-semibold text-ember hover:underline">
              ← Back
            </button>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-ember transition-all duration-300"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">{title}</h2>
      <div className="mt-6 flex flex-col gap-3">{children}</div>
    </div>
  );
}
