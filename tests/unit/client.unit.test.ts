import { describe, expect, test } from "bun:test";
import { createHolonClient } from "../../src/index.ts";

describe("createHolonClient", () => {
  test("creates client with concepts API", () => {
    const client = createHolonClient({ apiUrl: "http://localhost:3000", apiKey: "test" });
    expect(client.concepts).toBeDefined();
  });

  test("concepts API has ancestor and descendant methods", () => {
    const client = createHolonClient({ apiUrl: "http://localhost:3000", apiKey: "test" });
    expect(typeof client.concepts.getAncestors).toBe("function");
    expect(typeof client.concepts.getDescendants).toBe("function");
  });
});
