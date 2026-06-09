import type { PropertyReport } from "@/types/property";
import { defaultDataSources } from "@/data/report-data-sources";

export const mockPropertyReportBase: Omit<
  PropertyReport,
  "planningActivity" | "valueAnalysis" | "recommendation"
> = {
  property: {
    id: "123-example-road",
    address: "123 Example Road",
    city: "Belfast",
    postcode: "BT7 1AA",
    askingPrice: 235000,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: "Semi Detached",
    imageUrl:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
    score: 78,
    tags: [
      { label: "Good Value", variant: "success" },
      { label: "Low Flood Risk", variant: "info" },
      { label: "High Demand", variant: "purple" },
    ],
    dataSourceMeta: {
      ...defaultDataSources.property,
      sourceUrl:
        "https://www.propertypal.com/123-example-road-belfast/987654",
      lastUpdated: "2026-06-09T12:00:00.000Z",
    },
  },
  priceTrend: {
    data: [
      { year: "2020", area: 165000, niAverage: 158000 },
      { year: "2021", area: 172000, niAverage: 163000 },
      { year: "2022", area: 185000, niAverage: 172000 },
      { year: "2023", area: 198000, niAverage: 181000 },
      { year: "2024", area: 210000, niAverage: 189000 },
      { year: "2025", area: 218000, niAverage: 195000 },
    ],
    areaGrowthPercent: 18.6,
    niAverageGrowthPercent: 12.2,
    dataSourceMeta: defaultDataSources.priceTrend,
  },
  schools: {
    items: [
    {
      id: "school-1",
      name: "Stranmillis Primary",
      distanceMetres: 420,
      type: "primary",
      capacityPercent: 87,
      performanceRating: "good",
    },
    {
      id: "school-2",
      name: "Methodist College Belfast",
      distanceMetres: 890,
      type: "secondary",
      capacityPercent: 92,
      performanceRating: "good",
    },
    {
      id: "school-3",
      name: "Botanic Primary School",
      distanceMetres: 650,
      type: "primary",
      capacityPercent: 78,
      performanceRating: "average",
    },
    ],
    dataSourceMeta: defaultDataSources.schools,
  },
  environmentalRisk: {
    floodRisk: "low",
    airQuality: "good",
    radonRisk: "low",
    dataSourceMeta: defaultDataSources.environmentalRisk,
  },
  areaOutlook: {
    populationGrowth: "+2.4% (5yr forecast)",
    housingDemand: "High — rising buyer interest",
    developmentActivity: "Moderate — 12 active applications",
    investmentPotential: "Strong — above NI average growth",
    dataSourceMeta: defaultDataSources.areaOutlook,
  },
  listingImport: {
    sourceUrl:
      "https://www.propertypal.com/123-example-road-belfast/987654",
    sourceName: "PropertyPal",
    listingId: "987654",
    title: "3 bed semi-detached house for sale",
    address: "123 Example Road",
    postcode: "BT7 1AA",
    askingPrice: 235000,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: "Semi Detached",
    imageUrl:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
    agentName: "Example Estate Agents NI",
    importedAt: "2026-06-09T12:00:00.000Z",
    confidenceScore: 87,
  },
};
