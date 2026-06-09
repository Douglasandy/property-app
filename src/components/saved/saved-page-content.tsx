"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookmarkCheck,
  Check,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ToastMessage } from "@/components/ui/toast-message";
import { formatCurrency, formatSavedDate } from "@/lib/formatters";
import { localSavedReportsRepository } from "@/repositories/local-saved-reports-repository";
import {
  MAX_COMPARE_SELECTION,
  MIN_COMPARE_SELECTION,
  type SavedPropertyReport,
} from "@/types/saved-report";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface SavedReportCardProps {
  report: SavedPropertyReport;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function SavedReportCard({
  report,
  selected,
  onToggleSelect,
  onRemove,
}: SavedReportCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="relative aspect-[16/9] w-full bg-secondary">
        {report.thumbnailUrl ? (
          <Image
            src={report.thumbnailUrl}
            alt={report.address}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        {selected && (
          <div className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Check className="size-4" strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h2 className="text-base font-semibold text-navy">{report.address}</h2>
          <p className="text-sm text-muted-foreground">{report.postcode}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Asking price</p>
            <p className="font-semibold text-navy">
              {formatCurrency(report.askingPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fair value est.</p>
            <p className="font-semibold text-navy">
              {report.estimatedFairValue
                ? formatCurrency(report.estimatedFairValue)
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="font-semibold text-navy">
              {report.overallScore ?? "—"}/100
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Planning risk</p>
            <p className="font-semibold text-navy">
              {report.planningRiskScore ?? "—"}/100
            </p>
          </div>
        </div>

        {report.recommendation && (
          <Badge
            variant="outline"
            className="rounded-full border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700"
          >
            {report.recommendation}
          </Badge>
        )}

        <p className="text-xs text-muted-foreground">
          Saved {formatSavedDate(report.savedAt)}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href={`/report/${report.propertyId}`}
            className={buttonVariants({
              size: "sm",
              className: "rounded-xl bg-primary hover:bg-primary/90",
            })}
          >
            View report
            <ArrowRight className="size-4" />
          </Link>
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "rounded-xl",
              selected && "border-primary bg-brand-purple-light text-primary"
            )}
            onClick={() => onToggleSelect(report.id)}
          >
            {selected ? "Selected" : "Compare"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-xl text-muted-foreground"
            onClick={() => onRemove(report.id)}
          >
            <Trash2 className="size-4" />
            Remove
          </Button>
        </div>
      </div>
    </article>
  );
}

export function SavedPageContent() {
  const router = useRouter();
  const [reports, setReports] = useState<SavedPropertyReport[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    const saved = await localSavedReportsRepository.getSavedReports();
    setReports(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  function toggleSelect(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_COMPARE_SELECTION) {
        setToast(`You can compare up to ${MAX_COMPARE_SELECTION} homes`);
        return current;
      }
      return [...current, id];
    });
  }

  async function handleRemove(id: string) {
    await localSavedReportsRepository.removeReport(id);
    setSelectedIds((current) => current.filter((item) => item !== id));
    await loadReports();
    setToast("Removed from your shortlist");
  }

  function handleCompare() {
    if (selectedIds.length < MIN_COMPARE_SELECTION) {
      setToast(`Select at least ${MIN_COMPARE_SELECTION} homes to compare`);
      return;
    }
    router.push(`/compare?ids=${selectedIds.join(",")}`);
  }

  if (loading) {
    return (
      <div className="px-5 py-16 text-center text-sm text-muted-foreground">
        Loading your shortlist…
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 pb-28 pt-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-purple-light">
          <BookmarkCheck className="size-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-navy">Saved homes</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Your saved properties will appear here.
        </p>
        <Link
          href="/"
          className={buttonVariants({ className: "mt-6 rounded-xl" })}
        >
          Find a property
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 px-5 pb-32 pt-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-navy">Saved homes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {reports.length} home{reports.length !== 1 ? "s" : ""} on your
              shortlist
            </p>
          </div>
          {selectedIds.length > 0 && (
            <Badge className="rounded-full bg-brand-purple-light text-primary hover:bg-brand-purple-light">
              {selectedIds.length} selected
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <SavedReportCard
              key={report.id}
              report={report}
              selected={selectedIds.includes(report.id)}
              onToggleSelect={toggleSelect}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+68px)] z-40 px-5">
          <Button
            onClick={handleCompare}
            className="h-12 w-full max-w-lg mx-auto flex rounded-xl bg-primary text-sm font-semibold shadow-card-hover"
          >
            Compare {selectedIds.length} home
            {selectedIds.length !== 1 ? "s" : ""}
          </Button>
        </div>
      )}

      <ToastMessage
        message={toast ?? ""}
        visible={!!toast}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}
