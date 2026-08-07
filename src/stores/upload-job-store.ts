import { create } from "zustand";
import { persist } from "zustand/middleware";

import uploadJobsFixture from "@/mock/knowledge/upload-jobs.json";
import { useMockKnowledgeStore } from "@/stores/mock-knowledge-store";
import type {
  DocumentVersion,
  KnowledgeDocument,
} from "@/types/knowledge-document";
import type { UploadJob, UploadStatus } from "@/types/upload-job";
import type { UserSummary } from "@/types/user-summary";

const DEMO_USER: UserSummary = {
  id: "user_001",
  displayName: "张三",
  email: "zhangsan@example.com",
};

const timers = new Map<string, ReturnType<typeof setInterval>>();

function cloneJobs(): UploadJob[] {
  return structuredClone(uploadJobsFixture) as UploadJob[];
}

function shouldForceFail(job: UploadJob): boolean {
  return Boolean(job.forceFail) || job.fileName.toLowerCase().includes("fail");
}

function createDocumentFromJob(job: UploadJob): {
  document: KnowledgeDocument;
  version: DocumentVersion;
} {
  const now = new Date().toISOString();
  const documentId = `doc_${Date.now().toString(36)}`;
  const versionId = `ver_${Date.now().toString(36)}`;
  const document: KnowledgeDocument = {
    id: documentId,
    knowledgeBaseId: job.knowledgeBaseId,
    name: job.fileName,
    extension: job.extension,
    mimeType: job.mimeType,
    size: job.size,
    currentVersion: 1,
    parseStatus: "completed",
    visibility: "organization",
    chunkCount: Math.max(8, Math.round(job.size / 50_000)),
    pageCount: job.extension === "pdf" ? 6 : undefined,
    updatedBy: DEMO_USER,
    createdAt: now,
    updatedAt: now,
  };
  const version: DocumentVersion = {
    id: versionId,
    documentId,
    version: 1,
    fileName: job.fileName,
    size: job.size,
    mimeType: job.mimeType,
    status: "current",
    parseStatus: "completed",
    uploadedBy: DEMO_USER,
    createdAt: now,
  };
  return { document, version };
}

export interface UploadJobState {
  addJobs: (jobs: UploadJob[]) => void;
  cancel: (jobId: string) => void;
  clearCompleted: () => void;
  jobs: UploadJob[];
  resetToDefaults: () => void;
  retry: (jobId: string) => void;
  startSimulation: (jobId: string) => void;
  stopAllSimulations: () => void;
  updateJob: (id: string, patch: Partial<UploadJob>) => void;
}

function stopTimer(jobId: string) {
  const timer = timers.get(jobId);
  if (timer) {
    clearInterval(timer);
    timers.delete(jobId);
  }
}

export const useUploadJobStore = create<UploadJobState>()(
  persist(
    (set, get) => ({
      jobs: cloneJobs(),

      resetToDefaults: () => {
        get().stopAllSimulations();
        set({ jobs: cloneJobs() });
      },

      addJobs: (jobs) => {
        set((state) => ({ jobs: [...jobs, ...state.jobs] }));
      },

      updateJob: (id, patch) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id
              ? { ...job, ...patch, updatedAt: new Date().toISOString() }
              : job
          ),
        }));
      },

      startSimulation: (jobId) => {
        stopTimer(jobId);
        const current = get().jobs.find((j) => j.id === jobId);
        if (!current) {
          return;
        }
        if (current.status === "completed" || current.status === "cancelled") {
          return;
        }

        get().updateJob(jobId, {
          status: "uploading",
          progress: Math.min(current.progress, 5),
          errorMessage: undefined,
        });

        const timer = setInterval(() => {
          const job = get().jobs.find((j) => j.id === jobId);
          if (!job) {
            stopTimer(jobId);
            return;
          }
          if (job.status === "cancelled") {
            stopTimer(jobId);
            return;
          }

          let status: UploadStatus = job.status;
          let progress = job.progress;

          if (status === "waiting") {
            status = "uploading";
            progress = 5;
          } else if (status === "uploading") {
            progress = Math.min(100, progress + 12);
            if (progress >= 100) {
              if (shouldForceFail(job)) {
                stopTimer(jobId);
                get().updateJob(jobId, {
                  status: "failed",
                  progress: 100,
                  errorMessage:
                    "解析失败：文件名包含 fail（Mock 固定失败案例）",
                });
                return;
              }
              status = "parsing";
              progress = 5;
            }
          } else if (status === "parsing") {
            progress = Math.min(100, progress + 15);
            if (progress >= 100) {
              stopTimer(jobId);
              const { document, version } = createDocumentFromJob(job);
              useMockKnowledgeStore
                .getState()
                .upsertDocument(document, version);
              get().updateJob(jobId, {
                status: "completed",
                progress: 100,
                documentId: document.id,
                errorMessage: undefined,
              });
              return;
            }
          } else if (status === "failed") {
            stopTimer(jobId);
            return;
          }

          get().updateJob(jobId, { status, progress });
        }, 500);

        timers.set(jobId, timer);
      },

      cancel: (jobId) => {
        stopTimer(jobId);
        get().updateJob(jobId, { status: "cancelled" });
      },

      retry: (jobId) => {
        const job = get().jobs.find((j) => j.id === jobId);
        if (!job) {
          return;
        }
        get().updateJob(jobId, {
          status: "waiting",
          progress: 0,
          errorMessage: undefined,
          documentId: undefined,
        });
        get().startSimulation(jobId);
      },

      clearCompleted: () => {
        set((state) => ({
          jobs: state.jobs.filter(
            (job) => job.status !== "completed" && job.status !== "cancelled"
          ),
        }));
      },

      stopAllSimulations: () => {
        for (const jobId of timers.keys()) {
          stopTimer(jobId);
        }
      },
    }),
    {
      name: "copilot-knowledge-upload-jobs",
      partialize: (state) => ({ jobs: state.jobs }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }
        if (!state.jobs?.length) {
          state.resetToDefaults();
        }
      },
    }
  )
);
