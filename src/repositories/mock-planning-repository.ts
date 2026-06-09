import type {
  PlanningRepository,
  PlanningSearchInput,
} from "@/repositories/planning-repository.interface";
import type { PlanningApplication } from "@/types/planning";

const BELFAST_SAMPLE_APPLICATIONS: PlanningApplication[] = [
  {
    id: "plan-bfs-001",
    reference: "LA04/2025/0123/F",
    title: "80-home residential development",
    description:
      "Erection of 80 no. dwellings with associated access, landscaping and infrastructure.",
    status: "approved",
    category: "housing",
    address: "Ormeau Road, Belfast",
    council: "Belfast City Council",
    submittedDate: "2024-09-14",
    decisionDate: "2025-03-18",
    distanceMetres: 450,
    latitude: 54.572,
    longitude: -5.918,
    sourceName: "Planning Portal NI (prototype)",
    sourceUrl: "https://www.planningni.gov.uk/",
    confidence: 40,
  },
  {
    id: "plan-bfs-002",
    reference: "LA04/2025/0089/F",
    title: "Telecom mast installation",
    description:
      "Installation of 18m telecommunications mast with equipment cabinet.",
    status: "submitted",
    category: "telecoms",
    address: "Malone Road, Belfast",
    council: "Belfast City Council",
    submittedDate: "2025-01-22",
    distanceMetres: 700,
    latitude: 54.568,
    longitude: -5.921,
    sourceName: "Planning Portal NI (prototype)",
    sourceUrl: "https://www.planningni.gov.uk/",
    confidence: 40,
  },
  {
    id: "plan-bfs-003",
    reference: "LA04/2025/0045/F",
    title: "2 dwellings",
    description:
      "Demolition of existing garage and erection of 2 no. semi-detached dwellings.",
    status: "validated",
    category: "housing",
    address: "Stranmillis Road, Belfast",
    council: "Belfast City Council",
    submittedDate: "2025-02-03",
    distanceMetres: 320,
    latitude: 54.571,
    longitude: -5.916,
    sourceName: "Planning Portal NI (prototype)",
    confidence: 40,
  },
  {
    id: "plan-bfs-004",
    reference: "LA04/2024/1198/F",
    title: "Rear extension",
    description:
      "Single-storey rear extension and associated internal alterations.",
    status: "approved",
    category: "extension",
    address: "Example Road, Belfast",
    council: "Belfast City Council",
    submittedDate: "2024-06-10",
    decisionDate: "2024-10-05",
    distanceMetres: 120,
    latitude: 54.573,
    longitude: -5.919,
    sourceName: "Planning Portal NI (prototype)",
    confidence: 40,
  },
];

export class MockPlanningRepository implements PlanningRepository {
  async searchNearby(input: PlanningSearchInput): Promise<PlanningApplication[]> {
    await delay(150);

    return BELFAST_SAMPLE_APPLICATIONS.filter(
      (app) => app.distanceMetres <= input.radiusMetres
    ).sort((a, b) => a.distanceMetres - b.distanceMetres);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockPlanningRepository = new MockPlanningRepository();
