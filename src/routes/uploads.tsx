import { createFileRoute } from "@tanstack/react-router";
import { UploadsPage } from "@/features/uploads/uploads-page";

export const Route = createFileRoute("/uploads")({
  validateSearch: (search: Record<string, unknown>) => ({
    knowledgeBaseId:
      typeof search.knowledgeBaseId === "string"
        ? search.knowledgeBaseId
        : undefined,
  }),
  component: UploadsPage,
});
