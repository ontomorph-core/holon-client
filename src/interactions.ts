import { HolonHttpClient } from "./http.ts";
import type { HolonClientConfig } from "./types.ts";

/** Drug interaction entry from the HOLON API. */
export interface InteractionEntry {
  id: number;
  drugAConceptId: number;
  drugBConceptId: number;
  drugAName: string;
  drugBName: string;
  severity: string;
  mechanism: string | null;
  clinicalEffect: string;
  management: string;
  evidenceGrade: string;
  source: string;
}

/** Response from drug interaction lookup. */
export interface InteractionsResponse {
  conceptId: number;
  total: number;
  interactions: InteractionEntry[];
}

/** Response from pairwise interaction check. */
export interface InteractionCheckResponse {
  drugA: number;
  drugB: number;
  hasInteraction: boolean;
  interactions: InteractionEntry[];
}

/** Response from medication list check. */
export interface InteractionListResponse {
  totalDrugs: number;
  totalInteractions: number;
  pairs: Array<{ drugA: number; drugB: number; interactions: InteractionEntry[] }>;
}

/** Drug interaction operations. */
export class InteractionsApi {
  private readonly http: HolonHttpClient;

  constructor(config: HolonClientConfig) {
    this.http = new HolonHttpClient(config);
  }

  /** Get all interactions for a drug concept. */
  async getByDrugId(conceptId: number): Promise<InteractionsResponse> {
    return this.http.get(`/interactions/drug/${conceptId}`, "Interaction lookup failed");
  }

  /** Check interaction between two drugs. */
  async check(drugA: number, drugB: number): Promise<InteractionCheckResponse> {
    const params = new URLSearchParams({ drugA: String(drugA), drugB: String(drugB) });
    return this.http.get(`/interactions/check?${params}`, "Interaction check failed");
  }

  /** Check all pairwise interactions for a medication list. */
  async checkList(drugIds: number[]): Promise<InteractionListResponse> {
    return this.http.post(
      "/interactions/check-list",
      { drugIds: drugIds.map(String) },
      "Interaction list check failed",
    );
  }
}
