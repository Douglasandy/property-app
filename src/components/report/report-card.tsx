import { cn } from "@/lib/utils";
import { DataSourceBadge } from "./data-source-badge";
import type { DataSourceMeta } from "@/types/data-source";

interface ReportCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  dataSourceMeta?: DataSourceMeta;
}

export function ReportCard({
  title,
  icon,
  children,
  className,
  headerAction,
  dataSourceMeta,
}: ReportCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-card p-5 shadow-card",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            {icon && (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-purple-light text-primary">
                {icon}
              </div>
            )}
            <h2 className="text-[15px] font-semibold text-navy">{title}</h2>
          </div>
          {dataSourceMeta && (
            <div className="mt-2 pl-0 sm:pl-[42px]">
              <DataSourceBadge meta={dataSourceMeta} />
            </div>
          )}
        </div>
        {headerAction}
      </div>
      {children}
    </section>
  );
}
