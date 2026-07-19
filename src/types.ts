/** Configuration for the HOLON client. */
export interface HolonClientConfig {
  apiUrl: string;
  apiKey: string;
  timeout?: number;
}

/** Concept response from the HOLON API. */
export interface ConceptResponse {
  concept: {
    conceptId: number;
    holonUri: string;
    vocabularyId: string;
    conceptCode: string;
    conceptName: string;
    domainId: string;
  };
  synonyms: string[];
}

/** Search result from the HOLON API. */
export interface SearchResponse {
  hits: Array<{
    conceptId: number;
    holonUri: string;
    conceptCode: string;
    conceptName: string;
    vocabularyId: string;
    domainId: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
}

/** Standard error response from the HOLON API. */
export interface HolonApiError {
  error: string;
  code: string;
}

/** Ancestor entry from the HOLON API. */
export interface AncestorEntry {
  ancestorConceptId: number;
  minLevels: number;
  maxLevels: number;
  conceptName: string;
  conceptCode: string;
}

/** Ancestry response from the HOLON API. */
export interface AncestryResponse {
  conceptId: number;
  ancestors: AncestorEntry[];
}

/** Descendant entry from the HOLON API. */
export interface DescendantEntry {
  descendantConceptId: number;
  minLevels: number;
  maxLevels: number;
  conceptName: string;
  conceptCode: string;
}

/** Descendants response from the HOLON API. */
export interface DescendantsResponse {
  conceptId: number;
  descendants: DescendantEntry[];
}
