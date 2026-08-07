import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateChatSession } from "@/features/knowledge-chat/api/use-chat";
import { useKnowledgeSets } from "@/features/knowledge-sets/api/use-knowledge-sets";
import { usePreferenceStore } from "@/stores/preference-store";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultKnowledgeSetId?: string;
};

export function NewSessionDialog({
  open,
  onOpenChange,
  defaultKnowledgeSetId,
}: Props) {
  const navigate = useNavigate();
  const setsQuery = useKnowledgeSets();
  const createMutation = useCreateChatSession();
  const prefDefault = usePreferenceStore((s) => s.defaultKnowledgeSetId);
  const showCitationDefault = usePreferenceStore((s) => s.showCitationPanel);

  const [knowledgeSetId, setKnowledgeSetId] = useState(
    defaultKnowledgeSetId || prefDefault || ""
  );
  const [answerMode, setAnswerMode] = useState<"concise" | "detailed">(
    "detailed"
  );
  const [showCitations, setShowCitations] = useState(showCitationDefault);

  async function handleCreate() {
    if (!knowledgeSetId) {
      toast.error("请选择知识集");
      return;
    }
    try {
      const session = await createMutation.mutateAsync({
        knowledgeSetId,
        answerMode,
        showCitations,
      });
      toast.success("会话已创建");
      onOpenChange(false);
      void navigate({
        to: "/chat/$sessionId",
        params: { sessionId: session.id },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "创建失败");
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新建会话</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>选择知识集</Label>
            <Select onValueChange={setKnowledgeSetId} value={knowledgeSetId}>
              <SelectTrigger>
                <SelectValue placeholder="请选择知识集" />
              </SelectTrigger>
              <SelectContent>
                {(setsQuery.data ?? []).map((ks) => (
                  <SelectItem key={ks.id} value={ks.id}>
                    {ks.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>回答模式</Label>
            <Select
              onValueChange={(v) => setAnswerMode(v as "concise" | "detailed")}
              value={answerMode}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">简洁</SelectItem>
                <SelectItem value="detailed">详细</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={showCitations}
              id="show-citations"
              onCheckedChange={(v) => setShowCitations(Boolean(v))}
            />
            <Label htmlFor="show-citations">显示引用来源</Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            取消
          </Button>
          <Button disabled={createMutation.isPending} onClick={handleCreate}>
            创建并开始
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
