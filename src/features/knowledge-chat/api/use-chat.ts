import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { knowledgeService } from "@/services/knowledge/knowledge-service";
import { knowledgeQueryKeys } from "@/services/knowledge/query-keys";
import type {
  CreateChatSessionInput,
  SendMessageInput,
} from "@/types/knowledge-chat";

export function useChatSessions() {
  return useQuery({
    queryKey: knowledgeQueryKeys.chat.sessions(),
    queryFn: () => knowledgeService.listChatSessions(),
  });
}

export function useChatMessages(sessionId: string) {
  return useQuery({
    queryKey: knowledgeQueryKeys.chat.messages(sessionId),
    queryFn: () => knowledgeService.getChatMessages(sessionId),
    enabled: Boolean(sessionId),
  });
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChatSessionInput) =>
      knowledgeService.createChatSession(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.chat.sessions(),
      });
    },
  });
}

export function useSendMessage(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendMessageInput) =>
      knowledgeService.sendMessage(sessionId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.chat.messages(sessionId),
      });
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.chat.sessions(),
      });
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.dashboard(),
      });
    },
  });
}
