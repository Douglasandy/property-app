import type { ParsedPropertyListing } from "@/types/listing";

export interface PropertyListingParser {
  canParse(url: string): boolean;
  parse(url: string): Promise<ParsedPropertyListing>;
}
