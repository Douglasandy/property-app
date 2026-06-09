export type DataStatus =
  | "live"
  | "imported"
  | "mock"
  | "estimated"
  | "unavailable";

export interface DataSourceMeta {
  status: DataStatus;
  label: string;
  sourceName?: string;
  sourceUrl?: string;
  lastUpdated?: string;
  confidence: number;
  note?: string;
}

export interface ReportDataSourceEntry {
  section: string;
  meta: DataSourceMeta;
}
