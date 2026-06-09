import Image from "next/image";
import { Bath, BedDouble, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PropertyScoreGauge } from "./property-score-gauge";
import { DataSourceBadge } from "./data-source-badge";
import { formatCurrency } from "@/lib/formatters";
import type { PropertySummary } from "@/types/property";
import { cn } from "@/lib/utils";

interface PropertyScoreCardProps {
  property: PropertySummary;
  compact?: boolean;
  showDataSource?: boolean;
}

const tagVariants = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
  purple: "bg-violet-50 text-violet-700 border-violet-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
};

export function PropertyScoreCard({
  property,
  compact = false,
  showDataSource = false,
}: PropertyScoreCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={property.imageUrl}
          alt={property.address}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 480px"
        />
        <div className="absolute right-3 top-3">
          <PropertyScoreGauge score={property.score} size="md" />
        </div>
      </div>

      <div className={cn("space-y-3", compact ? "p-4" : "p-5")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold leading-snug text-navy">
              {property.address}
            </h3>
            <p className="text-sm text-muted-foreground">
              {property.city}, {property.postcode}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-navy">
              {formatCurrency(property.askingPrice)}
            </p>
            <p className="text-xs text-muted-foreground">Asking Price</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble className="size-4" />
            {property.bedrooms} Beds
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="size-4" />
            {property.bathrooms} Baths
          </span>
          <span className="flex items-center gap-1.5">
            <Home className="size-4" />
            {property.propertyType}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {property.tags.map((tag) => (
            <Badge
              key={tag.label}
              variant="outline"
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                tagVariants[tag.variant]
              )}
            >
              {tag.label}
            </Badge>
          ))}
        </div>

        {showDataSource && (
          <DataSourceBadge meta={property.dataSourceMeta} />
        )}
      </div>
    </div>
  );
}
