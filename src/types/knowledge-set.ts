import type { KnowledgeBase, VisibilityScope } from "./knowledge-base";
import type { UserSummary } from "./user-summary";

export interface RetrievalConfig {
  answerModel: string;
  enableRerank: boolean;
  keywordWeight: number;
  similarityThreshold: number;
  topK: number;
  vectorWeight: number;
}

export const defaultRetrievalConfig: RetrievalConfig = {
  topK: 8,
  similarityThreshold: 0.65,
  keywordWeight: 0.3,
  vectorWeight: 0.7,
  enableRerank: true,
  answerModel: "gpt-4o-mini",
};

export interface KnowledgeSet {
  createdAt: string;
  createdBy: UserSummary;
  description: string;
  documentCount: number;
  id: string;
  knowledgeBaseIds: string[];
  name: string;
  retrievalConfig: RetrievalConfig;
  updatedAt: string;
  visibility: VisibilityScope;
  weights: Record<string, number>;
}

export interface KnowledgeSetDetail extends KnowledgeSet {
  knowledgeBases: KnowledgeBase[];
  lastUsedAt?: string;
  usageCount?: number;
}

export interface CreateKnowledgeSetInput {
  description: string;
  knowledgeBaseIds?: string[];
  name: string;
  retrievalConfig?: Partial<RetrievalConfig>;
  visibility?: VisibilityScope;
  weights?: Record<string, number>;
}

export interface UpdateKnowledgeSetInput {
  description?: string;
  knowledgeBaseIds?: string[];
  name?: string;
  retrievalConfig?: Partial<RetrievalConfig>;
  visibility?: VisibilityScope;
  weights?: Record<string, number>;
}
