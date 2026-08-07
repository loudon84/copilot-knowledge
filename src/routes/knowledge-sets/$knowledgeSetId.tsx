import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeSetDetailPage } from "@/features/knowledge-sets/knowledge-set-detail";

export const Route = createFileRoute("/knowledge-sets/$knowledgeSetId")({
  component: KnowledgeSetDetailPage,
});
