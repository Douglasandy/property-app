import type { PropertyReport } from "@/types/property";
import type { ReportDataSourceEntry } from "@/types/data-source";

export function getReportDataSources(
  report: PropertyReport
): ReportDataSourceEntry[] {
  return [
    { section: "Property details", meta: report.property.dataSourceMeta },
    { section: "Value estimate", meta: report.valueAnalysis.dataSourceMeta },
    { section: "Price trend", meta: report.priceTrend.dataSourceMeta },
    {
      section: "Planning activity",
      meta: report.planningActivity.dataSourceMeta,
    },
    { section: "Schools", meta: report.schools.dataSourceMeta },
    {
      section: "Environmental risk",
      meta: report.environmentalRisk.dataSourceMeta,
    },
    { section: "Area outlook", meta: report.areaOutlook.dataSourceMeta },
    {
      section: "Recommendation",
      meta: report.recommendation.dataSourceMeta,
    },
  ];
}
