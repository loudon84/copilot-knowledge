import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeBaseListPage } from "@/features/knowledge-bases/knowledge-base-list";

export const Route = createFileRoute("/knowledge-bases/")({
  component: KnowledgeBaseListPage,
});
