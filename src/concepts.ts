import { HolonHttpClient } from "./http.ts";
import type {
  AncestryResponse,
  ConceptResponse,
  DescendantsResponse,
  HolonClientConfig,
  SearchResponse,
} from "./types.ts";

/** Concept lookup and search operations. */
export class ConceptsApi {
  private readonly http: HolonHttpClient;

  constructor(config: HolonClientConfig) {
    this.http = new HolonHttpClient(config);
  }

  /** Look up a concept by ID or holonUri. */
  async getById(id: string): Promise<ConceptResponse> {
    return this.http.get(`/concepts/${encodeURIComponent(id)}`, "Concept lookup failed");
  }

  /** Look up a concept by code and vocabulary system. */
  async getByCode(code: string, system: string): Promise<ConceptResponse> {
    const params = new URLSearchParams({ code, system });
    return this.http.get(`/concepts?${params}`, "Concept lookup failed");
  }

  /** Full-text search for concepts. */
  async search(
    query: string,
    options?: { domain?: string; page?: number; pageSize?: number },
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query });
    if (options?.domain) params.set("domain", options.domain);
    if (options?.page) params.set("page", String(options.page));
    if (options?.pageSize) params.set("pageSize", String(options.pageSize));
    return this.http.get(`/concepts?${params}`, "Concept search failed");
  }

  /** Get all ancestors of a concept. */
  async getAncestors(conceptId: number): Promise<AncestryResponse> {
    return this.http.get(`/concepts/${conceptId}/ancestors`, "Ancestor lookup failed");
  }

  /** Get all descendants of a concept. */
  async getDescendants(conceptId: number): Promise<DescendantsResponse> {
    return this.http.get(`/concepts/${conceptId}/descendants`, "Descendant lookup failed");
  }
}
