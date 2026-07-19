import { ErrorCode, HolonError } from "@holon/types";
import type { HolonApiError, HolonClientConfig } from "./types.ts";

/**
 * Shared HTTP helper for every `*Api` class. Centralises bearer auth, timeout wiring,
 * and structured error mapping so the SDK throws `HolonError` with a real `ErrorCode`
 * instead of bare `new Error("...")`.
 */
export class HolonHttpClient {
  constructor(private readonly config: HolonClientConfig) {}

  /** Issue a GET against the HOLON API and parse the JSON response. */
  async get<T>(path: string, errorContext: string): Promise<T> {
    return this.request<T>(path, { method: "GET" }, errorContext);
  }

  /** Issue a JSON POST against the HOLON API and parse the JSON response. */
  async post<T>(path: string, body: unknown, errorContext: string): Promise<T> {
    return this.request<T>(
      path,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      errorContext,
    );
  }

  private async request<T>(path: string, init: RequestInit, errorContext: string): Promise<T> {
    const headers: Record<string, string> = {
      ...((init.headers as Record<string, string>) ?? {}),
      Authorization: `Bearer ${this.config.apiKey}`,
    };

    const opts: RequestInit = { ...init, headers };
    if (this.config.timeout !== undefined) {
      opts.signal = AbortSignal.timeout(this.config.timeout);
    }

    const res = await globalThis.fetch(`${this.config.apiUrl}${path}`, opts);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as HolonApiError | null;
      throw new HolonError(
        `${errorContext}: ${body?.error ?? `HTTP ${res.status}`}`,
        (body?.code as ErrorCode) ?? ErrorCode.NOT_IMPLEMENTED,
        { status: res.status, body },
      );
    }
    return (await res.json()) as T;
  }
}
