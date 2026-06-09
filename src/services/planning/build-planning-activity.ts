import { defaultDataSources } from "@/data/report-data-sources";
import { emptyPlanningSummary, calculatePlanningActivitySummary } from "@/lib/intelligence/planning-score";
import { mockPlanningRepository } from "@/repositories/mock-planning-repository";
import type { PlanningRepository, PlanningSearchInput } from "@/repositories/planning-repository.interface";
import type { PlanningActivitySummary } from "@/types/planning";
import type { DataSourceMeta } from "@/types/data-source";
import type { PlanningActivity } from "@/types/property";

const DEFAULT_RADIUS_METRES = 1000;

export interface BuildPlanningActivityOptions {
  repository?: PlanningRepository;
  dataSourceMeta?: DataSourceMeta;
}

export async function buildPlanningActivity(
  input: Omit<PlanningSearchInput, "radiusMetres"> & {
    radiusMetres?: number;
  },
  options: BuildPlanningActivityOptions = {}
): Promise<PlanningActivity> {
  const repository = options.repository ?? mockPlanningRepository;
  const radiusMetres = input.radiusMetres ?? DEFAULT_RADIUS_METRES;
  const dataSourceMeta =
    options.dataSourceMeta ?? defaultDataSources.planningActivity;

  const searchInput: PlanningSearchInput = {
    ...input,
    radiusMetres,
  };

  try {
    const applications = await repository.searchNearby(searchInput);

    if (applications.length === 0) {
      return {
        applications: [],
        summary: emptyPlanningSummary(),
        searchRadiusMetres: radiusMetres,
        loadStatus: "empty",
        dataSourceMeta,
      };
    }

    const summary = calculatePlanningActivitySummary(applications);

    return {
      applications,
      summary,
      searchRadiusMetres: radiusMetres,
      loadStatus: "success",
      dataSourceMeta,
    };
  } catch {
    return {
      applications: [],
      summary: emptyPlanningSummary(),
      searchRadiusMetres: radiusMetres,
      loadStatus: "error",
      errorMessage: "Planning data could not be checked right now.",
      dataSourceMeta,
    };
  }
}

export function formatPlanningRadius(metres: number): string {
  if (metres >= 1000) {
    return `${metres / 1000}km`;
  }
  return `${metres}m`;
}

export function formatPlanningDate(isoDate?: string): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export type { PlanningActivitySummary };
