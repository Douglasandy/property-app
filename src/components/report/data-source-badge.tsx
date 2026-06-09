import { Badge } from "@/components/ui/badge";
import type { DataSourceMeta, DataStatus } from "@/types/data-source";
import { cn } from "@/lib/utils";

const statusStyles: Record<DataStatus, string> = {
  live: "border-emerald-200 bg-emerald-50 text-emerald-700",
  imported: "border-violet-200 bg-violet-50 text-violet-700",
  mock: "border-slate-200 bg-slate-50 text-slate-600",
  estimated: "border-amber-200/80 bg-amber-50/80 text-amber-800",
  unavailable: "border-slate-200 bg-slate-50/80 text-slate-500",
};

interface DataSourceBadgeProps {
  meta: DataSourceMeta;
  showConfidence?: boolean;
  className?: string;
}

export function DataSourceBadge({
  meta,
  showConfidence = false,
  className,
}: DataSourceBadgeProps) {
  return (
    <Badge
      variant="outline"
      title={meta.note}
      className={cn(
        "max-w-full truncate rounded-full border px-2 py-0 text-[10px] font-medium leading-5",
        statusStyles[meta.status],
        className
      )}
    >
      {meta.label}
      {showConfidence && meta.confidence > 0 && (
        <span className="ml-1 opacity-75">· {meta.confidence}%</span>
      )}
    </Badge>
  );
}

export function DataSourceStatusLabel({ meta }: { meta: DataSourceMeta }) {
  return (
    <span className="text-xs text-muted-foreground">
      {meta.label}
      {meta.sourceName && meta.status !== "imported" && (
        <span className="text-muted-foreground/80"> · {meta.sourceName}</span>
      )}
    </span>
  );
}
