import type { PlanningApplication } from "@/types/planning";

export interface PlanningSearchInput {
  postcode: string;
  latitude?: number;
  longitude?: number;
  radiusMetres: number;
}

export interface PlanningRepository {
  searchNearby(input: PlanningSearchInput): Promise<PlanningApplication[]>;
}
