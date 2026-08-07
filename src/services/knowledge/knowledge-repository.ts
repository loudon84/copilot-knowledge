import type {
  CreateKnowledgeBaseInput,
  KnowledgeBase,
  KnowledgeBaseDetail,
  KnowledgeDashboard,
  UpdateKnowledgeBaseInput,
} from "@/types/knowledge-base";
import type {
  ChatMessage,
  ChatResponse,
  ChatSession,
  CreateChatSessionInput,
  SendMessageInput,
} from "@/types/knowledge-chat";
import type {
  DocumentFilter,
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
import type { UploadJob } from "@/types/upload-job";

export interface KnowledgeRepository {
  bindKnowledgeBases(
    knowledgeSetId: string,
    knowledgeBaseIds: string[]
  ): Promise<KnowledgeSetDetail>;
  createChatSession(input: CreateChatSessionInput): Promise<ChatSession>;
  createDocumentVersion(
    documentId: string,
    file: MockUploadFile
  ): Promise<DocumentVersion>;
  createKnowledgeBase(input: CreateKnowledgeBaseInput): Promise<KnowledgeBase>;
  createKnowledgeSet(input: CreateKnowledgeSetInput): Promise<KnowledgeSet>;
  createUploadJobs(files: MockUploadFile[]): Promise<UploadJob[]>;
  deleteKnowledgeBase(id: string): Promise<void>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  getDashboard(): Promise<KnowledgeDashboard>;
  getDocument(id: string): Promise<KnowledgeDocumentDetail>;
  getKnowledgeBase(id: string): Promise<KnowledgeBaseDetail>;
  getKnowledgeSet(id: string): Promise<KnowledgeSetDetail>;

  listChatSessions(): Promise<ChatSession[]>;

  listDocuments(filter?: DocumentFilter): Promise<KnowledgeDocument[]>;

  listKnowledgeBases(): Promise<KnowledgeBase[]>;

  listKnowledgeSets(): Promise<KnowledgeSet[]>;

  listUploadJobs(): Promise<UploadJob[]>;

  /** Restore all mock stores / fixtures to defaults. */
  resetDemoData(): Promise<void>;
  sendMessage(
    sessionId: string,
    input: SendMessageInput
  ): Promise<ChatResponse>;
  updateKnowledgeBase(
    id: string,
    input: UpdateKnowledgeBaseInput
  ): Promise<KnowledgeBase>;
  updateKnowledgeSet(
    id: string,
    input: UpdateKnowledgeSetInput
  ): Promise<KnowledgeSet>;
}
