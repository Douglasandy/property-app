export type PlanningStatus =
  | "submitted"
  | "validated"
  | "approved"
  | "refused"
  | "withdrawn"
  | "pending"
  | "unknown";

export type PlanningCategory =
  | "housing"
  | "extension"
  | "commercial"
  | "telecoms"
  | "infrastructure"
  | "agricultural"
  | "other";

export interface PlanningApplication {
  id: string;
  reference: string;
  title: string;
  description: string;
  status: PlanningStatus;
  category: PlanningCategory;
  address: string;
  council: string;
  submittedDate?: string;
  decisionDate?: string;
  distanceMetres: number;
  latitude?: number;
  longitude?: number;
  sourceName: string;
  sourceUrl?: string;
  confidence: number;
}

export interface PlanningActivitySummary {
  totalApplications: number;
  approvedNearby: number;
  housingDevelopments: number;
  majorDevelopments: number;
  closestApplicationMetres?: number;
  activityScore: "Low" | "Medium" | "High";
  riskScore: number;
  summary: string;
}
