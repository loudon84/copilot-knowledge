import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Plus, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/empty-state";
import { MockLoading } from "@/components/common/mock-loading";
import { PageHeader } from "@/components/common/page-header";
import { CitationCard } from "@/components/knowledge/citation-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  useChatMessages,
  useChatSessions,
  useSendMessage,
} from "@/features/knowledge-chat/api/use-chat";
import { NewSessionDialog } from "@/features/knowledge-chat/components/new-session-dialog";
import { useChatDemoStore } from "@/stores/chat-demo-store";
import { usePreferenceStore } from "@/stores/preference-store";
import type { KnowledgeCitation } from "@/types/knowledge-chat";
import { cn } from "@/utils/tailwind";

export function KnowledgeChatPage() {
  const params = useParams({ strict: false }) as { sessionId?: string };
  const sessionId = params.sessionId;
  const navigate = useNavigate();
  const sessionsQuery = useChatSessions();
  const messagesQuery = useChatMessages(sessionId ?? "");
  const sendMutation = useSendMessage(sessionId ?? "");
  const showCitationPanel = usePreferenceStore((s) => s.showCitationPanel);
  const isRetrieving = useChatDemoStore((s) => s.isRetrieving);
  const isGenerating = useChatDemoStore((s) => s.isGenerating);
  const streamingSessionId = useChatDemoStore((s) => s.streamingSessionId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [input, setInput] = useState("");
  const [activeCitations, setActiveCitations] = useState<KnowledgeCitation[]>(
    []
  );

  const sessions = sessionsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const activeSession = sessions.find((s) => s.id === sessionId);

  useEffect(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant" && m.citations?.length);
    setActiveCitations(lastAssistant?.citations ?? []);
  }, [messages]);

  const busy =
    sendMutation.isPending ||
    (streamingSessionId === sessionId && (isRetrieving || isGenerating));

  const statusText = useMemo(() => {
    if (!sessionId) {
      return "";
    }
    if (streamingSessionId !== sessionId) {
      return "";
    }
    if (isRetrieving) {
      return "正在检索知识库…";
    }
    if (isGenerating) {
      return "正在生成回答…";
    }
    return "";
  }, [sessionId, streamingSessionId, isRetrieving, isGenerating]);

  async function handleSend() {
    if (!sessionId) {
      setDialogOpen(true);
      return;
    }
    const content = input.trim();
    if (!content) {
      return;
    }
    setInput("");
    try {
      const result = await sendMutation.mutateAsync({ content });
      setActiveCitations(result.citations);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "发送失败");
    }
  }

  if (sessionsQuery.isLoading) {
    return <MockLoading />;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-3">
      <PageHeader description="基于知识集的 Mock 检索与回答" title="知识问答">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          新建会话
        </Button>
      </PageHeader>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[220px_1fr_280px]">
        <div className="flex min-h-0 flex-col rounded-md border">
          <div className="border-b px-3 py-2 font-medium text-sm">会话列表</div>
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {sessions.length === 0 ? (
                <EmptyState description="点击新建开始" title="暂无会话" />
              ) : (
                sessions.map((session) => (
                  <button
                    className={cn(
                      "w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted/60",
                      session.id === sessionId && "bg-muted"
                    )}
                    key={session.id}
                    onClick={() =>
                      void navigate({
                        to: "/chat/$sessionId",
                        params: { sessionId: session.id },
                      })
                    }
                    type="button"
                  >
                    <p className="line-clamp-1 font-medium">{session.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {session.knowledgeSetName ?? session.knowledgeSetId}
                    </p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex min-h-0 flex-col rounded-md border">
          <div className="border-b px-3 py-2 text-sm">
            {activeSession ? (
              <span className="font-medium">{activeSession.title}</span>
            ) : (
              <span className="text-muted-foreground">请选择或新建会话</span>
            )}
          </div>
          <ScrollArea className="flex-1 p-3">
            {sessionId ? (
              messagesQuery.isLoading ? (
                <MockLoading />
              ) : messages.length === 0 ? (
                <EmptyState
                  description="输入问题以检索知识集"
                  title="开始提问"
                />
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                        message.role === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                      key={message.id}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      {message.citations && message.citations.length > 0 && (
                        <button
                          className="mt-2 text-xs underline opacity-80"
                          onClick={() =>
                            setActiveCitations(message.citations ?? [])
                          }
                          type="button"
                        >
                          查看 {message.citations.length} 条引用
                        </button>
                      )}
                    </div>
                  ))}
                  {statusText && (
                    <p className="text-muted-foreground text-xs">
                      {statusText}
                    </p>
                  )}
                </div>
              )
            ) : (
              <EmptyState
                description="从左侧选择会话，或新建一个问答会话"
                title="未选择会话"
              />
            )}
          </ScrollArea>
          <div className="flex gap-2 border-t p-3">
            <Textarea
              disabled={!sessionId || busy}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={sessionId ? "输入问题…" : "请先新建或选择会话"}
              rows={2}
              value={input}
            />
            <Button
              className="self-end"
              disabled={!sessionId || busy || !input.trim()}
              onClick={() => void handleSend()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-md border">
          <div className="border-b px-3 py-2 font-medium text-sm">引用来源</div>
          <ScrollArea className="flex-1 p-2">
            {showCitationPanel ? (
              activeCitations.length === 0 ? (
                <EmptyState
                  description="回答生成后将显示来源"
                  title="暂无引用"
                />
              ) : (
                <div className="space-y-2">
                  {activeCitations.map((citation) => (
                    <CitationCard citation={citation} key={citation.id} />
                  ))}
                </div>
              )
            ) : (
              <EmptyState
                description="可在外观设置中开启"
                title="引用面板已关闭"
              />
            )}
          </ScrollArea>
          {sessionId && (
            <div className="border-t p-2 text-muted-foreground text-xs">
              <Link className="underline" to="/knowledge-sets">
                管理知识集
              </Link>
            </div>
          )}
        </div>
      </div>

      <NewSessionDialog onOpenChange={setDialogOpen} open={dialogOpen} />
    </div>
  );
}
