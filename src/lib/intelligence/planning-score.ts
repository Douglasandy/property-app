import type {
  PlanningApplication,
  PlanningActivitySummary,
  PlanningCategory,
  PlanningStatus,
} from "@/types/planning";

function categoryWeight(category: PlanningCategory): number {
  switch (category) {
    case "housing":
      return 3;
    case "infrastructure":
      return 2.5;
    case "commercial":
      return 2;
    case "telecoms":
      return 1.5;
    case "agricultural":
      return 1;
    case "extension":
      return 0.5;
    case "other":
      return 1;
  }
}

function statusWeight(status: PlanningStatus): number {
  switch (status) {
    case "approved":
      return 1;
    case "validated":
      return 0.85;
    case "submitted":
      return 0.65;
    case "pending":
      return 0.55;
    case "refused":
      return 0.35;
    case "withdrawn":
      return 0.25;
    case "unknown":
      return 0.45;
  }
}

function distanceWeight(metres: number): number {
  if (metres <= 150) return 1;
  if (metres <= 300) return 0.85;
  if (metres <= 500) return 0.7;
  if (metres <= 700) return 0.55;
  if (metres <= 1000) return 0.4;
  return 0.25;
}

function isMajorDevelopment(app: PlanningApplication): boolean {
  if (app.category !== "housing" && app.category !== "commercial") return false;
  const title = app.title.toLowerCase();
  return (
    title.includes("development") ||
    /\d+-home/.test(title) ||
    title.includes("mixed-use")
  );
}

function applicationImpact(app: PlanningApplication): number {
  return (
    categoryWeight(app.category) *
    statusWeight(app.status) *
    distanceWeight(app.distanceMetres)
  );
}

function toActivityLevel(score: number): "Low" | "Medium" | "High" {
  if (score < 2.5) return "Low";
  if (score < 5.5) return "Medium";
  return "High";
}

function buildSummaryText(
  summary: Omit<PlanningActivitySummary, "summary">
): string {
  if (summary.totalApplications === 0) {
    return "No major planning activity found nearby.";
  }

  const parts: string[] = [];

  if (summary.majorDevelopments > 0) {
    parts.push(
      `${summary.majorDevelopments} major development${summary.majorDevelopments > 1 ? "s" : ""} nearby`
    );
  }

  if (summary.approvedNearby > 0) {
    parts.push(
      `${summary.approvedNearby} recent approval${summary.approvedNearby > 1 ? "s" : ""}`
    );
  }

  if (summary.activityScore === "Low") {
    parts.push("generally quiet planning environment");
  } else if (summary.activityScore === "Medium") {
    parts.push("moderate nearby development activity");
  } else {
    parts.push("active development in the surrounding area");
  }

  return parts.join(", ") + ".";
}

export function calculatePlanningActivitySummary(
  applications: PlanningApplication[]
): PlanningActivitySummary {
  if (applications.length === 0) {
    return {
      totalApplications: 0,
      approvedNearby: 0,
      housingDevelopments: 0,
      majorDevelopments: 0,
      activityScore: "Low",
      riskScore: 0,
      summary: "No major planning activity found nearby.",
    };
  }

  const approvedNearby = applications.filter(
    (app) => app.status === "approved"
  ).length;
  const housingDevelopments = applications.filter(
    (app) => app.category === "housing"
  ).length;
  const majorDevelopments = applications.filter(isMajorDevelopment).length;
  const closestApplicationMetres = Math.min(
    ...applications.map((app) => app.distanceMetres)
  );

  const weightedTotal = applications.reduce(
    (sum, app) => sum + applicationImpact(app),
    0
  );

  const activityScore = toActivityLevel(weightedTotal);

  const riskScore = Math.min(
    100,
    Math.round(
      weightedTotal * 10 +
        majorDevelopments * 12 +
        (activityScore === "High" ? 10 : activityScore === "Medium" ? 5 : 0)
    )
  );

  const base = {
    totalApplications: applications.length,
    approvedNearby,
    housingDevelopments,
    majorDevelopments,
    closestApplicationMetres,
    activityScore,
    riskScore,
  };

  return {
    ...base,
    summary: buildSummaryText(base),
  };
}

export function emptyPlanningSummary(): PlanningActivitySummary {
  return calculatePlanningActivitySummary([]);
}
