import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { knowledgeService } from "@/services/knowledge/knowledge-service";
import { knowledgeQueryKeys } from "@/services/knowledge/query-keys";
import type { MockUploadFile } from "@/types/knowledge-document";
import type { UploadStatus } from "@/types/upload-job";

const ACTIVE_STATUSES: UploadStatus[] = ["waiting", "uploading", "parsing"];

export function useUploadJobs() {
  const query = useQuery({
    queryKey: knowledgeQueryKeys.uploadJobs.list(),
    queryFn: () => knowledgeService.listUploadJobs(),
    refetchInterval: (q) => {
      const jobs = q.state.data ?? [];
      const hasActive = jobs.some((job) =>
        ACTIVE_STATUSES.includes(job.status)
      );
      return hasActive ? 1000 : false;
    },
  });

  return query;
}

export function useCreateUploadJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: MockUploadFile[]) =>
      knowledgeService.createUploadJobs(files),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.uploadJobs.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.documents.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: knowledgeQueryKeys.dashboard(),
      });
    },
  });
}
