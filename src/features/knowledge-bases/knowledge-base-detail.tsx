import { Link, useParams } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/empty-state";
import { FilterBar } from "@/components/common/filter-bar";
import { MockLoading } from "@/components/common/mock-loading";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { DocumentTable } from "@/components/knowledge/document-table";
import { PermissionBadge } from "@/components/knowledge/permission-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useDocuments } from "@/features/documents/api/use-documents";
import {
  useKnowledgeBase,
  useUpdateKnowledgeBase,
} from "@/features/knowledge-bases/api/use-knowledge-bases";
import type { VisibilityScope } from "@/types/knowledge-base";
import type { ParseStatus } from "@/types/knowledge-document";

export function KnowledgeBaseDetailPage() {
  const { knowledgeBaseId } = useParams({
    from: "/knowledge-bases/$knowledgeBaseId",
  });
  const { data, isLoading, isError } = useKnowledgeBase(knowledgeBaseId);
  const updateMutation = useUpdateKnowledgeBase();
  const [search, setSearch] = useState("");
  const [parseStatus, setParseStatus] = useState<string>("all");
  const [extension, setExtension] = useState<string>("all");
  const [visibility, setVisibility] = useState<VisibilityScope>("organization");

  useEffect(() => {
    if (data?.visibility) {
      setVisibility(data.visibility);
    }
  }, [data?.visibility]);

  const docsQuery = useDocuments({
    knowledgeBaseId,
    search: search || undefined,
    parseStatus:
      parseStatus === "all" ? undefined : (parseStatus as ParseStatus),
    extension: extension === "all" ? undefined : extension,
  });

  if (isLoading) {
    return <MockLoading />;
  }
  if (isError || !data) {
    return <EmptyState description="请返回列表重试" title="知识库不存在" />;
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await updateMutation.mutateAsync({
        id: knowledgeBaseId,
        input: {
          name: String(form.get("name") ?? ""),
          description: String(form.get("description") ?? ""),
          parserStrategy: String(form.get("parserStrategy") ?? ""),
          embeddingModel: String(form.get("embeddingModel") ?? ""),
          chunkSize: Number(form.get("chunkSize") ?? 512),
          visibility,
          tags: String(form.get("tags") ?? "")
            .split(/[,，]/)
            .map((t) => t.trim())
            .filter(Boolean),
        },
      });
      toast.success("设置已保存");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        description={data.description || "知识库详情"}
        title={data.name}
      >
        <Button asChild variant="outline">
          <Link search={{ knowledgeBaseId }} to="/uploads">
            <Upload className="mr-1.5 h-4 w-4" />
            上传文件
          </Link>
        </Button>
      </PageHeader>

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">文档</TabsTrigger>
          <TabsTrigger value="settings">基本设置</TabsTrigger>
          <TabsTrigger value="members">成员与权限</TabsTrigger>
          <TabsTrigger value="runtime">运行信息</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-3" value="documents">
          <FilterBar>
            <SearchInput
              className="w-56"
              onChange={setSearch}
              placeholder="搜索文档"
              value={search}
            />
            <Select onValueChange={setParseStatus} value={parseStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="解析状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="parsing">解析中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setExtension} value={extension}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="xlsx">XLSX</SelectItem>
                <SelectItem value="md">MD</SelectItem>
                <SelectItem value="txt">TXT</SelectItem>
              </SelectContent>
            </Select>
          </FilterBar>
          {docsQuery.isLoading ? (
            <MockLoading />
          ) : (
            <DocumentTable documents={docsQuery.data ?? []} />
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">基本设置</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="max-w-xl space-y-4" onSubmit={saveSettings}>
                <div className="space-y-2">
                  <Label htmlFor="name">知识库名称</Label>
                  <Input defaultValue={data.name} id="name" name="name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    defaultValue={data.description}
                    id="description"
                    name="description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">标签</Label>
                  <Input
                    defaultValue={data.tags.join(", ")}
                    id="tags"
                    name="tags"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="embeddingModel">Embedding 模型</Label>
                    <Input
                      defaultValue={data.embeddingModel}
                      id="embeddingModel"
                      name="embeddingModel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parserStrategy">解析策略</Label>
                    <Input
                      defaultValue={data.parserStrategy}
                      id="parserStrategy"
                      name="parserStrategy"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="chunkSize">Chunk 大小</Label>
                    <Input
                      defaultValue={data.chunkSize ?? 512}
                      id="chunkSize"
                      name="chunkSize"
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visibility">可见范围</Label>
                    <Select
                      onValueChange={(v) => setVisibility(v as VisibilityScope)}
                      value={visibility}
                    >
                      <SelectTrigger id="visibility">
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
                <p className="text-muted-foreground text-xs">
                  创建人：{data.owner.displayName} · 创建于{" "}
                  {new Date(data.createdAt).toLocaleString("zh-CN")} · 更新于{" "}
                  {new Date(data.updatedAt).toLocaleString("zh-CN")}
                </p>
                <Button disabled={updateMutation.isPending} type="submit">
                  保存设置
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">成员与权限</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.members.length === 0 ? (
                <EmptyState title="暂无成员" />
              ) : (
                data.members.map((member) => (
                  <div
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                    key={member.id}
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {member.user.displayName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {member.user.email}
                      </p>
                    </div>
                    <PermissionBadge role={member.role} />
                  </div>
                ))
              )}
              <p className="pt-2 text-muted-foreground text-xs">
                Demo 阶段仅展示 Mock 成员，添加/修改角色为模拟能力。
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runtime">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">运行信息</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                label="RAGFlow Dataset ID"
                value={data.runtimeInfo.ragflowDatasetId}
              />
              <InfoItem label="文档数" value={String(data.documentCount)} />
              <InfoItem label="Chunk 数" value={String(data.chunkCount)} />
              <InfoItem
                label="解析成功率"
                value={`${(data.runtimeInfo.parseSuccessRate * 100).toFixed(1)}%`}
              />
              <InfoItem
                label="最后同步时间"
                value={
                  data.runtimeInfo.lastSyncAt
                    ? new Date(data.runtimeInfo.lastSyncAt).toLocaleString(
                        "zh-CN"
                      )
                    : "—"
                }
              />
              <InfoItem
                label="最近错误"
                value={data.runtimeInfo.lastError || "无"}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border px-3 py-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 break-all font-medium text-sm">{value}</p>
    </div>
  );
}
