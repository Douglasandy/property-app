import type { SavedPropertyReport } from "@/types/saved-report";

export interface SavedReportsRepository {
  getSavedReports(): Promise<SavedPropertyReport[]>;
  saveReport(report: SavedPropertyReport): Promise<void>;
  removeReport(id: string): Promise<void>;
  isReportSaved(propertyId: string): Promise<boolean>;
}
