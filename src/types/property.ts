import type { ParsedPropertyListing } from "@/types/listing";
import type { ImportMeta } from "@/types/import-meta";
import type { DataSourceMeta } from "@/types/data-source";
import type { PropertyVerdict } from "@/types/recommendation";
import type { ValueAnalysis } from "@/types/valuation";
import type {
  PlanningApplication,
  PlanningActivitySummary,
} from "@/types/planning";

export type RiskLevel = "low" | "medium" | "high" | "good" | "average" | "poor";
export type SchoolType = "primary" | "secondary" | "grammar" | "special";

export interface PropertySummary {
  id: string;
  address: string;
  city: string;
  postcode: string;
  askingPrice: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  imageUrl: string;
  score: number;
  tags: PropertyTag[];
  dataSourceMeta: DataSourceMeta;
}

export interface PropertyTag {
  label: string;
  variant: "success" | "info" | "purple" | "warning";
}

export interface ValueAnalysisSection {
  analysis: ValueAnalysis;
  dataSourceMeta: DataSourceMeta;
  limitedLocalData?: boolean;
}

export interface PriceTrendPoint {
  year: string;
  area: number;
  niAverage: number;
}

export interface PriceTrend {
  data: PriceTrendPoint[];
  areaGrowthPercent: number;
  niAverageGrowthPercent: number;
  dataSourceMeta: DataSourceMeta;
}

export type PlanningLoadStatus = "success" | "empty" | "error";

export interface PlanningActivity {
  applications: PlanningApplication[];
  summary: PlanningActivitySummary;
  searchRadiusMetres: number;
  loadStatus: PlanningLoadStatus;
  errorMessage?: string;
  dataSourceMeta: DataSourceMeta;
}

export interface School {
  id: string;
  name: string;
  distanceMetres: number;
  type: SchoolType;
  capacityPercent: number;
  performanceRating: "good" | "average" | "poor";
}

export interface SchoolsSection {
  items: School[];
  dataSourceMeta: DataSourceMeta;
}

export interface EnvironmentalRisk {
  floodRisk: RiskLevel;
  airQuality: RiskLevel;
  radonRisk: RiskLevel;
  dataSourceMeta: DataSourceMeta;
}

export interface AreaOutlook {
  populationGrowth: string;
  housingDemand: string;
  developmentActivity: string;
  investmentPotential: string;
  dataSourceMeta: DataSourceMeta;
}

export interface RecommendationSection {
  verdict: PropertyVerdict;
  dataSourceMeta: DataSourceMeta;
}

export interface PropertyReport {
  property: PropertySummary;
  valueAnalysis: ValueAnalysisSection;
  priceTrend: PriceTrend;
  planningActivity: PlanningActivity;
  schools: SchoolsSection;
  environmentalRisk: EnvironmentalRisk;
  areaOutlook: AreaOutlook;
  recommendation: RecommendationSection;
  listingImport?: ParsedPropertyListing;
  importMeta?: ImportMeta;
}
