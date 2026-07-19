# @holon/client

The official TypeScript client for the HOLON clinical-knowledge API, a
normalized layer over SNOMED CT, RxNorm, LOINC, ICD, and more. One typed client
covers:

- **Concepts:** search, look up by code, and walk the concept hierarchy (ancestors and descendants).
- **Drug interactions:** pairwise checks and whole-medication-list screening.
- **Cross-vocabulary mappings:** translate a code from one vocabulary into another.
- **Reference ranges:** age and sex adjusted normal ranges for lab tests, by concept or LOINC code.
- **Phenotype similarity:** score the overlap between two sets of phenotype terms.

Runs on Node.js 18+, Bun, Deno, and any runtime with a global `fetch`. Fully
typed, with one dependency: [`@holon/types`](https://www.npmjs.com/package/@holon/types).

```bash
npm install @holon/client
# pnpm add @holon/client
# yarn add @holon/client
# bun add @holon/client
```

## Concepts

The vocabulary this client speaks, and why each idea matters.

**Concept.** A single clinical idea (a drug, a lab test, a diagnosis) with a
stable numeric `conceptId` that stays the same no matter which coding system
originally named it. Concepts are the anchor everything else hangs off.

**Vocabulary.** A source coding system such as SNOMED CT, RxNorm, or LOINC. The
same idea often has a different code in each. HOLON normalizes across them so
you work with one concept instead of many codes.

**Domain.** What kind of thing a concept is: a `Drug`, a `Measurement`, a
`Condition`. Domains let you narrow a search to the category you mean.

**Mapping, and translation.** A mapping links the same idea across two
vocabularies. Translating a RxNorm code into its SNOMED equivalent is how you
move a patient's data between systems that speak different codes.

**Reference range.** The normal range for a lab test, narrowed by age and sex,
so a value can be read as high, low, or in range for that specific patient.

**Drug interaction.** A known, clinically significant effect between two drugs.
The interactions API screens a pair or a whole medication list for them.

**Phenotype similarity.** A score for how alike two sets of phenotype terms are.
It is how you compare patients, or match a presentation to a candidate
condition, when exact codes will not line up.

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

Every request carries a bearer API key, sent as `Authorization: Bearer <apiKey>`.
Pass it once when you create the client:

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
await holon.concepts.getByCode("197361", "RxNorm");       // by code and vocabulary
await holon.concepts.search("metformin", { domain: "Drug", page: 1, pageSize: 20 });
await holon.concepts.getAncestors(40213251);              // hierarchy up
await holon.concepts.getDescendants(40213251);            // hierarchy down
```

`search` returns `{ hits, total, page, pageSize }`. Each hit carries a
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

The third argument to `translate` (the target vocabulary) is optional. Omit it
to get mappings into every available vocabulary.

### `holon.referenceRanges`

```ts
await holon.referenceRanges.getByConceptId(3004249);      // by HOLON concept id
await holon.referenceRanges.getByLoincCode("2093-3", 45, "male"); // by LOINC, age and sex adjusted
```

`age` and `sex` are optional. Supply them to narrow the range to that
demographic.

### `holon.phenotype`

```ts
// Score similarity between two sets of phenotype concept ids.
const match = await holon.phenotype.match([9826, 4245975], [9826, 31967]);
```

## Error handling

A non-2xx response (or a network or timeout failure) throws a `HolonError` from
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
`VALIDATION_ERROR`. The full [`ErrorCode` enum](https://www.npmjs.com/package/@holon/types)
lives in `@holon/types`.

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
`ReferenceRangesApi`, `PhenotypeApi`) are exported too, if you want to construct
a single namespace on its own.

## Related packages

- [`@holon/types`](https://www.npmjs.com/package/@holon/types): shared enums (`ErrorCode`, `VocabularyId`, `DomainId`), error classes, and entity types. A peer of this client.
- [`@dtp/sdk`](https://www.npmjs.com/package/@dtp/sdk): the DTP digital-twin SDK, which re-exports this client as `dtp.holon`.

## Documentation and support

- Developer docs: <https://developer.ontomorph.com/docs>
- API reference: <https://developer.ontomorph.com/api-reference>
- Issues: <https://github.com/ontomorph-core/holon-client/issues>

## License

UNLICENSED. © OntoMorph. Usage is governed by your OntoMorph platform agreement.
