import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { knowledgeService } from "@/services/knowledge/knowledge-service";
import { knowledgeQueryKeys } from "@/services/knowledge/query-keys";
import type {
  CreateKnowledgeSetInput,
  UpdateKnowledgeSetInput,
} from "@/types/knowledge-set";

export function useKnowledgeSets() {
  return useQuery({
    queryKey: knowledgeQueryKeys.knowledgeSets.list(),
    queryFn: () => knowledgeService.listKnowledgeSets(),
  });
}

export function useKnowledgeSet(id: string) {
  return useQuery({
    queryKey: knowledgeQueryKeys.knowledgeSets.detail(id),
    queryFn: () => knowledgeService.getKnowledgeSet(id),
    enabled: Boolean(id),
  });
}

export function useCreateKnowledgeSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateKnowledgeSetInput) =>
      knowledgeService.createKnowledgeSet(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.knowledgeSets.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.dashboard(),
      });
    },
  });
}

export function useUpdateKnowledgeSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateKnowledgeSetInput;
    }) => knowledgeService.updateKnowledgeSet(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.knowledgeSets.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.knowledgeSets.detail(variables.id),
      });
    },
  });
}

export function useBindKnowledgeBases() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      knowledgeSetId,
      knowledgeBaseIds,
    }: {
      knowledgeSetId: string;
      knowledgeBaseIds: string[];
    }) => knowledgeService.bindKnowledgeBases(knowledgeSetId, knowledgeBaseIds),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.knowledgeSets.detail(
          variables.knowledgeSetId
        ),
      });
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.knowledgeSets.list(),
      });
    },
  });
}
