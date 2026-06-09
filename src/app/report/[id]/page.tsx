import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AreaOutlookCard } from "@/components/report/area-outlook-card";
import { EnvironmentalRiskCard } from "@/components/report/environmental-risk-card";
import { PlanningActivityCard } from "@/components/report/planning-activity-card";
import { PriceTrendCard } from "@/components/report/price-trend-card";
import { PropertyScoreCard } from "@/components/report/property-score-card";
import { ListingImportPanel } from "@/components/report/listing-import-panel";
import { AboutReportSection } from "@/components/report/about-report-section";
import { RecommendationCard } from "@/components/report/recommendation-card";
import { ReportActions } from "@/components/report/report-actions";
import { SchoolsCard } from "@/components/report/schools-card";
import { ValueAnalysisCard } from "@/components/report/value-analysis-card";
import { DataDebugPanel } from "@/components/report/data-debug-panel";
import { propertyRepository } from "@/repositories/mock-property-repository";
import { mapReportToSaved } from "@/lib/saved-report-mapper";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const report = await propertyRepository.getReportById(id);

  if (!report) {
    notFound();
  }

  return (
    <AppShell hideBottomNav>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-white/95 px-4 py-3 backdrop-blur-md">
        <Link
          href="/"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="max-w-[60%] truncate text-sm font-semibold text-navy">
          {report.property.address}
        </h1>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Share report"
        >
          <Share2 className="size-5" />
        </button>
      </header>

      <main className="space-y-4 px-4 py-4 pb-28 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0 xl:grid-cols-3">
        {report.listingImport && (
          <div className="lg:col-span-2 xl:col-span-3">
            <ListingImportPanel listing={report.listingImport} />
          </div>
        )}

        <div className="space-y-4 lg:col-span-2 xl:col-span-3">
          <PropertyScoreCard
            property={report.property}
            showDataSource
          />
        </div>

        <ValueAnalysisCard data={report.valueAnalysis} />
        <PriceTrendCard data={report.priceTrend} />
        <PlanningActivityCard data={report.planningActivity} />
        <SchoolsCard schools={report.schools} />
        <EnvironmentalRiskCard data={report.environmentalRisk} />
        <AreaOutlookCard data={report.areaOutlook} />

        <div className="lg:col-span-2 xl:col-span-3">
          <AboutReportSection report={report} />
        </div>

        <div className="lg:col-span-2 xl:col-span-3">
          <RecommendationCard data={report.recommendation} />
        </div>

        <div className="lg:col-span-2 xl:col-span-3">
          <DataDebugPanel report={report} />
        </div>
      </main>

      <ReportActions savedReport={mapReportToSaved(report)} />
    </AppShell>
  );
}
