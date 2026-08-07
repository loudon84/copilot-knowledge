import type { KnowledgeRepository } from "@/services/knowledge/knowledge-repository";
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

const NOT_IMPLEMENTED = "Remote knowledge API not implemented yet";

function reject(): Promise<never> {
  return Promise.reject(new Error(NOT_IMPLEMENTED));
}

export class RemoteKnowledgeRepository implements KnowledgeRepository {
  getDashboard(): Promise<KnowledgeDashboard> {
    return reject();
  }

  listKnowledgeBases(): Promise<KnowledgeBase[]> {
    return reject();
  }

  getKnowledgeBase(_id: string): Promise<KnowledgeBaseDetail> {
    return reject();
  }

  createKnowledgeBase(
    _input: CreateKnowledgeBaseInput
  ): Promise<KnowledgeBase> {
    return reject();
  }

  updateKnowledgeBase(
    _id: string,
    _input: UpdateKnowledgeBaseInput
  ): Promise<KnowledgeBase> {
    return reject();
  }

  deleteKnowledgeBase(_id: string): Promise<void> {
    return reject();
  }

  listKnowledgeSets(): Promise<KnowledgeSet[]> {
    return reject();
  }

  getKnowledgeSet(_id: string): Promise<KnowledgeSetDetail> {
    return reject();
  }

  createKnowledgeSet(_input: CreateKnowledgeSetInput): Promise<KnowledgeSet> {
    return reject();
  }

  updateKnowledgeSet(
    _id: string,
    _input: UpdateKnowledgeSetInput
  ): Promise<KnowledgeSet> {
    return reject();
  }

  bindKnowledgeBases(
    _knowledgeSetId: string,
    _knowledgeBaseIds: string[]
  ): Promise<KnowledgeSetDetail> {
    return reject();
  }

  listDocuments(_filter?: DocumentFilter): Promise<KnowledgeDocument[]> {
    return reject();
  }

  getDocument(_id: string): Promise<KnowledgeDocumentDetail> {
    return reject();
  }

  createUploadJobs(_files: MockUploadFile[]): Promise<UploadJob[]> {
    return reject();
  }

  createDocumentVersion(
    _documentId: string,
    _file: MockUploadFile
  ): Promise<DocumentVersion> {
    return reject();
  }

  listUploadJobs(): Promise<UploadJob[]> {
    return reject();
  }

  listChatSessions(): Promise<ChatSession[]> {
    return reject();
  }

  getChatMessages(_sessionId: string): Promise<ChatMessage[]> {
    return reject();
  }

  createChatSession(_input: CreateChatSessionInput): Promise<ChatSession> {
    return reject();
  }

  sendMessage(
    _sessionId: string,
    _input: SendMessageInput
  ): Promise<ChatResponse> {
    return reject();
  }

  resetDemoData(): Promise<void> {
    return reject();
  }
}
