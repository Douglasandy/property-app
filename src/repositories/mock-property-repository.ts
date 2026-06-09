import { mockPropertyReportBase } from "@/data/mock-property-report";
import {
  importedPropertySource,
  manualPropertySource,
} from "@/data/report-data-sources";
import { buildPlanningActivity } from "@/services/planning/build-planning-activity";
import { buildRecommendationSection } from "@/services/recommendation/build-property-verdict";
import {
  buildValueAnalysisSection,
  getValuationSourceFromSection,
} from "@/services/valuation/build-value-analysis";
import {
  buildImportMetaFromListing,
  sanitizeReportId,
} from "@/lib/import-meta";
import type { PropertyRepository } from "@/repositories/interfaces";
import type { ImportMeta } from "@/types/import-meta";
import type { ParsedPropertyListing } from "@/types/listing";
import type { PropertyReport } from "@/types/property";

const EXAMPLE_REPORT_ID = mockPropertyReportBase.property.id;

type ReportBase = Omit<
  PropertyReport,
  "planningActivity" | "valueAnalysis" | "recommendation"
>;

const reports: Record<string, ReportBase> = {
  [EXAMPLE_REPORT_ID]: { ...mockPropertyReportBase },
};

async function hydrateReport(base: ReportBase): Promise<PropertyReport> {
  const [planningActivity, valueAnalysis] = await Promise.all([
    buildPlanningActivity({ postcode: base.property.postcode }),
    buildValueAnalysisSection({
      postcode: base.property.postcode,
      propertyType: base.property.propertyType,
      bedrooms: base.property.bedrooms,
      askingPrice: base.property.askingPrice,
    }),
  ]);

  const valuationSource = getValuationSourceFromSection(valueAnalysis);
  const importMeta = base.importMeta
    ? {
        ...base.importMeta,
        valuationSource,
        dataSourcesUsed: Array.from(
          new Set([
            ...base.importMeta.dataSourcesUsed.filter(
              (source) =>
                !source.includes("NI House Price Index") &&
                !source.includes("Mock NI market data")
            ),
            valuationSource === "ni-hpi-live"
              ? "NI House Price Index"
              : "Mock NI market data",
          ])
        ),
      }
    : undefined;

  const recommendation = buildRecommendationSection({
    valueAnalysis,
    planningActivity,
    environmentalRisk: base.environmentalRisk,
    schools: base.schools,
    areaOutlook: base.areaOutlook,
  });

  return {
    ...base,
    importMeta,
    property: {
      ...base.property,
      score: recommendation.verdict.overallScore,
    },
    planningActivity,
    valueAnalysis,
    recommendation,
  };
}

function buildReportFromListing(
  listing: ParsedPropertyListing,
  importMeta?: ImportMeta
): ReportBase {
  const reportId = sanitizeReportId(listing.listingId);
  const propertyMeta =
    listing.importMethod === "manual"
      ? manualPropertySource(listing.confidenceScore)
      : importedPropertySource(listing.sourceUrl, listing.confidenceScore);

  return {
    ...mockPropertyReportBase,
    property: {
      ...mockPropertyReportBase.property,
      id: reportId,
      address: listing.address,
      city: listing.postcode.startsWith("BT") ? "Belfast" : "Northern Ireland",
      postcode: listing.postcode,
      askingPrice: listing.askingPrice,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      propertyType: listing.propertyType,
      imageUrl: listing.imageUrl,
      dataSourceMeta: propertyMeta,
    },
    listingImport: listing,
    importMeta: importMeta ?? buildImportMetaFromListing(listing),
  };
}

export class MockPropertyRepository implements PropertyRepository {
  async getReportById(id: string): Promise<PropertyReport | null> {
    const base = reports[id];
    if (!base) return null;
    return hydrateReport(base);
  }

  async getReportByUrl(url: string): Promise<PropertyReport | null> {
    if (!url.includes("propertypal")) return null;
    return this.getReportById(EXAMPLE_REPORT_ID);
  }

  async listReports(): Promise<PropertyReport[]> {
    return Promise.all(Object.values(reports).map((report) => hydrateReport(report)));
  }

  async createReportFromListing(
    listing: ParsedPropertyListing,
    importMeta?: ImportMeta
  ): Promise<PropertyReport> {
    const base = buildReportFromListing(listing, importMeta);
    reports[base.property.id] = base;
    return hydrateReport(base);
  }
}

export const propertyRepository = new MockPropertyRepository();
