import type { UserSummary } from "./user-summary";

export type PermissionRole = "Owner" | "Manager" | "Editor" | "Viewer";

export interface PermissionRecord {
  createdAt: string;
  id: string;
  resourceId: string;
  resourceType: "knowledge_base" | "document" | "knowledge_set";
  role: PermissionRole;
  user: UserSummary;
}
