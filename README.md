# @holon/client

The official TypeScript client for the **HOLON clinical-knowledge API** — a
normalized, cross-vocabulary layer over SNOMED CT, RxNorm, LOINC, ICD-10 and
more. One typed client for:

- **Concepts** — search, look up by code, and walk the concept hierarchy (ancestors / descendants).
- **Drug interactions** — pairwise checks and whole-medication-list screening.
- **Cross-vocabulary mappings** — translate a code from one vocabulary to another.
- **Reference ranges** — age/sex-adjusted normal ranges for lab tests (by concept or LOINC code).
- **Phenotype similarity** — score the overlap between two sets of phenotype terms.

Works in Node.js 18+, Bun, Deno, and any runtime with a global `fetch`. Fully
typed; its only dependency is [`@holon/types`](https://www.npmjs.com/package/@holon/types).

```bash
npm install @holon/client
# pnpm add @holon/client
# yarn add @holon/client
# bun add @holon/client
```

## Quick start

```ts
import { createHolonClient } from "@holon/client";

const holon = createHolonClient({
  apiUrl: "https://holon.ontomorph.com",
  apiKey: process.env.HOLON_API_KEY, // holon_…
});

// Search for a drug concept.
const results = await holon.concepts.search("atorvastatin");
const atorvastatin = results.hits[0];

// Screen two drugs for an interaction.
const check = await holon.interactions.check(atorvastatin.conceptId, warfarinConceptId);
if (check.hasInteraction) {
  console.warn(check.interactions.length, "interaction(s) found");
}
```

## Authentication

Every request is authenticated with a bearer API key, sent as
`Authorization: Bearer <apiKey>`. Pass it once when you create the client:

```ts
const holon = createHolonClient({ apiUrl, apiKey, timeout: 30_000 });
```

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| `apiUrl` | `string` | yes | HOLON API base URL, e.g. `https://holon.ontomorph.com` |
| `apiKey` | `string` | yes | Your `holon_…` key, sent as a bearer token |
| `timeout` | `number` | no | Per-request timeout in ms (via `AbortSignal.timeout`) |

Request a key through the [developer dashboard](https://developer.ontomorph.com/dashboard/keys).

## API

`createHolonClient()` returns a `HolonClient` with five namespaces.

### `holon.concepts`

```ts
await holon.concepts.getById("40213251");                 // ConceptResponse
await holon.concepts.getByCode("197361", "RxNorm");       // by code + vocabulary
await holon.concepts.search("metformin", { domain: "Drug", page: 1, pageSize: 20 });
await holon.concepts.getAncestors(40213251);              // hierarchy up
await holon.concepts.getDescendants(40213251);            // hierarchy down
```

`search` returns `{ hits, total, page, pageSize }`; each hit carries
`conceptId`, `conceptCode`, `conceptName`, `vocabularyId`, and `domainId`.

### `holon.interactions`

```ts
await holon.interactions.getByDrugId(11289);              // all interactions for a drug
await holon.interactions.check(11289, 1191);              // pairwise → { hasInteraction, interactions }
await holon.interactions.checkList([11289, 1191, 197361]); // whole-list screen
```

### `holon.mappings`

```ts
await holon.mappings.getByConceptId(40213251);            // all cross-vocab mappings
await holon.mappings.translate("197361", "RxNorm", "SNOMED"); // → { source, target, mappings }
```

`translate`'s third argument (target vocabulary) is optional — omit it to get
mappings into every available vocabulary.

### `holon.referenceRanges`

```ts
await holon.referenceRanges.getByConceptId(3004249);      // by HOLON concept id
await holon.referenceRanges.getByLoincCode("2093-3", 45, "male"); // by LOINC, age/sex-adjusted
```

`age` and `sex` are optional; supply them to get the range narrowed to that
demographic.

### `holon.phenotype`

```ts
// Score similarity between two sets of phenotype concept ids.
const match = await holon.phenotype.match([9826, 4245975], [9826, 31967]);
```

## Error handling

Non-2xx responses (and network/timeout failures) throw a `HolonError` from
[`@holon/types`](https://www.npmjs.com/package/@holon/types), carrying a
machine-readable `ErrorCode` and the raw response detail:

```ts
import { HolonError, ErrorCode } from "@holon/types";

try {
  await holon.concepts.getByCode("bogus", "RxNorm");
} catch (err) {
  if (err instanceof HolonError) {
    console.error(err.code, err.message); // e.g. CONCEPT_NOT_FOUND …
    if (err.code === ErrorCode.RATE_LIMIT_EXCEEDED) backOff();
    // err.details holds { status, body } from the response
  }
}
```

Common codes: `CONCEPT_NOT_FOUND`, `VOCABULARY_NOT_FOUND`, `NO_MAPPING_FOUND`,
`INTERACTION_CHECK_FAILED`, `UNAUTHORIZED`, `FORBIDDEN`, `RATE_LIMIT_EXCEEDED`,
`VALIDATION_ERROR`. See the full [`ErrorCode` enum](https://www.npmjs.com/package/@holon/types).

## TypeScript

Response and entity types are exported for you to annotate with:

```ts
import type {
  HolonClient,
  ConceptResponse,
  SearchResponse,
  InteractionsResponse,
  MappingEntry,
  ReferenceRangeEntry,
  PhenotypeMatch,
} from "@holon/client";
```

The lower-level `*Api` classes (`ConceptsApi`, `InteractionsApi`, `MappingsApi`,
`ReferenceRangesApi`, `PhenotypeApi`) are also exported if you want to construct
a single namespace directly.

## Related packages

- [`@holon/types`](https://www.npmjs.com/package/@holon/types) — shared enums (`ErrorCode`, `VocabularyId`, `DomainId`), error classes, and entity types. A peer of this client.
- [`@dtp/sdk`](https://www.npmjs.com/package/@dtp/sdk) — the DTP digital-twin SDK, which re-exports this client as `dtp.holon`.

## Documentation & support

- Developer docs: <https://developer.ontomorph.com/docs>
- API reference: <https://developer.ontomorph.com/api-reference>
- Issues: <https://github.com/ontomorph-core/holon-client/issues>

## License

UNLICENSED — © OntoMorph. Usage governed by your OntoMorph platform agreement.
