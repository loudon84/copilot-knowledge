export interface KnowledgeCitation {
  chunkText: string;
  documentId: string;
  documentName: string;
  id: string;
  knowledgeBaseName: string;
  page?: number;
  score: number;
  version: number;
}

export interface ChatSession {
  answerMode: "concise" | "detailed" | "structured";
  createdAt: string;
  id: string;
  knowledgeSetId: string;
  knowledgeSetName?: string;
  showCitations: boolean;
  title: string;
  updatedAt: string;
}

export interface ChatMessage {
  citations?: KnowledgeCitation[];
  content: string;
  createdAt: string;
  id: string;
  role: "user" | "assistant" | "system";
  sessionId: string;
  status?: "streaming" | "done" | "error";
}

export interface CreateChatSessionInput {
  answerMode?: "concise" | "detailed" | "structured";
  knowledgeSetId: string;
  showCitations?: boolean;
  title?: string;
}

export interface SendMessageInput {
  content: string;
}

export interface ChatResponse {
  citations: KnowledgeCitation[];
  message: ChatMessage;
}

export interface ChatAnswerFixture {
  answer: string;
  citationDocumentIds?: string[];
  keywords: string[];
}
