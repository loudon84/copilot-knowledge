import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CitationCard } from "@/components/knowledge/citation-card";
import { DocumentStatusBadge } from "@/components/knowledge/document-status-badge";
import { UploadStatusBadge } from "@/components/knowledge/upload-status-badge";
import { usePreferenceStore } from "@/stores/preference-store";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
  }: {
    children: ReactNode;
    to?: string;
    params?: Record<string, string>;
  }) => <a href={typeof to === "string" ? to : "#"}>{children}</a>,
}));

function wrap(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe("knowledge UI components", () => {
  beforeEach(() => {
    usePreferenceStore.setState({ mockDelayMs: 0 });
    usePreferenceStore.getState().resetDemoData();
  });

  it("renders document status badge labels", () => {
    wrap(<DocumentStatusBadge status="completed" />);
    expect(screen.getByText("已完成")).toBeInTheDocument();
  });

  it("renders upload status badge uploading text", () => {
    wrap(<UploadStatusBadge status="uploading" />);
    expect(screen.getByText("上传中")).toBeInTheDocument();
  });

  it("renders citation card with document link", () => {
    wrap(
      <CitationCard
        citation={{
          id: "c1",
          documentId: "doc_001",
          documentName: "销售话术手册.pdf",
          knowledgeBaseName: "销售产品知识库",
          version: 1,
          page: 2,
          chunkText: "引用片段",
          score: 0.91,
        }}
      />
    );
    expect(screen.getByText("销售话术手册.pdf")).toBeInTheDocument();
    expect(screen.getByText("查看原文")).toBeInTheDocument();
  });
});
