import type {
  PlanningRepository,
  PlanningSearchInput,
} from "@/repositories/planning-repository.interface";
import type { PlanningApplication } from "@/types/planning";

/**
 * Live Northern Ireland planning data connector (not yet implemented).
 *
 * Likely future sources:
 * - Planning Portal NI (planningni.gov.uk) application search
 * - Council-specific planning application portals (Belfast, Derry & Strabane, etc.)
 * - Open Data NI published planning datasets where available
 * - A cached Firestore/Postgres planning index built from periodic ingestion jobs
 *
 * Integration approach:
 * 1. Geocode postcode → lat/lng via LPS or NISRA postcode lookup
 * 2. Query planning index within radiusMetres
 * 3. Normalise council responses into PlanningApplication[]
 * 4. Return with confidence scores based on data freshness and match quality
 *
 * Do not scrape council websites directly without legal/compliance review.
 */
export class NIPlanningRepository implements PlanningRepository {
  async searchNearby(_input: PlanningSearchInput): Promise<PlanningApplication[]> {
    throw new Error(
      "NIPlanningRepository is not implemented. Use mockPlanningRepository for prototype reports."
    );
  }
}

export const niPlanningRepository = new NIPlanningRepository();
