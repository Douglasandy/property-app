"use client";

import { useCallback, useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastMessage } from "@/components/ui/toast-message";
import { localSavedReportsRepository } from "@/repositories/local-saved-reports-repository";
import type { SavedPropertyReport } from "@/types/saved-report";

interface ReportActionsProps {
  savedReport: SavedPropertyReport;
}

export function ReportActions({ savedReport }: ReportActionsProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const checkSaved = useCallback(async () => {
    const saved = await localSavedReportsRepository.isReportSaved(
      savedReport.propertyId
    );
    setIsSaved(saved);
    setLoading(false);
  }, [savedReport.propertyId]);

  useEffect(() => {
    checkSaved();
  }, [checkSaved]);

  async function handleSaveToggle() {
    if (isSaved) {
      await localSavedReportsRepository.removeReport(savedReport.id);
      setIsSaved(false);
      setToast("Removed from your shortlist");
      return;
    }

    await localSavedReportsRepository.saveReport({
      ...savedReport,
      savedAt: new Date().toISOString(),
    });
    setIsSaved(true);
    setToast("Added to your shortlist");
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg gap-3 lg:max-w-2xl xl:max-w-4xl">
          <Button
            variant="outline"
            size="icon"
            className="size-12 shrink-0 rounded-xl"
            aria-label="Share report"
          >
            <Share2 className="size-5" />
          </Button>
          <Button
            onClick={handleSaveToggle}
            disabled={loading}
            variant={isSaved ? "outline" : "default"}
            className="h-12 flex-1 rounded-xl text-sm font-semibold"
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="size-4" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="size-4" />
                Save to shortlist
              </>
            )}
          </Button>
        </div>
      </div>

      <ToastMessage
        message={toast ?? ""}
        visible={!!toast}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}
