import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useChatDemoStore } from "@/stores/chat-demo-store";
import { useMockKnowledgeStore } from "@/stores/mock-knowledge-store";
import { useUploadJobStore } from "@/stores/upload-job-store";
import type { ThemeMode } from "@/types/theme-mode";

export type AvatarDisplayMode = "initials" | "image" | "hidden";

export interface PreferenceState {
  avatarDisplay: AvatarDisplayMode;
  defaultKnowledgeSetId?: string;
  language: string;
  mockDelayMs: number;
  resetDemoData: () => void;
  setAvatarDisplay: (mode: AvatarDisplayMode) => void;
  setDefaultKnowledgeSetId: (id?: string) => void;
  setLanguage: (language: string) => void;

  setMockDelayMs: (ms: number) => void;
  setShowCitationPanel: (show: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  showCitationPanel: boolean;
  theme: ThemeMode;
}

function clampDelay(ms: number): number {
  if (Number.isNaN(ms)) {
    return 300;
  }
  return Math.min(2000, Math.max(0, Math.round(ms)));
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      mockDelayMs: 300,
      avatarDisplay: "initials",
      language: "zh-CN",
      theme: "system",
      defaultKnowledgeSetId: "ks_001",
      showCitationPanel: true,

      setMockDelayMs: (ms) => set({ mockDelayMs: clampDelay(ms) }),
      setAvatarDisplay: (mode) => set({ avatarDisplay: mode }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setDefaultKnowledgeSetId: (id) => set({ defaultKnowledgeSetId: id }),
      setShowCitationPanel: (show) => set({ showCitationPanel: show }),

      resetDemoData: () => {
        useMockKnowledgeStore.getState().resetToDefaults();
        useUploadJobStore.getState().resetToDefaults();
        useChatDemoStore.getState().resetToDefaults();
      },
    }),
    {
      name: "copilot-knowledge-preferences",
      partialize: (state) => ({
        mockDelayMs: state.mockDelayMs,
        avatarDisplay: state.avatarDisplay,
        language: state.language,
        theme: state.theme,
        defaultKnowledgeSetId: state.defaultKnowledgeSetId,
        showCitationPanel: state.showCitationPanel,
      }),
    }
  )
);
