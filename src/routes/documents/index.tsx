import { createFileRoute } from "@tanstack/react-router";
import type { DocumentsSearch } from "@/features/documents/documents-list";
import { DocumentsListPage } from "@/features/documents/documents-list";
import type {
  DocumentVisibility,
  ParseStatus,
} from "@/types/knowledge-document";

function parseDocumentsSearch(
  search: Record<string, unknown>
): DocumentsSearch {
  const parseStatus = search.parseStatus;
  const visibility = search.visibility;
  return {
    knowledgeBaseId:
      typeof search.knowledgeBaseId === "string"
        ? search.knowledgeBaseId
        : undefined,
    parseStatus:
      parseStatus === "pending" ||
      parseStatus === "parsing" ||
      parseStatus === "completed" ||
      parseStatus === "failed"
        ? (parseStatus as ParseStatus)
        : undefined,
    extension:
      typeof search.extension === "string" ? search.extension : undefined,
    visibility:
      visibility === "private" ||
      visibility === "department" ||
      visibility === "organization" ||
      visibility === "custom"
        ? (visibility as DocumentVisibility)
        : undefined,
    search: typeof search.search === "string" ? search.search : undefined,
  };
}

export const Route = createFileRoute("/documents/")({
  validateSearch: parseDocumentsSearch,
  component: DocumentsListPage,
});
