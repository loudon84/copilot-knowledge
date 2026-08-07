import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { FilterBar } from "@/components/common/filter-bar";
import { MockLoading } from "@/components/common/mock-loading";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { KnowledgeSetCard } from "@/components/knowledge/knowledge-set-card";
import { Button } from "@/components/ui/button";
import { useKnowledgeBases } from "@/features/knowledge-bases/api/use-knowledge-bases";
import { useKnowledgeSets } from "@/features/knowledge-sets/api/use-knowledge-sets";
import { CreateKnowledgeSetDialog } from "@/features/knowledge-sets/components/create-knowledge-set-dialog";
import type { KnowledgeSet } from "@/types/knowledge-set";

export function KnowledgeSetListPage() {
  const { data, isLoading, isError } = useKnowledgeSets();
  const basesQuery = useKnowledgeBases();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeSet | null>(null);

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!search.trim()) {
      return list;
    }
    const q = search.trim().toLowerCase();
    return list.filter(
      (ks) =>
        ks.name.toLowerCase().includes(q) ||
        ks.description.toLowerCase().includes(q)
    );
  }, [data, search]);

  if (isLoading || basesQuery.isLoading) {
    return <MockLoading />;
  }
  if (isError) {
    return <EmptyState description="无法获取知识集列表" title="加载失败" />;
  }

  return (
    <div className="space-y-4">
      <PageHeader description="管理多个知识库组成的检索集合" title="知识集">
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          创建知识集
        </Button>
      </PageHeader>

      <FilterBar>
        <SearchInput
          className="w-56"
          onChange={setSearch}
          placeholder="搜索知识集"
          value={search}
        />
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState description="创建知识集以组织检索范围" title="暂无知识集" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((ks) => (
            <KnowledgeSetCard
              key={ks.id}
              knowledgeBases={basesQuery.data ?? []}
              knowledgeSet={ks}
              onEdit={(item) => {
                setEditing(item);
                setDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {dialogOpen && (
        <KnowledgeSetDialogHost
          editing={editing}
          onOpenChange={setDialogOpen}
          open={dialogOpen}
        />
      )}
    </div>
  );
}

function KnowledgeSetDialogHost({
  open,
  editing,
  onOpenChange,
}: {
  open: boolean;
  editing: KnowledgeSet | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey((k) => k + 1);
  }, [editing?.id, open]);
  return (
    <CreateKnowledgeSetDialog
      editing={editing}
      key={key}
      onOpenChange={onOpenChange}
      open={open}
    />
  );
}
