import { useQuery } from "@tanstack/react-query";
import { knowledgeService } from "@/services/knowledge/knowledge-service";
import { knowledgeQueryKeys } from "@/services/knowledge/query-keys";

export function useDashboard() {
  return useQuery({
    queryKey: knowledgeQueryKeys.dashboard(),
    queryFn: () => knowledgeService.getDashboard(),
  });
}
