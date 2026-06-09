import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  ComparePageContent,
  ComparePageHeader,
} from "@/components/compare/compare-page-content";

function CompareFallback() {
  return (
    <div className="px-5 py-16 text-center text-sm text-muted-foreground">
      Loading comparison…
    </div>
  );
}

export default function ComparePage() {
  return (
    <AppShell hideBottomNav>
      <ComparePageHeader />
      <Suspense fallback={<CompareFallback />}>
        <ComparePageContent />
      </Suspense>
    </AppShell>
  );
}
