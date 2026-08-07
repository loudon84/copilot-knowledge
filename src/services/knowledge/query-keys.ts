export const knowledgeQueryKeys = {
  all: ["knowledge"] as const,
  dashboard: () => [...knowledgeQueryKeys.all, "dashboard"] as const,
  knowledgeBases: {
    all: () => [...knowledgeQueryKeys.all, "knowledgeBases"] as const,
    list: () => [...knowledgeQueryKeys.knowledgeBases.all(), "list"] as const,
    detail: (id: string) =>
      [...knowledgeQueryKeys.knowledgeBases.all(), "detail", id] as const,
  },
  knowledgeSets: {
    all: () => [...knowledgeQueryKeys.all, "knowledgeSets"] as const,
    list: () => [...knowledgeQueryKeys.knowledgeSets.all(), "list"] as const,
    detail: (id: string) =>
      [...knowledgeQueryKeys.knowledgeSets.all(), "detail", id] as const,
  },
  documents: {
    all: () => [...knowledgeQueryKeys.all, "documents"] as const,
    list: (filter?: Record<string, unknown>) =>
      [...knowledgeQueryKeys.documents.all(), "list", filter ?? {}] as const,
    detail: (id: string) =>
      [...knowledgeQueryKeys.documents.all(), "detail", id] as const,
  },
  uploadJobs: {
    all: () => [...knowledgeQueryKeys.all, "uploadJobs"] as const,
    list: () => [...knowledgeQueryKeys.uploadJobs.all(), "list"] as const,
  },
  chat: {
    all: () => [...knowledgeQueryKeys.all, "chat"] as const,
    sessions: () => [...knowledgeQueryKeys.chat.all(), "sessions"] as const,
    messages: (sessionId: string) =>
      [...knowledgeQueryKeys.chat.all(), "messages", sessionId] as const,
  },
};
