import { useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/empty-state";
import { FilterBar } from "@/components/common/filter-bar";
import { MockLoading } from "@/components/common/mock-loading";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKnowledgeBases } from "@/features/knowledge-bases/api/use-knowledge-bases";
import {
  useBindKnowledgeBases,
  useKnowledgeSet,
  useUpdateKnowledgeSet,
} from "@/features/knowledge-sets/api/use-knowledge-sets";
import type { RetrievalConfig } from "@/types/knowledge-set";

export function KnowledgeSetDetailPage() {
  const { knowledgeSetId } = useParams({
    from: "/knowledge-sets/$knowledgeSetId",
  });
  const { data, isLoading, isError } = useKnowledgeSet(knowledgeSetId);
  const basesQuery = useKnowledgeBases();
  const bindMutation = useBindKnowledgeBases();
  const updateMutation = useUpdateKnowledgeSet();

  const [kbSearch, setKbSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [weights, setWeights] = useState<Record<string, number> | null>(null);
  const [retrieval, setRetrieval] = useState<RetrievalConfig | null>(null);

  const boundIds = selectedIds ?? data?.knowledgeBaseIds ?? [];
  const currentWeights = weights ?? data?.weights ?? {};
  const currentRetrieval = retrieval ?? data?.retrievalConfig;

  const availableBases = useMemo(() => {
    const list = basesQuery.data ?? [];
    if (!kbSearch.trim()) {
      return list;
    }
    const q = kbSearch.trim().toLowerCase();
    return list.filter(
      (kb) =>
        kb.name.toLowerCase().includes(q) ||
        kb.description.toLowerCase().includes(q)
    );
  }, [basesQuery.data, kbSearch]);

  if (isLoading || basesQuery.isLoading) {
    return <MockLoading />;
  }
  if (isError || !data || !currentRetrieval) {
    return <EmptyState description="请返回列表重试" title="知识集不存在" />;
  }

  function toggleBase(id: string, checked: boolean) {
    const next = checked
      ? [...boundIds, id]
      : boundIds.filter((item) => item !== id);
    setSelectedIds(next);
    if (checked && currentWeights[id] == null) {
      setWeights({ ...currentWeights, [id]: 1 });
    }
  }

  async function saveBinding() {
    try {
      await bindMutation.mutateAsync({
        knowledgeSetId,
        knowledgeBaseIds: boundIds,
      });
      await updateMutation.mutateAsync({
        id: knowledgeSetId,
        input: { weights: currentWeights },
      });
      toast.success("知识库绑定已保存");
      setSelectedIds(null);
      setWeights(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    }
  }

  async function saveRetrieval(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: knowledgeSetId,
        input: { retrievalConfig: currentRetrieval },
      });
      toast.success("检索配置已保存");
      setRetrieval(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        description={data.description || "知识集详情"}
        title={data.name}
      />

      <Tabs defaultValue="binding">
        <TabsList>
          <TabsTrigger value="info">基本信息</TabsTrigger>
          <TabsTrigger value="binding">绑定知识库</TabsTrigger>
          <TabsTrigger value="retrieval">检索配置</TabsTrigger>
          <TabsTrigger value="usage">使用记录</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">名称</p>
                <p className="font-medium">{data.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">可见范围</p>
                <p className="font-medium">{data.visibility}</p>
              </div>
              <div>
                <p className="text-muted-foreground">绑定知识库数</p>
                <p className="font-medium">{data.knowledgeBaseIds.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">文档总量</p>
                <p className="font-medium">{data.documentCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">创建人</p>
                <p className="font-medium">{data.createdBy.displayName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">更新时间</p>
                <p className="font-medium">
                  {new Date(data.updatedAt).toLocaleString("zh-CN")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-3" value="binding">
          <FilterBar>
            <SearchInput
              className="w-64"
              onChange={setKbSearch}
              placeholder="搜索可选知识库"
              value={kbSearch}
            />
            <Button
              className="ml-auto"
              disabled={bindMutation.isPending || updateMutation.isPending}
              onClick={saveBinding}
            >
              保存绑定
            </Button>
          </FilterBar>
          <div className="space-y-2">
            {availableBases.map((kb) => {
              const checked = boundIds.includes(kb.id);
              return (
                <div
                  className="flex flex-wrap items-center gap-3 rounded-md border px-3 py-2"
                  key={kb.id}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => toggleBase(kb.id, Boolean(v))}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{kb.name}</p>
                    <p className="truncate text-muted-foreground text-xs">
                      {kb.documentCount} 个文档 · {kb.description}
                    </p>
                  </div>
                  {checked && (
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground text-xs">
                        权重
                      </Label>
                      <Input
                        className="h-8 w-20"
                        max={10}
                        min={0}
                        onChange={(e) =>
                          setWeights({
                            ...currentWeights,
                            [kb.id]: Number(e.target.value) || 0,
                          })
                        }
                        step={0.1}
                        type="number"
                        value={currentWeights[kb.id] ?? 1}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="retrieval">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">检索配置</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="max-w-xl space-y-4" onSubmit={saveRetrieval}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Top K</Label>
                    <Input
                      onChange={(e) =>
                        setRetrieval({
                          ...currentRetrieval,
                          topK: Number(e.target.value) || 1,
                        })
                      }
                      type="number"
                      value={currentRetrieval.topK}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>相似度阈值</Label>
                    <Input
                      max={1}
                      min={0}
                      onChange={(e) =>
                        setRetrieval({
                          ...currentRetrieval,
                          similarityThreshold: Number(e.target.value) || 0,
                        })
                      }
                      step={0.01}
                      type="number"
                      value={currentRetrieval.similarityThreshold}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>关键词权重</Label>
                    <Input
                      onChange={(e) =>
                        setRetrieval({
                          ...currentRetrieval,
                          keywordWeight: Number(e.target.value) || 0,
                        })
                      }
                      step={0.05}
                      type="number"
                      value={currentRetrieval.keywordWeight}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>向量权重</Label>
                    <Input
                      onChange={(e) =>
                        setRetrieval({
                          ...currentRetrieval,
                          vectorWeight: Number(e.target.value) || 0,
                        })
                      }
                      step={0.05}
                      type="number"
                      value={currentRetrieval.vectorWeight}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>回答模型</Label>
                  <Input
                    onChange={(e) =>
                      setRetrieval({
                        ...currentRetrieval,
                        answerModel: e.target.value,
                      })
                    }
                    value={currentRetrieval.answerModel}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={currentRetrieval.enableRerank}
                    onCheckedChange={(checked) =>
                      setRetrieval({
                        ...currentRetrieval,
                        enableRerank: checked,
                      })
                    }
                  />
                  <Label>启用重排</Label>
                </div>
                <Button disabled={updateMutation.isPending} type="submit">
                  保存检索配置
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">使用记录</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>使用次数：{data.usageCount ?? 0}</p>
              <p>
                最近使用：
                {data.lastUsedAt
                  ? new Date(data.lastUsedAt).toLocaleString("zh-CN")
                  : "暂无"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
