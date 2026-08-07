import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateKnowledgeSet,
  useUpdateKnowledgeSet,
} from "@/features/knowledge-sets/api/use-knowledge-sets";
import type { VisibilityScope } from "@/types/knowledge-base";
import type {
  CreateKnowledgeSetInput,
  KnowledgeSet,
} from "@/types/knowledge-set";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: KnowledgeSet | null;
};

const defaultForm: CreateKnowledgeSetInput = {
  name: "",
  description: "",
  visibility: "organization",
};

export function CreateKnowledgeSetDialog({
  open,
  onOpenChange,
  editing,
}: Props) {
  const createMutation = useCreateKnowledgeSet();
  const updateMutation = useUpdateKnowledgeSet();
  const [form, setForm] = useState<CreateKnowledgeSetInput>(() =>
    editing
      ? {
          name: editing.name,
          description: editing.description,
          visibility: editing.visibility,
          knowledgeBaseIds: editing.knowledgeBaseIds,
          weights: editing.weights,
          retrievalConfig: editing.retrievalConfig,
        }
      : defaultForm
  );

  const isEdit = Boolean(editing);
  const pending = createMutation.isPending || updateMutation.isPending;

  function resetAndClose(next: boolean) {
    if (!next) {
      setForm(defaultForm);
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("请输入知识集名称");
      return;
    }
    try {
      if (isEdit && editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          input: {
            name: form.name.trim(),
            description: form.description,
            visibility: form.visibility,
          },
        });
        toast.success("知识集已更新");
      } else {
        await createMutation.mutateAsync({
          ...form,
          name: form.name.trim(),
        });
        toast.success("知识集已创建");
      }
      resetAndClose(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    }
  }

  return (
    <Dialog onOpenChange={resetAndClose} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑知识集" : "创建知识集"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="ks-name">知识集名称</Label>
            <Input
              id="ks-name"
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="例如：销售工作知识集"
              value={form.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ks-desc">描述</Label>
            <Textarea
              id="ks-desc"
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              value={form.description}
            />
          </div>
          <div className="space-y-2">
            <Label>可见范围</Label>
            <Select
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  visibility: v as VisibilityScope,
                }))
              }
              value={form.visibility ?? "organization"}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">私有</SelectItem>
                <SelectItem value="department">部门可见</SelectItem>
                <SelectItem value="organization">组织可见</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              onClick={() => resetAndClose(false)}
              type="button"
              variant="outline"
            >
              取消
            </Button>
            <Button disabled={pending} type="submit">
              {pending ? "保存中..." : isEdit ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
