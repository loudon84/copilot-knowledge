import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { MockKnowledgeRepository } from "@/services/knowledge/mock-knowledge-repository";
import { useMockKnowledgeStore } from "@/stores/mock-knowledge-store";
import { usePreferenceStore } from "@/stores/preference-store";
import { useUploadJobStore } from "@/stores/upload-job-store";

describe("MockKnowledgeRepository", () => {
  const repo = new MockKnowledgeRepository();

  beforeEach(async () => {
    usePreferenceStore.getState().setMockDelayMs(0);
    await repo.resetDemoData();
  });

  afterEach(() => {
    useUploadJobStore.getState().stopAllSimulations();
  });

  test("CRUD knowledge base create/update/delete", async () => {
    const created = await repo.createKnowledgeBase({
      name: "测试知识库",
      description: "单元测试用",
      tags: ["test"],
    });
    expect(created.id).toMatch(/^kb_/);
    expect(created.name).toBe("测试知识库");

    const updated = await repo.updateKnowledgeBase(created.id, {
      name: "测试知识库（已更新）",
      description: "描述已改",
    });
    expect(updated.name).toBe("测试知识库（已更新）");
    expect(updated.description).toBe("描述已改");

    await repo.deleteKnowledgeBase(created.id);
    const list = await repo.listKnowledgeBases();
    expect(list.find((kb) => kb.id === created.id)).toBeUndefined();
  });

  test("bindKnowledgeBases updates knowledge set bindings", async () => {
    const bound = await repo.bindKnowledgeBases("ks_001", ["kb_001", "kb_002"]);
    expect(bound.id).toBe("ks_001");
    expect(bound.knowledgeBaseIds).toEqual(["kb_001", "kb_002"]);
    expect(bound.knowledgeBases.map((kb) => kb.id).sort()).toEqual([
      "kb_001",
      "kb_002",
    ]);
  });

  test("createDocumentVersion updates currentVersion", async () => {
    const before = await repo.getDocument("doc_001");
    const next = before.currentVersion + 1;

    const version = await repo.createDocumentVersion("doc_001", {
      name: "销售话术手册-v下一版.pdf",
      extension: "pdf",
      size: 2_500_000,
      mimeType: "application/pdf",
      knowledgeBaseId: before.knowledgeBaseId,
    });

    expect(version.version).toBe(next);
    expect(version.status).toBe("current");

    const after = await repo.getDocument("doc_001");
    expect(after.currentVersion).toBe(next);
    expect(after.name).toBe("销售话术手册-v下一版.pdf");
  });

  test("createUploadJobs returns waiting jobs", async () => {
    const jobs = await repo.createUploadJobs([
      {
        name: "demo-upload.pdf",
        extension: "pdf",
        size: 1024,
        mimeType: "application/pdf",
        knowledgeBaseId: "kb_001",
      },
    ]);

    expect(jobs).toHaveLength(1);
    expect(jobs[0].status).toBe("waiting");
    expect(jobs[0].fileName).toBe("demo-upload.pdf");
    expect(jobs[0].progress).toBe(0);
  });

  test('sendMessage returns citations for keyword "销售"', async () => {
    const response = await repo.sendMessage("session_001", {
      content: "销售报价怎么算？",
    });

    expect(response.message.role).toBe("assistant");
    expect(response.citations.length).toBeGreaterThan(0);
    expect(response.citations[0].documentName).toBeTruthy();
  });

  test("resetDemoData restores fixtures", async () => {
    const created = await repo.createKnowledgeBase({
      name: "临时知识库",
      description: "应被重置清除",
    });
    expect(
      useMockKnowledgeStore
        .getState()
        .knowledgeBases.some((kb) => kb.id === created.id)
    ).toBe(true);

    await repo.resetDemoData();

    const bases = await repo.listKnowledgeBases();
    expect(bases.find((kb) => kb.id === created.id)).toBeUndefined();
    expect(bases.some((kb) => kb.id === "kb_001")).toBe(true);
    expect(bases.find((kb) => kb.id === "kb_001")?.name).toBe("销售产品知识库");
  });
});
