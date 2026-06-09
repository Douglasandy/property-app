import type { PropertyType } from "@/types/valuation";

export interface HpiRecord {
  quarterYear: string;
  saleYear: number;
  saleQuarter: string;
  detachedMedian: number;
  detachedStandardised: number;
  semiDetachedMedian: number;
  semiDetachedStandardised: number;
  terraceMedian: number;
  terraceStandardised: number;
  apartmentMedian: number;
  apartmentStandardised: number;
  allPropertiesMedian: number;
  allPropertiesStandardised: number;
}

const DEFAULT_RESOURCE_ID = "0e5bf045-654b-4866-b9c6-2674ec4a8a32";
const DEFAULT_DATASTORE_URL =
  "https://admin.opendatani.gov.uk/api/3/action/datastore_search";

let cachedRecords: HpiRecord[] | null = null;
let cacheLoadedAt: number | null = null;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

function mapPropertyTypeToHpiFields(propertyType: PropertyType): {
  medianKey: keyof HpiRecord;
  standardisedKey: keyof HpiRecord;
  label: string;
} {
  switch (propertyType) {
    case "detached":
    case "bungalow":
      return {
        medianKey: "detachedMedian",
        standardisedKey: "detachedStandardised",
        label: "Detached",
      };
    case "semi-detached":
      return {
        medianKey: "semiDetachedMedian",
        standardisedKey: "semiDetachedStandardised",
        label: "Semi-detached",
      };
    case "terrace":
      return {
        medianKey: "terraceMedian",
        standardisedKey: "terraceStandardised",
        label: "Terrace",
      };
    case "apartment":
      return {
        medianKey: "apartmentMedian",
        standardisedKey: "apartmentStandardised",
        label: "Apartment",
      };
    default:
      return {
        medianKey: "allPropertiesMedian",
        standardisedKey: "allPropertiesStandardised",
        label: "All properties",
      };
  }
}

function parseRecord(row: Record<string, unknown>): HpiRecord {
  return {
    quarterYear: String(row.Quarter_Year ?? ""),
    saleYear: Number(row.Sale_year ?? 0),
    saleQuarter: String(row.Sale_qtr ?? ""),
    detachedMedian: Number(row.Detached_Median_Price ?? 0),
    detachedStandardised: Number(row.Detached_Standardised_Price ?? 0),
    semiDetachedMedian: Number(row.Semi_Detached_Median_Price ?? 0),
    semiDetachedStandardised: Number(row.Semi_Detached_Standardised_Price ?? 0),
    terraceMedian: Number(row.Terrace_Median_Price ?? 0),
    terraceStandardised: Number(row.Terrace_Standardised_Price ?? 0),
    apartmentMedian: Number(row.Apartment_Median_Price ?? 0),
    apartmentStandardised: Number(row.Apartment_Standardised_Price ?? 0),
    allPropertiesMedian: Number(row.All_Properties_Median_Price ?? 0),
    allPropertiesStandardised: Number(row.All_Properties_Standardised_Price ?? 0),
  };
}

async function fetchFromDatastore(): Promise<HpiRecord[]> {
  const resourceId =
    process.env.NI_HPI_RESOURCE_ID ?? DEFAULT_RESOURCE_ID;
  const baseUrl = process.env.NI_HPI_DATASTORE_URL ?? DEFAULT_DATASTORE_URL;

  const url = new URL(baseUrl);
  url.searchParams.set("resource_id", resourceId);
  url.searchParams.set("limit", "1000");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "PropertyInsightNI/1.0 (public data import)",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`NI HPI datastore request failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    success: boolean;
    result?: { records?: Record<string, unknown>[] };
  };

  if (!payload.success || !payload.result?.records?.length) {
    throw new Error("NI HPI datastore returned no records");
  }

  return payload.result.records.map(parseRecord);
}

async function fetchFromCsvUrl(): Promise<HpiRecord[]> {
  const csvUrl = process.env.NI_HPI_CSV_URL;
  if (!csvUrl) throw new Error("NI HPI CSV URL not configured");

  const response = await fetch(csvUrl, {
    headers: { Accept: "text/csv" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`NI HPI CSV request failed (${response.status})`);
  }

  const text = await response.text();
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0]?.split(",") ?? [];

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim();
    });
    return parseRecord(row);
  });
}

export async function loadHpiRecords(forceRefresh = false): Promise<HpiRecord[]> {
  const now = Date.now();
  if (
    !forceRefresh &&
    cachedRecords &&
    cacheLoadedAt &&
    now - cacheLoadedAt < CACHE_TTL_MS
  ) {
    return cachedRecords;
  }

  let records: HpiRecord[];

  try {
    records = await fetchFromDatastore();
  } catch {
    records = await fetchFromCsvUrl();
  }

  cachedRecords = records.sort((a, b) => {
    if (a.saleYear !== b.saleYear) return b.saleYear - a.saleYear;
    return b.saleQuarter.localeCompare(a.saleQuarter);
  });
  cacheLoadedAt = now;
  return cachedRecords;
}

export function getLatestHpiForPropertyType(
  records: HpiRecord[],
  propertyType: PropertyType
): {
  record: HpiRecord;
  medianPrice: number;
  averagePrice: number;
  label: string;
} | null {
  if (records.length === 0) return null;

  const mapping = mapPropertyTypeToHpiFields(propertyType);
  const latest = records[0];
  const medianPrice = Number(latest[mapping.medianKey]);
  const averagePrice = Number(latest[mapping.standardisedKey]);

  if (!medianPrice || !averagePrice) return null;

  return {
    record: latest,
    medianPrice: Math.round(medianPrice),
    averagePrice: Math.round(averagePrice),
    label: mapping.label,
  };
}

export function resetHpiCache(): void {
  cachedRecords = null;
  cacheLoadedAt = null;
}
