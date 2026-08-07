import { getKnowledgeDataMode } from "@/services/endpoint-config";
import type { KnowledgeRepository } from "@/services/knowledge/knowledge-repository";
import { MockKnowledgeRepository } from "@/services/knowledge/mock-knowledge-repository";
import { RemoteKnowledgeRepository } from "@/services/knowledge/remote-knowledge-repository";

function createKnowledgeService(): KnowledgeRepository {
  return getKnowledgeDataMode() === "remote"
    ? new RemoteKnowledgeRepository()
    : new MockKnowledgeRepository();
}

export const knowledgeService: KnowledgeRepository = createKnowledgeService();
