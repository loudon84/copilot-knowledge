import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeBaseDetailPage } from "@/features/knowledge-bases/knowledge-base-detail";

export const Route = createFileRoute("/knowledge-bases/$knowledgeBaseId")({
  component: KnowledgeBaseDetailPage,
});
