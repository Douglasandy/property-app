import { Menu } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Logo } from "@/components/layout/logo";
import { PropertyScoreCard } from "@/components/report/property-score-card";
import { ReportSectionPreview } from "@/components/home/report-section-preview";
import { UrlInputForm } from "@/components/home/url-input-form";
import { Badge } from "@/components/ui/badge";
import { mockPropertyReportBase } from "@/data/mock-property-report";

export default function HomePage() {
  return (
    <AppShell>
      <header className="sticky top-0 z-40 flex items-center justify-between bg-surface/95 px-5 py-4 backdrop-blur-md">
        <Logo />
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </header>

      <main className="space-y-8 px-5 pb-28 pt-2">
        <section className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-navy lg:text-4xl">
              Know more before you buy
            </h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground lg:text-base">
              Get instant insight into any Northern Ireland property. Paste a
              PropertyPal link to get started.
            </p>
          </div>
          <UrlInputForm />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-navy">
              Example Report
            </h2>
            <Badge className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50">
              Live
            </Badge>
          </div>
          <PropertyScoreCard
            property={mockPropertyReportBase.property}
            compact
          />
          <ReportSectionPreview />
        </section>
      </main>
    </AppShell>
  );
}
