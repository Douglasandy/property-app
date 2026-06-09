import type { ParsedPropertyListing } from "@/types/listing";
import type { PropertyReport } from "@/types/property";

export interface PropertyRepository {
  getReportById(id: string): Promise<PropertyReport | null>;
  getReportByUrl(url: string): Promise<PropertyReport | null>;
  listReports(): Promise<PropertyReport[]>;
  createReportFromListing(
    listing: ParsedPropertyListing,
    importMeta?: import("@/types/import-meta").ImportMeta
  ): Promise<PropertyReport>;
}

export interface SchoolsRepository {
  getNearbySchools(
    lat: number,
    lng: number,
    radiusMetres: number
  ): Promise<PropertyReport["schools"]>;
}

export interface EnvironmentalRepository {
  getRiskAssessment(
    lat: number,
    lng: number
  ): Promise<PropertyReport["environmentalRisk"]>;
}

export interface AreaRepository {
  getAreaOutlook(postcode: string): Promise<PropertyReport["areaOutlook"]>;
}
