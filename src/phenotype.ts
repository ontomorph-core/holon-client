import { HolonHttpClient } from "./http.ts";
import type { HolonClientConfig } from "./types.ts";

/** Best match entry from phenotype similarity. */
export interface PhenotypeMatch {
  termA: number;
  termB: number;
  mica: number;
  micaIc: number;
  micaName: string;
}

/** Response from phenotype matching. */
export interface PhenotypeMatchResponse {
  score: number;
  maxScore: number;
  normalizedScore: number;
  bestMatches: PhenotypeMatch[];
}

/** HPO phenotype similarity operations. */
export class PhenotypeApi {
  private readonly http: HolonHttpClient;

  constructor(config: HolonClientConfig) {
    this.http = new HolonHttpClient(config);
  }

  /** Compute Resnik IC similarity between two HPO term sets. */
  async match(termsA: number[], termsB: number[]): Promise<PhenotypeMatchResponse> {
    return this.http.post(
      "/phenotype/match",
      { termsA: termsA.map(String), termsB: termsB.map(String) },
      "Phenotype match failed",
    );
  }
}
