import answerFixtures from "@/mock/knowledge/chat-answer-fixtures.json";
import type { KnowledgeRepository } from "@/services/knowledge/knowledge-repository";
import { useChatDemoStore } from "@/stores/chat-demo-store";
import { useMockKnowledgeStore } from "@/stores/mock-knowledge-store";
import { usePreferenceStore } from "@/stores/preference-store";
import { useUploadJobStore } from "@/stores/upload-job-store";
import type {
  CreateKnowledgeBaseInput,
  KnowledgeBase,
  KnowledgeBaseDetail,
  KnowledgeBaseRuntimeInfo,
  KnowledgeDashboard,
  UpdateKnowledgeBaseInput,
} from "@/types/knowledge-base";
import type {
  ChatAnswerFixture,
  ChatMessage,
  ChatResponse,
  ChatSession,
  CreateChatSessionInput,
  KnowledgeCitation,
  SendMessageInput,
} from "@/types/knowledge-chat";
import type {
  DocumentFilter,
  DocumentParseInfo,
  DocumentPreview,
  DocumentPreviewType,
  DocumentVersion,
  KnowledgeDocument,
  KnowledgeDocumentDetail,
  MockUploadFile,
} from "@/types/knowledge-document";
import type {
  CreateKnowledgeSetInput,
  KnowledgeSet,
  KnowledgeSetDetail,
  UpdateKnowledgeSetInput,
} from "@/types/knowledge-set";
import { defaultRetrievalConfig } from "@/types/knowledge-set";
import type { UploadJob } from "@/types/upload-job";
import type { UserSummary } from "@/types/user-summary";

const DEMO_OWNER: UserSummary = {
  id: "user_001",
  displayName: "张三",
  email: "zhangsan@example.com",
};

const KEYWORD_ORDER = ["销售", "财务", "采购", "合同", "产品", "权限"] as const;

function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withDelay<T>(fn: () => T | Promise<T>): Promise<T> {
  const ms = usePreferenceStore.getState().mockDelayMs ?? 300;
  await delay(ms);
  return fn();
}

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function equalWeights(ids: string[]): Record<string, number> {
  if (ids.length === 0) {
    return {};
  }
  const weight = Number((1 / ids.length).toFixed(4));
  return Object.fromEntries(ids.map((id) => [id, weight]));
}

function previewTypeFromExtension(extension: string): DocumentPreviewType {
  const ext = extension.replace(/^\./, "").toLowerCase();
  if (ext === "pdf") {
    return "pdf";
  }
  if (ext === "docx" || ext === "doc") {
    return "docx";
  }
  if (ext === "xlsx" || ext === "xls") {
    return "xlsx";
  }
  if (ext === "md" || ext === "markdown") {
    return "md";
  }
  if (ext === "txt") {
    return "txt";
  }
  return "other";
}

function buildPreview(doc: KnowledgeDocument): DocumentPreview {
  const type = previewTypeFromExtension(doc.extension);
  const placeholders: Record<DocumentPreviewType, string> = {
    pdf: `【PDF 预览占位】《${doc.name}》共 ${doc.pageCount ?? "?"} 页。Demo 阶段不渲染真实文件内容。`,
    docx: `【Word 预览占位】以下为《${doc.name}》的模拟正文摘要……`,
    xlsx: "【Excel 预览占位】表格：列 A/B/C · 行 1–20（模拟）",
    md: `# ${doc.name}\n\n> Markdown 预览占位\n\n- 条目一\n- 条目二\n`,
    txt: `纯文本预览占位：${doc.name}`,
    other: `暂不支持该类型预览：${doc.name}`,
  };
  return {
    type,
    title: doc.name,
    content: placeholders[type],
    pageCount: doc.pageCount,
  };
}

function buildParseInfo(doc: KnowledgeDocument): DocumentParseInfo {
  return {
    parseStatus: doc.parseStatus,
    chunkCount: doc.chunkCount,
    pageCount: doc.pageCount,
    wordCount:
      doc.parseStatus === "completed"
        ? Math.max(200, doc.chunkCount * 120)
        : undefined,
    parserStrategy: "general",
    durationMs:
      doc.parseStatus === "completed" ? 1200 + doc.chunkCount * 15 : undefined,
    lastError:
      doc.parseStatus === "failed"
        ? "Mock 解析失败：文件损坏或格式不受支持"
        : undefined,
  };
}

function buildRuntimeInfo(kb: KnowledgeBase): KnowledgeBaseRuntimeInfo {
  const docs = useMockKnowledgeStore
    .getState()
    .documents.filter((d) => d.knowledgeBaseId === kb.id);
  const completed = docs.filter((d) => d.parseStatus === "completed").length;
  const parseSuccessRate =
    docs.length === 0 ? 1 : Number((completed / docs.length).toFixed(2));
  return {
    ragflowDatasetId: `mock_dataset_${kb.id.replace("kb_", "")}`,
    parseSuccessRate,
    lastSyncAt: kb.updatedAt,
    lastError:
      kb.status === "error"
        ? "最近一次同步失败：RAGFlow 数据集暂时不可用（Mock）"
        : undefined,
  };
}

function matchAnswerFixture(question: string): ChatAnswerFixture {
  const fixtures = answerFixtures as ChatAnswerFixture[];
  for (const keyword of KEYWORD_ORDER) {
    if (question.includes(keyword)) {
      const hit = fixtures.find((f) => f.keywords.includes(keyword));
      if (hit) {
        return hit;
      }
    }
  }
  for (const fixture of fixtures) {
    if (fixture.keywords.some((kw) => question.includes(kw))) {
      return fixture;
    }
  }
  return (
    fixtures.find((f) => f.keywords.includes("通用")) ??
    fixtures[fixtures.length - 1]
  );
}

function buildCitations(
  fixture: ChatAnswerFixture,
  limit = 3
): KnowledgeCitation[] {
  const store = useMockKnowledgeStore.getState();
  const docIds = fixture.citationDocumentIds ?? [];
  const citations: KnowledgeCitation[] = [];
  for (const documentId of docIds.slice(0, limit)) {
    const doc = store.documents.find((d) => d.id === documentId);
    if (!doc) {
      continue;
    }
    const kb = store.knowledgeBases.find((k) => k.id === doc.knowledgeBaseId);
    citations.push({
      id: createId("cite"),
      documentId: doc.id,
      documentName: doc.name,
      knowledgeBaseName: kb?.name ?? "未知知识库",
      version: doc.currentVersion,
      page: doc.pageCount ? Math.min(3, doc.pageCount) : undefined,
      chunkText: `${fixture.answer.slice(0, 48)}……（摘自 ${doc.name}）`,
      score: Number((0.78 + citations.length * 0.04).toFixed(2)),
    });
  }
  while (citations.length < 2 && store.documents.length > 0) {
    const doc = store.documents[citations.length % store.documents.length];
    const kb = store.knowledgeBases.find((k) => k.id === doc.knowledgeBaseId);
    citations.push({
      id: createId("cite"),
      documentId: doc.id,
      documentName: doc.name,
      knowledgeBaseName: kb?.name ?? "未知知识库",
      version: doc.currentVersion,
      page: 1,
      chunkText: "通用引用片段：请打开文档原文核对上下文。",
      score: 0.72,
    });
  }
  return citations.slice(0, Math.min(4, Math.max(2, citations.length)));
}

export class MockKnowledgeRepository implements KnowledgeRepository {
  async getDashboard(): Promise<KnowledgeDashboard> {
    return withDelay(() => {
      useMockKnowledgeStore.getState().refreshDerived();
      return structuredClone(useMockKnowledgeStore.getState().dashboard);
    });
  }

  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    return withDelay(() =>
      structuredClone(useMockKnowledgeStore.getState().knowledgeBases)
    );
  }

  async getKnowledgeBase(id: string): Promise<KnowledgeBaseDetail> {
    return withDelay(() => {
      const store = useMockKnowledgeStore.getState();
      const kb = store.knowledgeBases.find((item) => item.id === id);
      if (!kb) {
        throw new Error(`Knowledge base not found: ${id}`);
      }
      const members = store.permissions.filter(
        (p) => p.resourceType === "knowledge_base" && p.resourceId === id
      );
      return {
        ...structuredClone(kb),
        members: structuredClone(members),
        runtimeInfo: buildRuntimeInfo(kb),
      };
    });
  }

  async createKnowledgeBase(
    input: CreateKnowledgeBaseInput
  ): Promise<KnowledgeBase> {
    return withDelay(() => {
      const stamp = nowIso();
      const kb: KnowledgeBase = {
        id: createId("kb"),
        name: input.name,
        description: input.description,
        icon: input.icon,
        tags: input.tags ?? [],
        status: "active",
        visibility: input.visibility ?? "organization",
        documentCount: 0,
        chunkCount: 0,
        owner: DEMO_OWNER,
        parserStrategy: input.parserStrategy ?? "general",
        embeddingModel: input.embeddingModel ?? "bge-m3",
        chunkSize: input.chunkSize ?? 512,
        createdAt: stamp,
        updatedAt: stamp,
      };
      useMockKnowledgeStore.getState().upsertKnowledgeBase(kb);
      return structuredClone(kb);
    });
  }

  async updateKnowledgeBase(
    id: string,
    input: UpdateKnowledgeBaseInput
  ): Promise<KnowledgeBase> {
    return withDelay(() => {
      const store = useMockKnowledgeStore.getState();
      const existing = store.knowledgeBases.find((item) => item.id === id);
      if (!existing) {
        throw new Error(`Knowledge base not found: ${id}`);
      }
      const updated: KnowledgeBase = {
        ...existing,
        ...input,
        tags: input.tags ?? existing.tags,
        updatedAt: nowIso(),
      };
      store.upsertKnowledgeBase(updated);
      return structuredClone(updated);
    });
  }

  async deleteKnowledgeBase(id: string): Promise<void> {
    return withDelay(() => {
      useMockKnowledgeStore.getState().removeKnowledgeBase(id);
    });
  }

  async listKnowledgeSets(): Promise<KnowledgeSet[]> {
    return withDelay(() =>
      structuredClone(useMockKnowledgeStore.getState().knowledgeSets)
    );
  }

  async getKnowledgeSet(id: string): Promise<KnowledgeSetDetail> {
    return withDelay(() => {
      const store = useMockKnowledgeStore.getState();
      const ks = store.knowledgeSets.find((item) => item.id === id);
      if (!ks) {
        throw new Error(`Knowledge set not found: ${id}`);
      }
      const knowledgeBases = store.knowledgeBases.filter((kb) =>
        ks.knowledgeBaseIds.includes(kb.id)
      );
      return {
        ...structuredClone(ks),
        knowledgeBases: structuredClone(knowledgeBases),
      };
    });
  }

  async createKnowledgeSet(
    input: CreateKnowledgeSetInput
  ): Promise<KnowledgeSet> {
    return withDelay(() => {
      const stamp = nowIso();
      const knowledgeBaseIds = input.knowledgeBaseIds ?? [];
      const store = useMockKnowledgeStore.getState();
      const documentCount = store.documents.filter((d) =>
        knowledgeBaseIds.includes(d.knowledgeBaseId)
      ).length;
      const ks: KnowledgeSet = {
        id: createId("ks"),
        name: input.name,
        description: input.description,
        knowledgeBaseIds,
        weights: input.weights ?? equalWeights(knowledgeBaseIds),
        visibility: input.visibility ?? "organization",
        documentCount,
        retrievalConfig: {
          ...defaultRetrievalConfig,
          ...input.retrievalConfig,
        },
        createdBy: DEMO_OWNER,
        createdAt: stamp,
        updatedAt: stamp,
      };
      store.upsertKnowledgeSet(ks);
      return structuredClone(ks);
    });
  }

  async updateKnowledgeSet(
    id: string,
    input: UpdateKnowledgeSetInput
  ): Promise<KnowledgeSet> {
    return withDelay(() => {
      const store = useMockKnowledgeStore.getState();
      const existing = store.knowledgeSets.find((item) => item.id === id);
      if (!existing) {
        throw new Error(`Knowledge set not found: ${id}`);
      }
      const knowledgeBaseIds =
        input.knowledgeBaseIds ?? existing.knowledgeBaseIds;
      const documentCount = store.documents.filter((d) =>
        knowledgeBaseIds.includes(d.knowledgeBaseId)
      ).length;
      const updated: KnowledgeSet = {
        ...existing,
        ...input,
        knowledgeBaseIds,
        weights:
          input.weights ??
          (input.knowledgeBaseIds
            ? equalWeights(knowledgeBaseIds)
            : existing.weights),
        retrievalConfig: {
          ...existing.retrievalConfig,
          ...input.retrievalConfig,
        },
        documentCount,
        updatedAt: nowIso(),
      };
      store.upsertKnowledgeSet(updated);
      return structuredClone(updated);
    });
  }

  async bindKnowledgeBases(
    knowledgeSetId: string,
    knowledgeBaseIds: string[]
  ): Promise<KnowledgeSetDetail> {
    await this.updateKnowledgeSet(knowledgeSetId, {
      knowledgeBaseIds,
      weights: equalWeights(knowledgeBaseIds),
    });
    return this.getKnowledgeSet(knowledgeSetId);
  }

  async listDocuments(filter?: DocumentFilter): Promise<KnowledgeDocument[]> {
    return withDelay(() => {
      let docs = [...useMockKnowledgeStore.getState().documents];
      if (filter?.knowledgeBaseId) {
        docs = docs.filter((d) => d.knowledgeBaseId === filter.knowledgeBaseId);
      }
      if (filter?.extension) {
        const ext = filter.extension.replace(/^\./, "").toLowerCase();
        docs = docs.filter((d) => d.extension.toLowerCase() === ext);
      }
      if (filter?.parseStatus) {
        docs = docs.filter((d) => d.parseStatus === filter.parseStatus);
      }
      if (filter?.visibility) {
        docs = docs.filter((d) => d.visibility === filter.visibility);
      }
      if (filter?.search?.trim()) {
        const q = filter.search.trim().toLowerCase();
        docs = docs.filter((d) => d.name.toLowerCase().includes(q));
      }
      return structuredClone(docs);
    });
  }

  async getDocument(id: string): Promise<KnowledgeDocumentDetail> {
    return withDelay(() => {
      const store = useMockKnowledgeStore.getState();
      const doc = store.documents.find((item) => item.id === id);
      if (!doc) {
        throw new Error(`Document not found: ${id}`);
      }
      const versions = store.documentVersions
        .filter((v) => v.documentId === id)
        .sort((a, b) => b.version - a.version);
      const permissions = store.permissions.filter(
        (p) => p.resourceType === "document" && p.resourceId === id
      );
      const kb = store.knowledgeBases.find(
        (item) => item.id === doc.knowledgeBaseId
      );
      return {
        ...structuredClone(doc),
        versions: structuredClone(versions),
        parseInfo: buildParseInfo(doc),
        preview: buildPreview(doc),
        permissions: structuredClone(permissions),
        knowledgeBaseName: kb?.name,
      };
    });
  }

  async createUploadJobs(files: MockUploadFile[]): Promise<UploadJob[]> {
    return withDelay(() => {
      const stamp = nowIso();
      const jobs: UploadJob[] = files.map((file) => {
        const forceFail = file.name.toLowerCase().includes("fail");
        return {
          id: createId("job"),
          knowledgeBaseId: file.knowledgeBaseId,
          fileName: file.name,
          extension: file.extension.replace(/^\./, ""),
          mimeType: file.mimeType,
          size: file.size,
          status: "waiting",
          progress: 0,
          forceFail,
          createdAt: stamp,
          updatedAt: stamp,
        };
      });
      const uploadStore = useUploadJobStore.getState();
      uploadStore.addJobs(jobs);
      for (const job of jobs) {
        uploadStore.startSimulation(job.id);
      }
      return structuredClone(jobs);
    });
  }

  async createDocumentVersion(
    documentId: string,
    file: MockUploadFile
  ): Promise<DocumentVersion> {
    return withDelay(() => {
      const store = useMockKnowledgeStore.getState();
      const doc = store.documents.find((item) => item.id === documentId);
      if (!doc) {
        throw new Error(`Document not found: ${documentId}`);
      }
      const stamp = nowIso();
      const nextVersion = doc.currentVersion + 1;
      const updatedVersions = store.documentVersions.map((v) =>
        v.documentId === documentId && v.status === "current"
          ? { ...v, status: "replaced" as const }
          : v
      );
      const version: DocumentVersion = {
        id: createId("ver"),
        documentId,
        version: nextVersion,
        fileName: file.name,
        size: file.size,
        mimeType: file.mimeType,
        status: "current",
        parseStatus: "completed",
        uploadedBy: DEMO_OWNER,
        createdAt: stamp,
      };
      const updatedDoc: KnowledgeDocument = {
        ...doc,
        name: file.name,
        extension: file.extension.replace(/^\./, ""),
        mimeType: file.mimeType,
        size: file.size,
        currentVersion: nextVersion,
        parseStatus: "completed",
        chunkCount: Math.max(8, Math.round(file.size / 50_000)),
        updatedBy: DEMO_OWNER,
        updatedAt: stamp,
      };
      useMockKnowledgeStore.setState({ documentVersions: updatedVersions });
      useMockKnowledgeStore.getState().upsertDocument(updatedDoc, version);
      return structuredClone(version);
    });
  }

  async listUploadJobs(): Promise<UploadJob[]> {
    return withDelay(() => structuredClone(useUploadJobStore.getState().jobs));
  }

  async listChatSessions(): Promise<ChatSession[]> {
    return withDelay(() =>
      structuredClone(useChatDemoStore.getState().sessions)
    );
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return withDelay(() => {
      const messages =
        useChatDemoStore.getState().messagesBySessionId[sessionId] ?? [];
      return structuredClone(messages);
    });
  }

  async createChatSession(input: CreateChatSessionInput): Promise<ChatSession> {
    return withDelay(() => {
      const stamp = nowIso();
      const ks = useMockKnowledgeStore
        .getState()
        .knowledgeSets.find((item) => item.id === input.knowledgeSetId);
      const session: ChatSession = {
        id: createId("session"),
        title: input.title?.trim() || "新的知识问答",
        knowledgeSetId: input.knowledgeSetId,
        knowledgeSetName: ks?.name,
        answerMode: input.answerMode ?? "detailed",
        showCitations: input.showCitations ?? true,
        createdAt: stamp,
        updatedAt: stamp,
      };
      useChatDemoStore.getState().upsertSession(session);
      useChatDemoStore.getState().setMessages(session.id, []);
      return structuredClone(session);
    });
  }

  async sendMessage(
    sessionId: string,
    input: SendMessageInput
  ): Promise<ChatResponse> {
    const chatStore = useChatDemoStore.getState();
    const session = chatStore.sessions.find((s) => s.id === sessionId);
    if (!session) {
      throw new Error(`Chat session not found: ${sessionId}`);
    }

    const userMessage: ChatMessage = {
      id: createId("msg"),
      sessionId,
      role: "user",
      content: input.content,
      createdAt: nowIso(),
    };
    chatStore.appendMessage(userMessage);
    chatStore.setStreamingSessionId(sessionId);
    chatStore.setRetrieving(true);
    chatStore.setGenerating(false);

    const configuredDelay = usePreferenceStore.getState().mockDelayMs ?? 300;
    const pause = (ms: number) => delay(configuredDelay <= 0 ? 0 : ms);

    await pause(400);

    chatStore.setRetrieving(false);
    chatStore.setGenerating(true);

    const fixture = matchAnswerFixture(input.content);
    const citations = session.showCitations ? buildCitations(fixture) : [];
    const assistantMessage: ChatMessage = {
      id: createId("msg"),
      sessionId,
      role: "assistant",
      content: fixture.answer,
      citations: citations.length ? citations : undefined,
      createdAt: nowIso(),
    };

    // Simulate streaming latency proportional to answer length (capped).
    const streamMs = Math.min(1200, Math.max(200, fixture.answer.length * 8));
    await pause(streamMs);

    chatStore.appendMessage(assistantMessage);
    chatStore.upsertSession({
      ...session,
      title:
        session.title === "新的知识问答"
          ? input.content.slice(0, 24) || session.title
          : session.title,
      updatedAt: nowIso(),
    });
    chatStore.clearStreamingState();

    return {
      message: structuredClone(assistantMessage),
      citations: structuredClone(citations),
    };
  }

  async resetDemoData(): Promise<void> {
    usePreferenceStore.getState().resetDemoData();
  }
}
