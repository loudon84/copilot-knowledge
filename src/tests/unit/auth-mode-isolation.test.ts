import { describe, expect, it } from "vitest";
import { getKnowledgeDataMode } from "@/services/endpoint-config";

/**
 * Guard test: knowledge data mock mode must never gate authentication.
 * Auth always goes through KnowledgeAuthProvider → getAuthState IPC.
 */
describe("knowledge mock mode does not bypass login", () => {
  it("reports knowledge data mode independently of auth", () => {
    expect(getKnowledgeDataMode()).toBe("mock");
  });

  it("auth provider source does not inject mock auth state", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const file = path.resolve(
      process.cwd(),
      "src/modules/auth/KnowledgeAuthProvider.tsx"
    );
    const source = fs.readFileSync(file, "utf-8");
    expect(source).not.toContain("MOCK_AUTH_STATE");
    expect(source).not.toContain("isMockMode");
    expect(source).not.toContain("getApiMode");
    expect(source).toContain("getAuthState");
  });
});
