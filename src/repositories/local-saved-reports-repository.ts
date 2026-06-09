import type { SavedReportsRepository } from "@/repositories/saved-reports-repository.interface";
import type { SavedPropertyReport } from "@/types/saved-report";

const STORAGE_KEY = "property-insight-ni:saved-reports";

function readFromStorage(): SavedPropertyReport[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedPropertyReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(reports: SavedPropertyReport[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export class LocalSavedReportsRepository implements SavedReportsRepository {
  async getSavedReports(): Promise<SavedPropertyReport[]> {
    return readFromStorage().sort(
      (a, b) =>
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
  }

  async saveReport(report: SavedPropertyReport): Promise<void> {
    const existing = readFromStorage();
    const withoutDuplicate = existing.filter(
      (item) => item.propertyId !== report.propertyId
    );
    writeToStorage([report, ...withoutDuplicate]);
  }

  async removeReport(id: string): Promise<void> {
    const existing = readFromStorage();
    writeToStorage(existing.filter((item) => item.id !== id));
  }

  async isReportSaved(propertyId: string): Promise<boolean> {
    return readFromStorage().some((item) => item.propertyId === propertyId);
  }
}

export const localSavedReportsRepository = new LocalSavedReportsRepository();
