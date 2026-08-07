import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/auth/KnowledgeAuthProvider", () => ({
  useAuth: () => ({
    authState: {
      status: "authenticated",
      user: {
        id: "real-user-1",
        displayName: "真实用户甲",
        email: "real@example.com",
        phone: "13800000000",
        orgRole: "member",
      },
      organization: { id: "org_1", name: "示例组织" },
    },
    logout: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/actions/auth", () => ({
  getAuthEndpointConfig: async () => ({
    authBackendUrl: "http://127.0.0.1:4510",
    authPrefix: "/api/v1/auth",
  }),
}));

vi.mock("@/actions/theme", () => ({
  setTheme: vi.fn(),
}));

vi.mock("@/features/knowledge-sets/api/use-knowledge-sets", () => ({
  useKnowledgeSets: () => ({
    data: [{ id: "ks_001", name: "销售工作知识集" }],
    isLoading: false,
    isError: false,
  }),
}));

function wrap(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe("profile page uses real auth user", () => {
  it("shows authenticated user identity, not mock placeholder", async () => {
    const { ProfilePage } = await import("@/features/profile/profile-page");
    wrap(<ProfilePage />);
    expect(await screen.findByText("真实用户甲")).toBeInTheDocument();
    expect(screen.getByText(/real@example.com/)).toBeInTheDocument();
    expect(screen.queryByText(/Mock 用户/)).toBeNull();
    expect(screen.queryByText(/demo@autotask/)).toBeNull();
  });
});
