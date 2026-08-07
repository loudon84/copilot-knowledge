import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeChatPage } from "@/features/knowledge-chat/knowledge-chat-page";

export const Route = createFileRoute("/chat/$sessionId")({
  component: KnowledgeChatPage,
});
