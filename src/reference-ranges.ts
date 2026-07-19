import { HolonHttpClient } from "./http.ts";
import type { HolonClientConfig } from "./types.ts";

/** Reference range entry from the HOLON API. */
export interface ReferenceRangeEntry {
  id: number;
  conceptId: number;
  conceptCode: string;
  conceptName: string;
  ageMinYears: string | null;
  ageMaxYears: string | null;
  sex: string | null;
  lowValue: string | null;
  highValue: string | null;
  unit: string;
  interpretation: string | null;
  source: string;
}

/** Response from reference range lookup. */
export interface ReferenceRangesResponse {
  total: number;
  ranges: ReferenceRangeEntry[];
}

/** Lab reference range operations. */
export class ReferenceRangesApi {
  private readonly http: HolonHttpClient;

  constructor(config: HolonClientConfig) {
    this.http = new HolonHttpClient(config);
  }

  /** Get reference ranges by concept ID, optionally filtered by age and sex. */
  async getByConceptId(
    conceptId: number,
    age?: number,
    sex?: string,
  ): Promise<ReferenceRangesResponse> {
    const params = new URLSearchParams();
    if (age !== undefined) params.set("age", String(age));
    if (sex) params.set("sex", sex);
    const qs = params.toString() ? `?${params}` : "";
    return this.http.get(`/reference-ranges/${conceptId}${qs}`, "Reference range lookup failed");
  }

  /** Get reference ranges by LOINC code, optionally filtered by age and sex. */
  async getByLoincCode(
    loincCode: string,
    age?: number,
    sex?: string,
  ): Promise<ReferenceRangesResponse> {
    const params = new URLSearchParams();
    if (age !== undefined) params.set("age", String(age));
    if (sex) params.set("sex", sex);
    const qs = params.toString() ? `?${params}` : "";
    return this.http.get(
      `/reference-ranges/loinc/${loincCode}${qs}`,
      "Reference range lookup failed",
    );
  }
}
