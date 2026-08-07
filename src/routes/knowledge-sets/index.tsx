import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeSetListPage } from "@/features/knowledge-sets/knowledge-set-list";

export const Route = createFileRoute("/knowledge-sets/")({
  component: KnowledgeSetListPage,
});
