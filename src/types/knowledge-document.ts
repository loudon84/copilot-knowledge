import type { PermissionRecord } from "./permission";
import type { UserSummary } from "./user-summary";

export type ParseStatus = "pending" | "parsing" | "completed" | "failed";
export type DocumentVisibility =
  | "private"
  | "department"
  | "organization"
  | "custom";

export interface KnowledgeDocument {
  chunkCount: number;
  createdAt: string;
  currentVersion: number;
  extension: string;
  id: string;
  knowledgeBaseId: string;
  mimeType: string;
  name: string;
  pageCount?: number;
  parseStatus: ParseStatus;
  size: number;
  updatedAt: string;
  updatedBy: UserSummary;
  visibility: DocumentVisibility;
}

export interface DocumentVersion {
  createdAt: string;
  documentId: string;
  fileName: string;
  id: string;
  mimeType: string;
  parseStatus: ParseStatus;
  size: number;
  status: "current" | "replaced" | "archived";
  uploadedBy: UserSummary;
  version: number;
}

export type DocumentPreviewType =
  | "pdf"
  | "docx"
  | "xlsx"
  | "md"
  | "txt"
  | "other";

export interface DocumentPreview {
  content: string;
  pageCount?: number;
  title: string;
  type: DocumentPreviewType;
}

export interface DocumentParseInfo {
  chunkCount: number;
  durationMs?: number;
  lastError?: string;
  pageCount?: number;
  parserStrategy?: string;
  parseStatus: ParseStatus;
  wordCount?: number;
}

export interface KnowledgeDocumentDetail extends KnowledgeDocument {
  knowledgeBaseName?: string;
  parseInfo: DocumentParseInfo;
  permissions: PermissionRecord[];
  preview: DocumentPreview;
  versions: DocumentVersion[];
}

export interface DocumentFilter {
  extension?: string;
  knowledgeBaseId?: string;
  parseStatus?: ParseStatus;
  search?: string;
  visibility?: DocumentVisibility;
}

export interface MockUploadFile {
  extension: string;
  forceFail?: boolean;
  knowledgeBaseId: string;
  mimeType: string;
  name: string;
  size: number;
  visibility?: DocumentVisibility;
}
