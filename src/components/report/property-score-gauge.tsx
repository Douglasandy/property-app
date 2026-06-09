import { cn } from "@/lib/utils";

interface PropertyScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PropertyScoreGauge({
  score,
  size = "md",
  className,
}: PropertyScoreGaugeProps) {
  const radius = size === "lg" ? 36 : size === "sm" ? 24 : 30;
  const strokeWidth = size === "lg" ? 5 : size === "sm" ? 3.5 : 4;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const sizeClasses = {
    sm: "size-14",
    md: "size-[72px]",
    lg: "size-24",
  };

  const textClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  const labelClasses = {
    sm: "text-[8px]",
    md: "text-[9px]",
    lg: "text-[10px]",
  };

  const svgSize = size === "lg" ? 96 : size === "sm" ? 56 : 72;
  const center = svgSize / 2;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-white shadow-md",
        sizeClasses[size],
        className
      )}
    >
      <svg
        width={svgSize}
        height={svgSize}
        className="-rotate-90"
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold leading-none text-navy", textClasses[size])}>
          {score}
        </span>
        <span className={cn("font-medium text-muted-foreground", labelClasses[size])}>
          / 100
        </span>
      </div>
    </div>
  );
}
