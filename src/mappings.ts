import { HolonHttpClient } from "./http.ts";
import type { HolonClientConfig } from "./types.ts";

/** Mapping entry from the HOLON API. */
export interface MappingEntry {
  id: number;
  sourceConceptId: number;
  targetConceptId: number;
  relationshipType: string;
  equivalence: string;
  targetHolonUri: string;
  targetConceptCode: string;
  targetConceptName: string;
  targetVocabularyId: string;
}

/** Response from mapping lookup. */
export interface MappingsResponse {
  conceptId: number;
  total: number;
  mappings: MappingEntry[];
}

/** Response from concept translation. */
export interface TranslationResponse {
  source: { code: string; vocabulary: string };
  target: string;
  total: number;
  mappings: MappingEntry[];
}

/** Cross-vocabulary mapping operations. */
export class MappingsApi {
  private readonly http: HolonHttpClient;

  constructor(config: HolonClientConfig) {
    this.http = new HolonHttpClient(config);
  }

  /** Get all mappings for a concept. */
  async getByConceptId(conceptId: number): Promise<MappingsResponse> {
    return this.http.get(`/mappings/${conceptId}`, "Mapping lookup failed");
  }

  /** Translate a concept code between vocabularies. */
  async translate(code: string, source: string, target?: string): Promise<TranslationResponse> {
    const params = new URLSearchParams({ code, source });
    if (target) params.set("target", target);
    return this.http.get(`/mappings/translate?${params}`, "Translation failed");
  }
}
