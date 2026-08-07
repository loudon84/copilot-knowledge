import { create } from "zustand";
import { persist } from "zustand/middleware";

import dashboardFixture from "@/mock/knowledge/dashboard.json";
import documentVersionsFixture from "@/mock/knowledge/document-versions.json";
import documentsFixture from "@/mock/knowledge/documents.json";
import knowledgeBasesFixture from "@/mock/knowledge/knowledge-bases.json";
import knowledgeSetsFixture from "@/mock/knowledge/knowledge-sets.json";
import permissionsFixture from "@/mock/knowledge/permissions.json";
import type {
  KnowledgeBase,
  KnowledgeDashboard,
  KnowledgeDashboardParseStatus,
} from "@/types/knowledge-base";
import type {
  DocumentVersion,
  KnowledgeDocument,
} from "@/types/knowledge-document";
import type { KnowledgeSet } from "@/types/knowledge-set";
import type { PermissionRecord } from "@/types/permission";

function cloneFixtures() {
  return {
    knowledgeBases: structuredClone(
      knowledgeBasesFixture
    ) as unknown as KnowledgeBase[],
    knowledgeSets: structuredClone(
      knowledgeSetsFixture
    ) as unknown as KnowledgeSet[],
    documents: structuredClone(
      documentsFixture
    ) as unknown as KnowledgeDocument[],
    documentVersions: structuredClone(
      documentVersionsFixture
    ) as unknown as DocumentVersion[],
    permissions: structuredClone(
      permissionsFixture
    ) as unknown as PermissionRecord[],
    dashboard: structuredClone(
      dashboardFixture
    ) as unknown as KnowledgeDashboard,
  };
}

function computeParseStatus(
  documents: KnowledgeDocument[]
): KnowledgeDashboardParseStatus {
  return {
    completed: documents.filter((d) => d.parseStatus === "completed").length,
    parsing: documents.filter((d) => d.parseStatus === "parsing").length,
    failed: documents.filter((d) => d.parseStatus === "failed").length,
    pending: documents.filter((d) => d.parseStatus === "pending").length,
  };
}

function recomputeDashboard(
  state: Pick<
    MockKnowledgeState,
    "knowledgeBases" | "knowledgeSets" | "documents" | "dashboard"
  >
): KnowledgeDashboard {
  const recentDocumentIds = [...state.documents]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 6)
    .map((d) => d.id);

  const recentKnowledgeSetIds = [...state.knowledgeSets]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 4)
    .map((s) => s.id);

  return {
    ...state.dashboard,
    stats: {
      ...state.dashboard.stats,
      knowledgeBaseCount: state.knowledgeBases.length,
      knowledgeSetCount: state.knowledgeSets.length,
      documentCount: state.documents.length,
    },
    recentDocumentIds,
    recentKnowledgeSetIds,
    parseStatusSummary: computeParseStatus(state.documents),
  };
}

function syncKnowledgeBaseCounts(
  knowledgeBases: KnowledgeBase[],
  documents: KnowledgeDocument[]
): KnowledgeBase[] {
  return knowledgeBases.map((kb) => {
    const docs = documents.filter((d) => d.knowledgeBaseId === kb.id);
    return {
      ...kb,
      documentCount: docs.length,
      chunkCount: docs.reduce((sum, d) => sum + d.chunkCount, 0),
    };
  });
}

function syncKnowledgeSetDocumentCounts(
  knowledgeSets: KnowledgeSet[],
  documents: KnowledgeDocument[]
): KnowledgeSet[] {
  return knowledgeSets.map((ks) => ({
    ...ks,
    documentCount: documents.filter((d) =>
      ks.knowledgeBaseIds.includes(d.knowledgeBaseId)
    ).length,
  }));
}

export interface MockKnowledgeState {
  dashboard: KnowledgeDashboard;
  documents: KnowledgeDocument[];
  documentVersions: DocumentVersion[];
  hydrated: boolean;
  knowledgeBases: KnowledgeBase[];
  knowledgeSets: KnowledgeSet[];
  permissions: PermissionRecord[];
  refreshDerived: () => void;
  removeDocument: (id: string) => void;
  removeKnowledgeBase: (id: string) => void;
  removeKnowledgeSet: (id: string) => void;

  resetToDefaults: () => void;
  setDocuments: (items: KnowledgeDocument[]) => void;
  setKnowledgeBases: (items: KnowledgeBase[]) => void;
  setKnowledgeSets: (items: KnowledgeSet[]) => void;
  setPermissions: (items: PermissionRecord[]) => void;
  upsertDocument: (doc: KnowledgeDocument, version?: DocumentVersion) => void;
  upsertDocumentVersion: (version: DocumentVersion) => void;
  upsertKnowledgeBase: (item: KnowledgeBase) => void;
  upsertKnowledgeSet: (item: KnowledgeSet) => void;
}

const initial = cloneFixtures();

export const useMockKnowledgeStore = create<MockKnowledgeState>()(
  persist(
    (set, get) => ({
      ...initial,
      hydrated: false,

      resetToDefaults: () => {
        const next = cloneFixtures();
        set({ ...next, hydrated: true });
      },

      setKnowledgeBases: (items) => {
        set((state) => {
          const knowledgeBases = items;
          const dashboard = recomputeDashboard({
            ...state,
            knowledgeBases,
          });
          return { knowledgeBases, dashboard };
        });
      },

      upsertKnowledgeBase: (item) => {
        set((state) => {
          const idx = state.knowledgeBases.findIndex((k) => k.id === item.id);
          const knowledgeBases =
            idx >= 0
              ? state.knowledgeBases.map((k) => (k.id === item.id ? item : k))
              : [...state.knowledgeBases, item];
          return {
            knowledgeBases,
            dashboard: recomputeDashboard({ ...state, knowledgeBases }),
          };
        });
      },

      removeKnowledgeBase: (id) => {
        set((state) => {
          const knowledgeBases = state.knowledgeBases.filter(
            (k) => k.id !== id
          );
          const documents = state.documents.filter(
            (d) => d.knowledgeBaseId !== id
          );
          const documentIds = new Set(documents.map((d) => d.id));
          const documentVersions = state.documentVersions.filter((v) =>
            documentIds.has(v.documentId)
          );
          const knowledgeSets = syncKnowledgeSetDocumentCounts(
            state.knowledgeSets.map((ks) => {
              const knowledgeBaseIds = ks.knowledgeBaseIds.filter(
                (kbId) => kbId !== id
              );
              const { [id]: _removed, ...weights } = ks.weights;
              return { ...ks, knowledgeBaseIds, weights };
            }),
            documents
          );
          const permissions = state.permissions.filter(
            (p) => !(p.resourceType === "knowledge_base" && p.resourceId === id)
          );
          const next = {
            ...state,
            knowledgeBases,
            documents,
            documentVersions,
            knowledgeSets,
            permissions,
          };
          return {
            knowledgeBases,
            documents,
            documentVersions,
            knowledgeSets,
            permissions,
            dashboard: recomputeDashboard(next),
          };
        });
      },

      setKnowledgeSets: (items) => {
        set((state) => ({
          knowledgeSets: items,
          dashboard: recomputeDashboard({ ...state, knowledgeSets: items }),
        }));
      },

      upsertKnowledgeSet: (item) => {
        set((state) => {
          const idx = state.knowledgeSets.findIndex((k) => k.id === item.id);
          const knowledgeSets =
            idx >= 0
              ? state.knowledgeSets.map((k) => (k.id === item.id ? item : k))
              : [...state.knowledgeSets, item];
          return {
            knowledgeSets,
            dashboard: recomputeDashboard({ ...state, knowledgeSets }),
          };
        });
      },

      removeKnowledgeSet: (id) => {
        set((state) => {
          const knowledgeSets = state.knowledgeSets.filter((k) => k.id !== id);
          const permissions = state.permissions.filter(
            (p) => !(p.resourceType === "knowledge_set" && p.resourceId === id)
          );
          return {
            knowledgeSets,
            permissions,
            dashboard: recomputeDashboard({ ...state, knowledgeSets }),
          };
        });
      },

      setDocuments: (items) => {
        set((state) => {
          const documents = items;
          const knowledgeBases = syncKnowledgeBaseCounts(
            state.knowledgeBases,
            documents
          );
          const knowledgeSets = syncKnowledgeSetDocumentCounts(
            state.knowledgeSets,
            documents
          );
          const next = { ...state, documents, knowledgeBases, knowledgeSets };
          return {
            documents,
            knowledgeBases,
            knowledgeSets,
            dashboard: recomputeDashboard(next),
          };
        });
      },

      upsertDocument: (doc, version) => {
        set((state) => {
          const idx = state.documents.findIndex((d) => d.id === doc.id);
          const documents =
            idx >= 0
              ? state.documents.map((d) => (d.id === doc.id ? doc : d))
              : [...state.documents, doc];
          const documentVersions = version
            ? (() => {
                const existing = state.documentVersions.findIndex(
                  (v) => v.id === version.id
                );
                return existing >= 0
                  ? state.documentVersions.map((v) =>
                      v.id === version.id ? version : v
                    )
                  : [...state.documentVersions, version];
              })()
            : state.documentVersions;
          const knowledgeBases = syncKnowledgeBaseCounts(
            state.knowledgeBases,
            documents
          );
          const knowledgeSets = syncKnowledgeSetDocumentCounts(
            state.knowledgeSets,
            documents
          );
          const next = {
            ...state,
            documents,
            documentVersions,
            knowledgeBases,
            knowledgeSets,
          };
          return {
            documents,
            documentVersions,
            knowledgeBases,
            knowledgeSets,
            dashboard: recomputeDashboard(next),
          };
        });
      },

      removeDocument: (id) => {
        set((state) => {
          const documents = state.documents.filter((d) => d.id !== id);
          const documentVersions = state.documentVersions.filter(
            (v) => v.documentId !== id
          );
          const permissions = state.permissions.filter(
            (p) => !(p.resourceType === "document" && p.resourceId === id)
          );
          const knowledgeBases = syncKnowledgeBaseCounts(
            state.knowledgeBases,
            documents
          );
          const knowledgeSets = syncKnowledgeSetDocumentCounts(
            state.knowledgeSets,
            documents
          );
          const next = {
            ...state,
            documents,
            documentVersions,
            knowledgeBases,
            knowledgeSets,
            permissions,
          };
          return {
            documents,
            documentVersions,
            knowledgeBases,
            knowledgeSets,
            permissions,
            dashboard: recomputeDashboard(next),
          };
        });
      },

      upsertDocumentVersion: (version) => {
        set((state) => {
          const idx = state.documentVersions.findIndex(
            (v) => v.id === version.id
          );
          const documentVersions =
            idx >= 0
              ? state.documentVersions.map((v) =>
                  v.id === version.id ? version : v
                )
              : [...state.documentVersions, version];
          return { documentVersions };
        });
      },

      setPermissions: (items) => set({ permissions: items }),

      refreshDerived: () => {
        const state = get();
        const knowledgeBases = syncKnowledgeBaseCounts(
          state.knowledgeBases,
          state.documents
        );
        const knowledgeSets = syncKnowledgeSetDocumentCounts(
          state.knowledgeSets,
          state.documents
        );
        set({
          knowledgeBases,
          knowledgeSets,
          dashboard: recomputeDashboard({
            ...state,
            knowledgeBases,
            knowledgeSets,
          }),
        });
      },
    }),
    {
      name: "copilot-knowledge-mock-store",
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }
        if (
          state.knowledgeBases?.length &&
          state.documents?.length &&
          state.knowledgeSets?.length
        ) {
          state.hydrated = true;
        } else {
          state.resetToDefaults();
        }
      },
      partialize: (state) => ({
        knowledgeBases: state.knowledgeBases,
        knowledgeSets: state.knowledgeSets,
        documents: state.documents,
        documentVersions: state.documentVersions,
        permissions: state.permissions,
        dashboard: state.dashboard,
      }),
    }
  )
);
