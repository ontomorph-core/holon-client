import { ConceptsApi } from "./concepts.ts";
import { InteractionsApi } from "./interactions.ts";
import { MappingsApi } from "./mappings.ts";
import { PhenotypeApi } from "./phenotype.ts";
import { ReferenceRangesApi } from "./reference-ranges.ts";
import type { HolonClientConfig } from "./types.ts";

/** HOLON API client. */
export interface HolonClient {
  concepts: ConceptsApi;
  interactions: InteractionsApi;
  mappings: MappingsApi;
  referenceRanges: ReferenceRangesApi;
  phenotype: PhenotypeApi;
}

/** Create a HOLON API client instance. */
export function createHolonClient(config: HolonClientConfig): HolonClient {
  return {
    concepts: new ConceptsApi(config),
    interactions: new InteractionsApi(config),
    mappings: new MappingsApi(config),
    referenceRanges: new ReferenceRangesApi(config),
    phenotype: new PhenotypeApi(config),
  };
}
