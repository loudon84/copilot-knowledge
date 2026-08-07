import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { knowledgeService } from "@/services/knowledge/knowledge-service";
import { knowledgeQueryKeys } from "@/services/knowledge/query-keys";
import type {
  CreateKnowledgeBaseInput,
  UpdateKnowledgeBaseInput,
} from "@/types/knowledge-base";

export function useKnowledgeBases() {
  return useQuery({
    queryKey: knowledgeQueryKeys.knowledgeBases.list(),
    queryFn: () => knowledgeService.listKnowledgeBases(),
  });
}

export function useKnowledgeBase(id: string) {
  return useQuery({
    queryKey: knowledgeQueryKeys.knowledgeBases.detail(id),
    queryFn: () => knowledgeService.getKnowledgeBase(id),
    enabled: Boolean(id),
  });
}

export function useCreateKnowledgeBase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateKnowledgeBaseInput) =>
      knowledgeService.createKnowledgeBase(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.knowledgeBases.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.dashboard(),
      });
    },
  });
}

export function useUpdateKnowledgeBase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateKnowledgeBaseInput;
    }) => knowledgeService.updateKnowledgeBase(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.knowledgeBases.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.knowledgeBases.detail(variables.id),
      });
    },
  });
}

export function useDeleteKnowledgeBase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => knowledgeService.deleteKnowledgeBase(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.knowledgeBases.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.dashboard(),
      });
    },
  });
}
