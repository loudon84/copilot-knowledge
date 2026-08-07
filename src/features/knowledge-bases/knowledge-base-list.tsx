import { Link } from "@tanstack/react-router";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { FilterBar } from "@/components/common/filter-bar";
import { MockLoading } from "@/components/common/mock-loading";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { KnowledgeBaseCard } from "@/components/knowledge/knowledge-base-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteKnowledgeBase,
  useKnowledgeBases,
} from "@/features/knowledge-bases/api/use-knowledge-bases";
import { CreateKnowledgeBaseDialog } from "@/features/knowledge-bases/components/create-knowledge-base-dialog";
import type {
  KnowledgeBase,
  KnowledgeBaseStatus,
  VisibilityScope,
} from "@/types/knowledge-base";

const STATUS_LABEL: Record<KnowledgeBaseStatus, string> = {
  active: "启用",
  disabled: "停用",
  syncing: "同步中",
  error: "异常",
};

const VISIBILITY_LABEL: Record<VisibilityScope, string> = {
  private: "私有",
  department: "部门可见",
  organization: "组织可见",
};

export function KnowledgeBaseListPage() {
  const { data, isLoading, isError } = useKnowledgeBases();
  const deleteMutation = useDeleteKnowledgeBase();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [visibility, setVisibility] = useState<string>("all");
  const [view, setView] = useState<"card" | "list">("card");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeBase | null>(null);
  const [deleting, setDeleting] = useState<KnowledgeBase | null>(null);

  const filtered = useMemo(() => {
    const list = data ?? [];
    return list.filter((kb) => {
      if (status !== "all" && kb.status !== status) {
        return false;
      }
      if (visibility !== "all" && kb.visibility !== visibility) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !(
            kb.name.toLowerCase().includes(q) ||
            kb.description.toLowerCase().includes(q) ||
            kb.tags.some((t) => t.toLowerCase().includes(q))
          )
        ) {
          return false;
        }
      }
      return true;
    });
  }, [data, search, status, visibility]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(kb: KnowledgeBase) {
    setEditing(kb);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleting.id);
      toast.success("知识库已删除");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  }

  if (isLoading) {
    return <MockLoading />;
  }
  if (isError) {
    return <EmptyState description="无法获取知识库列表" title="加载失败" />;
  }

  return (
    <div className="space-y-4">
      <PageHeader description="管理企业不同业务领域的知识资料" title="知识库">
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          创建知识库
        </Button>
      </PageHeader>

      <FilterBar>
        <SearchInput
          className="w-56"
          onChange={setSearch}
          placeholder="搜索知识库"
          value={search}
        />
        <Select onValueChange={setStatus} value={status}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="active">启用</SelectItem>
            <SelectItem value="disabled">停用</SelectItem>
            <SelectItem value="syncing">同步中</SelectItem>
            <SelectItem value="error">异常</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setVisibility} value={visibility}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="可见范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部范围</SelectItem>
            <SelectItem value="private">私有</SelectItem>
            <SelectItem value="department">部门可见</SelectItem>
            <SelectItem value="organization">组织可见</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-1">
          <Button
            onClick={() => setView("card")}
            size="icon"
            variant={view === "card" ? "secondary" : "ghost"}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setView("list")}
            size="icon"
            variant={view === "list" ? "secondary" : "ghost"}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState
          description="尝试调整筛选条件或创建新知识库"
          title="暂无知识库"
        />
      ) : view === "card" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((kb) => (
            <KnowledgeBaseCard
              key={kb.id}
              knowledgeBase={kb}
              onDelete={setDeleting}
              onEdit={openEdit}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>文档</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>可见范围</TableHead>
                <TableHead>所有者</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((kb) => (
                <TableRow key={kb.id}>
                  <TableCell className="font-medium">{kb.name}</TableCell>
                  <TableCell>{kb.documentCount}</TableCell>
                  <TableCell>{STATUS_LABEL[kb.status]}</TableCell>
                  <TableCell>{VISIBILITY_LABEL[kb.visibility]}</TableCell>
                  <TableCell>{kb.owner.displayName}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link
                        params={{ knowledgeBaseId: kb.id }}
                        to="/knowledge-bases/$knowledgeBaseId"
                      >
                        进入
                      </Link>
                    </Button>
                    <Button
                      onClick={() => openEdit(kb)}
                      size="sm"
                      variant="ghost"
                    >
                      编辑
                    </Button>
                    <Button
                      className="text-destructive"
                      onClick={() => setDeleting(kb)}
                      size="sm"
                      variant="ghost"
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {dialogOpen && (
        <KnowledgeBaseDialogHost
          editing={editing}
          onOpenChange={setDialogOpen}
          open={dialogOpen}
        />
      )}

      <ConfirmDialog
        confirmLabel="删除"
        description={`确定删除「${deleting?.name ?? ""}」？此操作不可撤销。`}
        onConfirm={confirmDelete}
        onOpenChange={(open) => !open && setDeleting(null)}
        open={Boolean(deleting)}
        title="删除知识库"
      />
    </div>
  );
}

/** Remount dialog when editing target changes so form resets. */
function KnowledgeBaseDialogHost({
  open,
  editing,
  onOpenChange,
}: {
  open: boolean;
  editing: KnowledgeBase | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey((k) => k + 1);
  }, [editing?.id, open]);
  return (
    <CreateKnowledgeBaseDialog
      editing={editing}
      key={key}
      onOpenChange={onOpenChange}
      open={open}
    />
  );
}
