import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeHomePage } from "@/features/knowledge-home";

export const Route = createFileRoute("/home")({
  component: KnowledgeHomePage,
});
