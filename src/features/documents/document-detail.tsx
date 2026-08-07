import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/empty-state";
import { MockLoading } from "@/components/common/mock-loading";
import { PageHeader } from "@/components/common/page-header";
import { DocumentStatusBadge } from "@/components/knowledge/document-status-badge";
import { PermissionBadge } from "@/components/knowledge/permission-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateDocumentVersion,
  useDocument,
} from "@/features/documents/api/use-documents";

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentDetailPage() {
  const { documentId } = useParams({ from: "/documents/$documentId" });
  const { data, isLoading, isError } = useDocument(documentId);
  const versionMutation = useCreateDocumentVersion();

  if (isLoading) {
    return <MockLoading />;
  }
  if (isError || !data) {
    return <EmptyState description="请返回文档中心重试" title="文档不存在" />;
  }

  const document = data;

  async function uploadNewVersion() {
    try {
      await versionMutation.mutateAsync({
        documentId,
        file: {
          name: document.name.replace(
            /(\.[^.]+)?$/,
            `_v${document.currentVersion + 1}$1`
          ),
          extension: document.extension,
          size: document.size + 1024,
          mimeType: document.mimeType,
          knowledgeBaseId: document.knowledgeBaseId,
        },
      });
      toast.success("已上传新版本（Mock）");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传失败");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        description={document.knowledgeBaseName}
        title={document.name}
      >
        <Button
          disabled={versionMutation.isPending}
          onClick={uploadNewVersion}
          variant="outline"
        >
          更新版本
        </Button>
      </PageHeader>

      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">文件预览</TabsTrigger>
          <TabsTrigger value="info">文档信息</TabsTrigger>
          <TabsTrigger value="versions">版本记录</TabsTrigger>
          <TabsTrigger value="parse">解析信息</TabsTrigger>
          <TabsTrigger value="permissions">访问权限</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">
                预览 · {document.preview.type.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-sm leading-relaxed">
                {document.preview.content}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card className="shadow-none">
            <CardContent className="grid gap-3 pt-6 text-sm sm:grid-cols-2">
              <Info label="文档名称" value={document.name} />
              <Info
                label="所属知识库"
                value={document.knowledgeBaseName ?? document.knowledgeBaseId}
              />
              <Info label="类型" value={document.extension.toUpperCase()} />
              <Info label="大小" value={formatSize(document.size)} />
              <Info label="当前版本" value={`v${document.currentVersion}`} />
              <Info
                label="解析状态"
                value={<DocumentStatusBadge status={document.parseStatus} />}
              />
              <Info label="分块数" value={String(document.chunkCount)} />
              <Info
                label="页数"
                value={
                  document.pageCount == null ? "—" : String(document.pageCount)
                }
              />
              <Info label="更新人" value={document.updatedBy.displayName} />
              <Info
                label="更新时间"
                value={new Date(document.updatedAt).toLocaleString("zh-CN")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-2" value="versions">
          {document.versions.length === 0 ? (
            <EmptyState title="暂无版本" />
          ) : (
            document.versions.map((version) => (
              <div
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                key={version.id}
              >
                <div>
                  <p className="font-medium">
                    v{version.version}{" "}
                    <span className="text-muted-foreground">
                      · {version.fileName}
                    </span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {version.uploadedBy.displayName} ·{" "}
                    {new Date(version.createdAt).toLocaleString("zh-CN")} ·{" "}
                    {formatSize(version.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DocumentStatusBadge status={version.parseStatus} />
                  <span className="text-muted-foreground text-xs">
                    {version.status === "current"
                      ? "当前版本"
                      : version.status === "replaced"
                        ? "已替换"
                        : "已归档"}
                  </span>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="parse">
          <Card className="shadow-none">
            <CardContent className="grid gap-3 pt-6 text-sm sm:grid-cols-2">
              <Info
                label="解析状态"
                value={
                  <DocumentStatusBadge
                    status={document.parseInfo.parseStatus}
                  />
                }
              />
              <Info
                label="Chunk 数"
                value={String(document.parseInfo.chunkCount)}
              />
              <Info
                label="页数"
                value={
                  document.parseInfo.pageCount == null
                    ? "—"
                    : String(document.parseInfo.pageCount)
                }
              />
              <Info
                label="字数"
                value={
                  document.parseInfo.wordCount == null
                    ? "—"
                    : String(document.parseInfo.wordCount)
                }
              />
              <Info
                label="解析策略"
                value={document.parseInfo.parserStrategy ?? "—"}
              />
              <Info
                label="解析耗时"
                value={
                  document.parseInfo.durationMs == null
                    ? "—"
                    : `${document.parseInfo.durationMs} ms`
                }
              />
              <Info
                label="最近错误"
                value={document.parseInfo.lastError || "无"}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-2" value="permissions">
          {document.permissions.length === 0 ? (
            <EmptyState title="暂无权限记录" />
          ) : (
            document.permissions.map((perm) => (
              <div
                className="flex items-center justify-between rounded-md border px-3 py-2"
                key={perm.id}
              >
                <div>
                  <p className="font-medium text-sm">{perm.user.displayName}</p>
                  <p className="text-muted-foreground text-xs">
                    {perm.user.email}
                  </p>
                </div>
                <PermissionBadge role={perm.role} />
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
