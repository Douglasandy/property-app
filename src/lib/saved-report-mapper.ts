import type { PropertyReport, RiskLevel } from "@/types/property";
import type { SavedPropertyReport } from "@/types/saved-report";

function riskSeverity(level: RiskLevel): number {
  if (level === "low" || level === "good") return 1;
  if (level === "medium" || level === "average") return 2;
  return 3;
}

export function deriveEnvironmentalRiskLabel(
  report: PropertyReport
): string {
  if (report.environmentalRisk.dataSourceMeta.confidence === 0) {
    return "Source pending";
  }

  const levels = [
    report.environmentalRisk.floodRisk,
    report.environmentalRisk.airQuality,
    report.environmentalRisk.radonRisk,
  ];

  const worst = Math.max(...levels.map(riskSeverity));

  if (worst <= 1) return "Low risk";
  if (worst === 2) return "Medium risk";
  return "High risk";
}

export function deriveAreaOutlookScore(report: PropertyReport): number {
  const text = [
    report.areaOutlook.populationGrowth,
    report.areaOutlook.housingDemand,
    report.areaOutlook.developmentActivity,
    report.areaOutlook.investmentPotential,
  ]
    .join(" ")
    .toLowerCase();

  let score = 50;

  if (text.includes("high") || text.includes("strong")) score += 15;
  if (text.includes("moderate")) score += 5;
  if (text.includes("weak") || text.includes("low demand")) score -= 15;
  if (text.includes("+")) score += 8;

  return Math.min(100, Math.max(0, score));
}

export function mapReportToSaved(report: PropertyReport): SavedPropertyReport {
  const analysis = report.valueAnalysis.analysis;
  const propertyId = report.property.id;

  return {
    id: propertyId,
    propertyId,
    savedAt: new Date().toISOString(),
    sourceUrl: report.listingImport?.sourceUrl,
    address: report.property.address,
    postcode: report.property.postcode,
    askingPrice: report.property.askingPrice,
    estimatedFairValue:
      analysis.verdict === "Insufficient data"
        ? undefined
        : analysis.estimatedFairValue,
    overallScore: report.recommendation.verdict.overallScore,
    recommendation: report.recommendation.verdict.recommendation,
    planningRiskScore:
      report.planningActivity.loadStatus === "success"
        ? report.planningActivity.summary.riskScore
        : undefined,
    environmentalRiskLabel: deriveEnvironmentalRiskLabel(report),
    thumbnailUrl: report.property.imageUrl,
    valueDifferencePercent:
      analysis.verdict === "Insufficient data"
        ? undefined
        : analysis.differencePercent,
    areaOutlookScore: deriveAreaOutlookScore(report),
  };
}
