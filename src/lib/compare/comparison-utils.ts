import type { SavedPropertyReport } from "@/types/saved-report";

export interface ComparisonMetric {
  key: string;
  label: string;
  format: (report: SavedPropertyReport) => string;
  higherIsBetter?: boolean;
  lowerIsBetter?: boolean;
}

export const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    key: "askingPrice",
    label: "Asking price",
    format: (r) => formatMoney(r.askingPrice),
    lowerIsBetter: true,
  },
  {
    key: "estimatedFairValue",
    label: "Estimated fair value",
    format: (r) =>
      r.estimatedFairValue ? formatMoney(r.estimatedFairValue) : "—",
  },
  {
    key: "difference",
    label: "Difference vs estimate",
    format: (r) =>
      r.valueDifferencePercent !== undefined
        ? `${r.valueDifferencePercent > 0 ? "+" : ""}${r.valueDifferencePercent}%`
        : "—",
    lowerIsBetter: true,
  },
  {
    key: "overallScore",
    label: "Overall score",
    format: (r) =>
      r.overallScore !== undefined ? `${r.overallScore}/100` : "—",
    higherIsBetter: true,
  },
  {
    key: "recommendation",
    label: "Recommendation",
    format: (r) => r.recommendation ?? "—",
  },
  {
    key: "planningRisk",
    label: "Planning risk",
    format: (r) =>
      r.planningRiskScore !== undefined
        ? `${r.planningRiskScore}/100`
        : "—",
    lowerIsBetter: true,
  },
  {
    key: "environmentalRisk",
    label: "Environmental risk",
    format: (r) => r.environmentalRiskLabel ?? "—",
    lowerIsBetter: true,
  },
  {
    key: "areaOutlook",
    label: "Area outlook score",
    format: (r) =>
      r.areaOutlookScore !== undefined ? `${r.areaOutlookScore}/100` : "—",
    higherIsBetter: true,
  },
];

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function numericValue(
  report: SavedPropertyReport,
  metric: ComparisonMetric
): number | null {
  switch (metric.key) {
    case "askingPrice":
      return report.askingPrice;
    case "estimatedFairValue":
      return report.estimatedFairValue ?? null;
    case "difference":
      return report.valueDifferencePercent ?? null;
    case "overallScore":
      return report.overallScore ?? null;
    case "planningRisk":
      return report.planningRiskScore ?? null;
    case "areaOutlook":
      return report.areaOutlookScore ?? null;
    default:
      return null;
  }
}

function environmentalRank(label?: string): number | null {
  if (!label) return null;
  if (label.toLowerCase().includes("low")) return 1;
  if (label.toLowerCase().includes("medium")) return 2;
  if (label.toLowerCase().includes("high")) return 3;
  return null;
}

export function findBestFit(reports: SavedPropertyReport[]): string | null {
  if (reports.length === 0) return null;

  const scored = reports.map((report) => {
    let points = 0;

    points += (report.overallScore ?? 0) * 2;
    points += report.areaOutlookScore ?? 0;
    points -= report.planningRiskScore ?? 0;
    points -= Math.max(0, report.valueDifferencePercent ?? 0) * 2;

    const envRank = environmentalRank(report.environmentalRiskLabel);
    if (envRank === 1) points += 10;
    if (envRank === 3) points -= 10;

    return { id: report.id, points };
  });

  scored.sort((a, b) => b.points - a.points);
  return scored[0]?.id ?? null;
}

export function isMetricWinner(
  report: SavedPropertyReport,
  metric: ComparisonMetric,
  reports: SavedPropertyReport[]
): boolean {
  const values = reports
    .map((r) => ({ id: r.id, value: numericValue(r, metric) }))
    .filter((entry) => entry.value !== null);

  if (values.length < 2) return false;

  const envValues = reports
    .map((r) => ({
      id: r.id,
      value: environmentalRank(r.environmentalRiskLabel),
    }))
    .filter((entry) => entry.value !== null);

  if (metric.key === "environmentalRisk" && envValues.length >= 2) {
    const best = Math.min(...envValues.map((v) => v.value as number));
    return environmentalRank(report.environmentalRiskLabel) === best;
  }

  if (metric.key === "recommendation") return false;

  const nums = values as { id: string; value: number }[];
  const target = numericValue(report, metric);
  if (target === null) return false;

  if (metric.higherIsBetter) {
    const best = Math.max(...nums.map((v) => v.value));
    return target === best;
  }

  if (metric.lowerIsBetter) {
    const best = Math.min(...nums.map((v) => v.value));
    return target === best;
  }

  return false;
}
