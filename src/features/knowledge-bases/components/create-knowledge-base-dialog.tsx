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
  useCreateKnowledgeBase,
  useUpdateKnowledgeBase,
} from "@/features/knowledge-bases/api/use-knowledge-bases";
import type {
  CreateKnowledgeBaseInput,
  KnowledgeBase,
  VisibilityScope,
} from "@/types/knowledge-base";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: KnowledgeBase | null;
};

const defaultForm: CreateKnowledgeBaseInput = {
  name: "",
  description: "",
  icon: "📚",
  tags: [],
  visibility: "organization",
  parserStrategy: "general",
  embeddingModel: "bge-m3",
  chunkSize: 512,
};

export function CreateKnowledgeBaseDialog({
  open,
  onOpenChange,
  editing,
}: Props) {
  const createMutation = useCreateKnowledgeBase();
  const updateMutation = useUpdateKnowledgeBase();
  const [form, setForm] = useState<CreateKnowledgeBaseInput>(() =>
    editing
      ? {
          name: editing.name,
          description: editing.description,
          icon: editing.icon,
          tags: editing.tags,
          visibility: editing.visibility,
          parserStrategy: editing.parserStrategy,
          embeddingModel: editing.embeddingModel,
          chunkSize: editing.chunkSize,
        }
      : defaultForm
  );
  const [tagsText, setTagsText] = useState(editing?.tags.join(", ") ?? "");

  const isEdit = Boolean(editing);
  const pending = createMutation.isPending || updateMutation.isPending;

  function resetAndClose(next: boolean) {
    if (!next) {
      setForm(defaultForm);
      setTagsText("");
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("请输入知识库名称");
      return;
    }
    const payload: CreateKnowledgeBaseInput = {
      ...form,
      name: form.name.trim(),
      tags: tagsText
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (isEdit && editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: payload });
        toast.success("知识库已更新");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("知识库已创建");
      }
      resetAndClose(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    }
  }

  return (
    <Dialog onOpenChange={resetAndClose} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑知识库" : "创建知识库"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="kb-name">知识库名称</Label>
            <Input
              id="kb-name"
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="例如：销售产品知识库"
              value={form.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kb-desc">知识库描述</Label>
            <Textarea
              id="kb-desc"
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="简要说明用途与范围"
              rows={3}
              value={form.description}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="kb-icon">图标</Label>
              <Input
                id="kb-icon"
                onChange={(e) =>
                  setForm((f) => ({ ...f, icon: e.target.value }))
                }
                value={form.icon ?? ""}
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="kb-tags">标签（逗号分隔）</Label>
            <Input
              id="kb-tags"
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="销售, 产品"
              value={tagsText}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>解析策略</Label>
              <Select
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, parserStrategy: v }))
                }
                value={form.parserStrategy ?? "general"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">通用</SelectItem>
                  <SelectItem value="manual">手册</SelectItem>
                  <SelectItem value="table">表格优先</SelectItem>
                  <SelectItem value="qa">问答对</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Embedding 模型</Label>
              <Select
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, embeddingModel: v }))
                }
                value={form.embeddingModel ?? "bge-m3"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bge-m3">bge-m3</SelectItem>
                  <SelectItem value="text-embedding-3-small">
                    text-embedding-3-small
                  </SelectItem>
                  <SelectItem value="text-embedding-3-large">
                    text-embedding-3-large
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kb-chunk">Chunk 大小</Label>
            <Input
              id="kb-chunk"
              max={2048}
              min={128}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  chunkSize: Number(e.target.value) || 512,
                }))
              }
              type="number"
              value={form.chunkSize ?? 512}
            />
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
