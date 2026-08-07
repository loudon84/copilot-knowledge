export type { UserSummary } from "@/types/user-summary";

export type KnowledgeBaseStatus = "active" | "disabled" | "syncing" | "error";
export type VisibilityScope = "private" | "department" | "organization";

export interface KnowledgeBase {
  chunkCount: number;
  chunkSize?: number;
  createdAt: string;
  description: string;
  documentCount: number;
  embeddingModel: string;
  icon?: string;
  id: string;
  name: string;
  owner: import("./user-summary").UserSummary;
  parserStrategy: string;
  status: KnowledgeBaseStatus;
  tags: string[];
  updatedAt: string;
  visibility: VisibilityScope;
}

export interface KnowledgeBaseRuntimeInfo {
  lastError?: string;
  lastSyncAt?: string;
  parseSuccessRate: number;
  ragflowDatasetId: string;
}

export interface KnowledgeBaseDetail extends KnowledgeBase {
  members: import("./permission").PermissionRecord[];
  runtimeInfo: KnowledgeBaseRuntimeInfo;
}

export interface CreateKnowledgeBaseInput {
  chunkSize?: number;
  description: string;
  embeddingModel?: string;
  icon?: string;
  name: string;
  parserStrategy?: string;
  tags?: string[];
  visibility?: VisibilityScope;
}

export interface UpdateKnowledgeBaseInput {
  chunkSize?: number;
  description?: string;
  embeddingModel?: string;
  icon?: string;
  name?: string;
  parserStrategy?: string;
  status?: KnowledgeBaseStatus;
  tags?: string[];
  visibility?: VisibilityScope;
}

export interface KnowledgeDashboardParseStatus {
  completed: number;
  failed: number;
  parsing: number;
  pending: number;
}

export interface KnowledgeDashboard {
  parseStatusSummary: KnowledgeDashboardParseStatus;
  recentDocumentIds: string[];
  recentKnowledgeSetIds: string[];
  stats: {
    knowledgeBaseCount: number;
    knowledgeSetCount: number;
    documentCount: number;
    weeklyQueryCount: number;
  };
}
