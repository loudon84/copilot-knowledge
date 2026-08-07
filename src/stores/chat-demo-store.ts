import { create } from "zustand";
import { persist } from "zustand/middleware";
import chatMessagesFixture from "@/mock/knowledge/chat-messages.json";
import chatSessionsFixture from "@/mock/knowledge/chat-sessions.json";
import type { ChatMessage, ChatSession } from "@/types/knowledge-chat";

function cloneSessions(): ChatSession[] {
  return structuredClone(chatSessionsFixture) as ChatSession[];
}

function cloneMessages(): ChatMessage[] {
  return structuredClone(chatMessagesFixture) as ChatMessage[];
}

function groupMessages(messages: ChatMessage[]): Record<string, ChatMessage[]> {
  return messages.reduce<Record<string, ChatMessage[]>>((acc, message) => {
    const list = acc[message.sessionId] ?? [];
    list.push(message);
    acc[message.sessionId] = list;
    return acc;
  }, {});
}

export interface ChatDemoState {
  appendMessage: (message: ChatMessage) => void;
  clearStreamingState: () => void;
  isGenerating: boolean;
  isRetrieving: boolean;
  messagesBySessionId: Record<string, ChatMessage[]>;
  removeSession: (sessionId: string) => void;

  resetToDefaults: () => void;
  sessions: ChatSession[];
  setGenerating: (value: boolean) => void;
  setMessages: (sessionId: string, messages: ChatMessage[]) => void;
  setRetrieving: (value: boolean) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setStreamingSessionId: (sessionId?: string) => void;
  streamingSessionId?: string;
  upsertSession: (session: ChatSession) => void;
}

const initialMessages = groupMessages(cloneMessages());

export const useChatDemoStore = create<ChatDemoState>()(
  persist(
    (set) => ({
      sessions: cloneSessions(),
      messagesBySessionId: initialMessages,
      streamingSessionId: undefined,
      isRetrieving: false,
      isGenerating: false,

      resetToDefaults: () => {
        set({
          sessions: cloneSessions(),
          messagesBySessionId: groupMessages(cloneMessages()),
          streamingSessionId: undefined,
          isRetrieving: false,
          isGenerating: false,
        });
      },

      setSessions: (sessions) => set({ sessions }),

      upsertSession: (session) => {
        set((state) => {
          const idx = state.sessions.findIndex((s) => s.id === session.id);
          const sessions =
            idx >= 0
              ? state.sessions.map((s) => (s.id === session.id ? session : s))
              : [session, ...state.sessions];
          return { sessions };
        });
      },

      removeSession: (sessionId) => {
        set((state) => {
          const { [sessionId]: _removed, ...rest } = state.messagesBySessionId;
          return {
            sessions: state.sessions.filter((s) => s.id !== sessionId),
            messagesBySessionId: rest,
          };
        });
      },

      setMessages: (sessionId, messages) => {
        set((state) => ({
          messagesBySessionId: {
            ...state.messagesBySessionId,
            [sessionId]: messages,
          },
        }));
      },

      appendMessage: (message) => {
        set((state) => {
          const existing = state.messagesBySessionId[message.sessionId] ?? [];
          return {
            messagesBySessionId: {
              ...state.messagesBySessionId,
              [message.sessionId]: [...existing, message],
            },
          };
        });
      },

      setStreamingSessionId: (sessionId) =>
        set({ streamingSessionId: sessionId }),

      setRetrieving: (value) => set({ isRetrieving: value }),

      setGenerating: (value) => set({ isGenerating: value }),

      clearStreamingState: () =>
        set({
          streamingSessionId: undefined,
          isRetrieving: false,
          isGenerating: false,
        }),
    }),
    {
      name: "copilot-knowledge-chat-demo",
      partialize: (state) => ({
        sessions: state.sessions,
        messagesBySessionId: state.messagesBySessionId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }
        if (!state.sessions?.length) {
          state.resetToDefaults();
        }
      },
    }
  )
);
