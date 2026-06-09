import type { DataSourceMeta } from "@/types/data-source";

export const defaultDataSources: Record<
  | "property"
  | "valueAnalysis"
  | "priceTrend"
  | "planningActivity"
  | "schools"
  | "environmentalRisk"
  | "areaOutlook"
  | "recommendation",
  DataSourceMeta
> = {
  property: {
    status: "imported",
    label: "Imported from PropertyPal",
    sourceName: "PropertyPal",
    confidence: 91,
    note: "Listing details parsed from pasted URL",
  },
  valueAnalysis: {
    status: "estimated",
    label: "Estimated from area trends",
    sourceName: "LPS / NI House Price Index (pending)",
    confidence: 64,
    note: "Valuation model uses prototype area comparables",
  },
  priceTrend: {
    status: "estimated",
    label: "Estimated from area trends",
    sourceName: "NISRA / LPS (pending)",
    confidence: 58,
    note: "Trend lines use prototype area data",
  },
  planningActivity: {
    status: "mock",
    label: "Prototype estimate",
    sourceName: "Planning Portal NI (pending)",
    confidence: 40,
    note: "Sample applications for demonstration",
  },
  schools: {
    status: "mock",
    label: "Prototype estimate",
    sourceName: "Department of Education NI (pending)",
    confidence: 40,
    note: "School capacity and ratings are illustrative",
  },
  environmentalRisk: {
    status: "unavailable",
    label: "Source pending",
    sourceName: "Open Data NI / flood maps (pending)",
    confidence: 0,
    note: "Flood, air quality and radon data not yet connected",
  },
  areaOutlook: {
    status: "estimated",
    label: "Estimated from area trends",
    sourceName: "NISRA (pending)",
    confidence: 55,
    note: "Population and demand indicators are modelled",
  },
  recommendation: {
    status: "estimated",
    label: "Calculated summary",
    sourceName: "Property Insight NI",
    confidence: 72,
    note: "Composite score derived from available section data",
  },
};

export function importedPropertySource(
  sourceUrl?: string,
  confidence = 91
): DataSourceMeta {
  return {
    ...defaultDataSources.property,
    sourceUrl,
    confidence,
    lastUpdated: new Date().toISOString(),
  };
}

export function manualPropertySource(confidence = 75): DataSourceMeta {
  return {
    status: "imported",
    label: "Manual entry",
    sourceName: "User provided",
    confidence,
    note: "Listing details were entered manually after automatic import failed.",
    lastUpdated: new Date().toISOString(),
  };
}
