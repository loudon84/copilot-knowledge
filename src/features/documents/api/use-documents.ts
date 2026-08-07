import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { knowledgeService } from "@/services/knowledge/knowledge-service";
import { knowledgeQueryKeys } from "@/services/knowledge/query-keys";
import type {
  DocumentFilter,
  MockUploadFile,
} from "@/types/knowledge-document";

export function useDocuments(filter?: DocumentFilter) {
  return useQuery({
    queryKey: knowledgeQueryKeys.documents.list(
      filter as Record<string, unknown>
    ),
    queryFn: () => knowledgeService.listDocuments(filter),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: knowledgeQueryKeys.documents.detail(id),
    queryFn: () => knowledgeService.getDocument(id),
    enabled: Boolean(id),
  });
}

export function useCreateDocumentVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentId,
      file,
    }: {
      documentId: string;
      file: MockUploadFile;
    }) => knowledgeService.createDocumentVersion(documentId, file),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.documents.detail(variables.documentId),
      });
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.documents.all(),
      });
    },
  });
}
