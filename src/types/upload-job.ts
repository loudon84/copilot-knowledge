export type UploadStatus =
  | "waiting"
  | "uploading"
  | "parsing"
  | "completed"
  | "failed"
  | "cancelled";

export interface UploadJob {
  createdAt: string;
  documentId?: string;
  errorMessage?: string;
  extension: string;
  fileName: string;
  forceFail?: boolean;
  id: string;
  knowledgeBaseId: string;
  mimeType: string;
  progress: number;
  size: number;
  status: UploadStatus;
  updatedAt: string;
}
