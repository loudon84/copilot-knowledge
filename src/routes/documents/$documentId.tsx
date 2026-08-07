import { createFileRoute } from "@tanstack/react-router";
import { DocumentDetailPage } from "@/features/documents/document-detail";

export const Route = createFileRoute("/documents/$documentId")({
  component: DocumentDetailPage,
});
