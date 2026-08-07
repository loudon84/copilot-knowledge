import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getKnowledgeDataMode } from "@/services/endpoint-config";
import type { PublicAuthState } from "@/types/auth";

vi.mock("@/actions/auth", () => ({
  getAuthState: vi.fn(),
  logout: vi.fn(async () => ({ status: "unauthenticated" as const })),
  getAuthEndpointConfig: vi.fn(async () => ({
    authBackendUrl: "http://127.0.0.1:4510",
    authPrefix: "/api/v1/auth",
  })),
  saveAuthEndpointConfig: vi.fn(async () => undefined),
  login: vi.fn(async () => ({ status: "authenticated" as const })),
}));

import { getAuthState } from "@/actions/auth";
import { KnowledgeAuthProvider } from "@/modules/auth/KnowledgeAuthProvider";

describe("getKnowledgeDataMode", () => {
  test("returns mock by default or from env", () => {
    const mode = getKnowledgeDataMode();
    expect(mode === "mock" || mode === "remote").toBe(true);
    // Default / .env.development for this project is mock unless overridden.
    if (import.meta.env.VITE_KNOWLEDGE_DATA_MODE == null) {
      expect(mode).toBe("mock");
    } else {
      expect(mode).toBe(
        import.meta.env.VITE_KNOWLEDGE_DATA_MODE === "remote"
          ? "remote"
          : "mock"
      );
    }
  });
});

describe("KnowledgeAuthProvider", () => {
  beforeEach(() => {
    vi.mocked(getAuthState).mockReset();
  });

  test("shows Bootstrap while auth is loading even in mock mode", async () => {
    let resolveAuth!: (state: PublicAuthState) => void;
    vi.mocked(getAuthState).mockReturnValue(
      new Promise<PublicAuthState>((resolve) => {
        resolveAuth = resolve;
      })
    );

    render(
      <KnowledgeAuthProvider>
        <div>Protected Content</div>
      </KnowledgeAuthProvider>
    );

    expect(screen.getByText("正在初始化...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();

    resolveAuth({ status: "unauthenticated" });
    await waitFor(() => {
      expect(screen.getByText("Copilot Knowledge")).toBeInTheDocument();
    });
  });

  test("shows login screen when unauthenticated (does not skip login for mock)", async () => {
    vi.mocked(getAuthState).mockResolvedValue({ status: "unauthenticated" });

    render(
      <KnowledgeAuthProvider>
        <div>Protected Content</div>
      </KnowledgeAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Copilot Knowledge")).toBeInTheDocument();
    });
    expect(getAuthState).toHaveBeenCalled();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.queryByText("Mock 用户")).not.toBeInTheDocument();
  });
});
