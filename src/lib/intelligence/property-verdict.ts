import type {
  PropertyRecommendation,
  PropertyVerdict,
} from "@/types/recommendation";
import type {
  AreaOutlook,
  EnvironmentalRisk,
  PlanningActivity,
  RiskLevel,
  SchoolsSection,
  ValueAnalysisSection,
} from "@/types/property";
import type { ValueVerdict } from "@/types/valuation";

export interface PropertyVerdictInput {
  valueAnalysis: ValueAnalysisSection;
  planningActivity: PlanningActivity;
  environmentalRisk: EnvironmentalRisk;
  schools: SchoolsSection;
  areaOutlook: AreaOutlook;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function uniqueItems(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function calculateConfidence(input: PropertyVerdictInput): number {
  const valueConfidence = input.valueAnalysis.analysis.confidence;
  const planningConfidence = input.planningActivity.dataSourceMeta.confidence;
  const schoolsConfidence = input.schools.dataSourceMeta.confidence;
  const areaConfidence = input.areaOutlook.dataSourceMeta.confidence;
  const envConfidence = input.environmentalRisk.dataSourceMeta.confidence;

  const envWeight = envConfidence > 0 ? envConfidence : 25;
  const weights = [
    valueConfidence,
    planningConfidence,
    schoolsConfidence,
    areaConfidence,
    envWeight,
  ];

  let confidence = Math.round(
    weights.reduce((sum, w) => sum + w, 0) / weights.length
  );

  if (input.valueAnalysis.analysis.verdict === "Insufficient data") {
    confidence = Math.min(confidence, 44);
  }

  if (input.planningActivity.loadStatus === "error") {
    confidence -= 8;
  }

  return clamp(confidence, 0, 100);
}

function valueAdjustment(verdict: ValueVerdict): {
  delta: number;
  pro?: string;
  watchOut?: string;
} {
  switch (verdict) {
    case "Good value":
      return {
        delta: 10,
        pro: "Asking price looks competitive against local estimates",
      };
    case "Fairly priced":
      return {
        delta: 5,
        pro: "Price appears broadly in line with local market data",
      };
    case "Slightly overpriced":
      return {
        delta: -5,
        watchOut: "Asking price sits above our current fair value estimate",
      };
    case "Overpriced":
      return {
        delta: -12,
        watchOut: "Asking price is significantly above our estimate",
      };
    case "Insufficient data":
      return {
        delta: 0,
        watchOut: "Value estimate has limited comparable data",
      };
  }
}

function planningAdjustment(planning: PlanningActivity): {
  delta: number;
  pro?: string;
  watchOut?: string;
} {
  if (planning.loadStatus !== "success") {
    return { delta: 0, watchOut: "Planning activity could not be fully assessed" };
  }

  const { activityScore, riskScore, majorDevelopments } = planning.summary;
  let delta = 0;
  let pro: string | undefined;
  let watchOut: string | undefined;

  if (activityScore === "Low" && riskScore < 45) {
    delta += 5;
    pro = "Quiet planning environment nearby";
  } else if (activityScore === "Medium" || (riskScore >= 40 && riskScore < 65)) {
    delta -= 3;
    watchOut = "Moderate planning activity in the surrounding area";
  } else if (activityScore === "High" || riskScore >= 65) {
    delta -= 10;
    watchOut = "Active or higher-risk planning activity nearby";
  }

  if (majorDevelopments > 0) {
    delta -= 5;
    watchOut = watchOut
      ? `${watchOut}; major development nearby`
      : "Major development approved or proposed nearby";
  }

  return { delta, pro, watchOut };
}

function riskSeverity(level: RiskLevel): "low" | "medium" | "high" {
  if (level === "low" || level === "good") return "low";
  if (level === "medium" || level === "average") return "medium";
  return "high";
}

function environmentalAdjustment(environmental: EnvironmentalRisk): {
  delta: number;
  pro?: string;
  watchOut?: string;
} {
  const levels = [
    riskSeverity(environmental.floodRisk),
    riskSeverity(environmental.airQuality),
    riskSeverity(environmental.radonRisk),
  ];

  const hasHigh = levels.includes("high");
  const hasMedium = levels.includes("medium");
  const allLow = levels.every((l) => l === "low");

  if (environmental.dataSourceMeta.confidence === 0) {
    return { delta: 0 };
  }

  if (hasHigh) {
    return {
      delta: -12,
      watchOut: "One or more environmental risk indicators need attention",
    };
  }

  if (hasMedium) {
    return {
      delta: -4,
      watchOut: "Some environmental factors are moderate rather than low",
    };
  }

  if (allLow) {
    return {
      delta: 5,
      pro: "Environmental risk indicators look favourable",
    };
  }

  return { delta: 0 };
}

function areaOutlookAdjustment(outlook: AreaOutlook): {
  delta: number;
  pro?: string;
  watchOut?: string;
} {
  const text = [
    outlook.populationGrowth,
    outlook.housingDemand,
    outlook.developmentActivity,
    outlook.investmentPotential,
  ]
    .join(" ")
    .toLowerCase();

  let delta = 0;
  let pro: string | undefined;
  let watchOut: string | undefined;

  const strongSignals =
    (text.includes("high") ? 1 : 0) +
    (text.includes("strong") ? 1 : 0) +
    (text.includes("+") ? 1 : 0);
  const weakSignals =
    (text.includes("weak") ? 1 : 0) +
    (text.includes("low demand") ? 1 : 0) +
    (text.includes("declining") ? 1 : 0);

  if (strongSignals >= 2) {
    delta += 8;
    pro = "Area outlook suggests healthy demand and growth signals";
  } else if (strongSignals === 1) {
    delta += 5;
    pro = "Area fundamentals look reasonably positive";
  }

  if (weakSignals >= 2) {
    delta -= 10;
    watchOut = "Area demand and growth signals look softer";
  } else if (weakSignals === 1) {
    delta -= 5;
    watchOut = "Some area outlook indicators are less encouraging";
  }

  return { delta, pro, watchOut };
}

function schoolsAdjustment(schools: SchoolsSection): {
  delta: number;
  pro?: string;
  watchOut?: string;
} {
  const nearby = schools.items.filter((s) => s.distanceMetres <= 1000);
  const goodNearby = nearby.filter((s) => s.performanceRating === "good");

  if (goodNearby.length >= 2 || goodNearby.some((s) => s.distanceMetres <= 500)) {
    return {
      delta: 3,
      pro: "Good school options appear accessible nearby",
    };
  }

  if (nearby.length === 0 || nearby.every((s) => s.performanceRating === "poor")) {
    return {
      delta: -3,
      watchOut: "School options nearby look limited or weaker",
    };
  }

  return { delta: 0 };
}

function mapScoreToRecommendation(
  score: number
): PropertyRecommendation {
  if (score >= 82) return "Strong match";
  if (score >= 68) return "Worth viewing";
  if (score >= 55) return "Proceed with caution";
  if (score >= 40) return "Negotiate hard";
  return "Not enough data";
}

function buildSuggestedActions(
  recommendation: PropertyRecommendation,
  input: PropertyVerdictInput
): string[] {
  const actions: string[] = [];
  const valueVerdict = input.valueAnalysis.analysis.verdict;

  switch (recommendation) {
    case "Strong match":
      actions.push("Book a viewing while the listing is still available.");
      actions.push("Compare against one or two similar homes before offering.");
      break;
    case "Worth viewing":
      actions.push("Ask the agent how the asking price was set.");
      if (valueVerdict === "Slightly overpriced" || valueVerdict === "Overpriced") {
        actions.push(
          "Go in with a negotiation range based on the value estimate."
        );
      }
      actions.push("Check whether nearby planning activity affects traffic or outlook.");
      break;
    case "Proceed with caution":
      actions.push("Visit the area at different times of day before deciding.");
      actions.push("Ask follow-up questions about price, condition and nearby development.");
      break;
    case "Negotiate hard":
      actions.push("Use the value estimate as a starting point for your offer.");
      actions.push("Ask what comparable sales the agent is using to justify the price.");
      actions.push("Factor nearby planning activity into your negotiation position.");
      break;
    case "Not enough data":
      actions.push("Treat this as an early view — more data may change the picture.");
      actions.push("Worth checking additional sources before making any decisions.");
      break;
  }

  actions.push("Indicative only — not a professional valuation or buying advice.");
  return uniqueItems(actions).slice(0, 4);
}

function buildHeadlineAndSummary(
  recommendation: PropertyRecommendation,
  input: PropertyVerdictInput,
  confidence: number
): { headline: string; summary: string } {
  const valueVerdict = input.valueAnalysis.analysis.verdict;
  const prefix =
    confidence < 60
      ? "Based on the available data, "
      : "Based on the available data, ";

  switch (recommendation) {
    case "Strong match":
      return {
        headline: "This looks like a strong match on current signals.",
        summary: `${prefix}this property scores well across value, area outlook and local fundamentals. Worth shortlisting and viewing soon.`,
      };
    case "Worth viewing":
      if (
        valueVerdict === "Slightly overpriced" ||
        valueVerdict === "Overpriced"
      ) {
        return {
          headline: "Worth viewing, but go in with a negotiation range.",
          summary: `${prefix}this property has positive area signals and manageable environmental risk, but the asking price is above our current estimate.`,
        };
      }
      return {
        headline: "Worth viewing — this looks like a sensible next step.",
        summary: `${prefix}the overall signals are broadly positive. A viewing would help you sense-check condition, street feel and day-to-day practicality.`,
      };
    case "Proceed with caution":
      return {
        headline: "Proceed with caution and keep asking questions.",
        summary: `${prefix}there are mixed signals here. Some factors look fine, but others — such as price, planning or area outlook — deserve a closer look before you commit time.`,
      };
    case "Negotiate hard":
      return {
        headline: "Worth viewing, but expect to negotiate on price.",
        summary: `${prefix}other signals are reasonably positive, but the asking price looks high relative to our estimate. This looks more like a negotiate-hard opportunity than a straightforward yes.`,
      };
    case "Not enough data":
      return {
        headline: "Not enough data for a confident view yet.",
        summary: `${prefix}we do not have enough reliable section data to give a stronger opinion. Treat this as an early steer, not a final answer.`,
      };
  }
}

export function calculatePropertyVerdict(
  input: PropertyVerdictInput
): PropertyVerdict {
  let score = 70;
  const pros: string[] = [];
  const watchOuts: string[] = [];

  const value = valueAdjustment(input.valueAnalysis.analysis.verdict);
  score += value.delta;
  if (value.pro) pros.push(value.pro);
  if (value.watchOut) watchOuts.push(value.watchOut);

  const planning = planningAdjustment(input.planningActivity);
  score += planning.delta;
  if (planning.pro) pros.push(planning.pro);
  if (planning.watchOut) watchOuts.push(planning.watchOut);

  const environmental = environmentalAdjustment(input.environmentalRisk);
  score += environmental.delta;
  if (environmental.pro) pros.push(environmental.pro);
  if (environmental.watchOut) watchOuts.push(environmental.watchOut);

  const area = areaOutlookAdjustment(input.areaOutlook);
  score += area.delta;
  if (area.pro) pros.push(area.pro);
  if (area.watchOut) watchOuts.push(area.watchOut);

  const schoolAccess = schoolsAdjustment(input.schools);
  score += schoolAccess.delta;
  if (schoolAccess.pro) pros.push(schoolAccess.pro);
  if (schoolAccess.watchOut) watchOuts.push(schoolAccess.watchOut);

  score = clamp(score, 0, 100);
  const confidence = calculateConfidence(input);

  let recommendation = mapScoreToRecommendation(score);

  if (confidence < 45) {
    recommendation = "Not enough data";
  } else if (
    (input.valueAnalysis.analysis.verdict === "Overpriced" ||
      input.valueAnalysis.analysis.verdict === "Slightly overpriced") &&
    recommendation === "Proceed with caution" &&
    score >= 40
  ) {
    recommendation = "Negotiate hard";
  } else if (score < 40 && confidence >= 45) {
    recommendation = "Not enough data";
  }

  const { headline, summary } = buildHeadlineAndSummary(
    recommendation,
    input,
    confidence
  );

  return {
    recommendation,
    overallScore: score,
    confidence,
    headline,
    summary,
    pros: uniqueItems(pros).slice(0, 4),
    watchOuts: uniqueItems(watchOuts).slice(0, 4),
    suggestedActions: buildSuggestedActions(recommendation, input),
  };
}
