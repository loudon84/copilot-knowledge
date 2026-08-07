import { Link } from "@tanstack/react-router";
import {
  Database,
  FileText,
  Layers,
  MessageSquare,
  Upload,
} from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { MockLoading } from "@/components/common/mock-loading";
import { PageHeader } from "@/components/common/page-header";
import { DocumentStatusBadge } from "@/components/knowledge/document-status-badge";
import { KnowledgeSetCard } from "@/components/knowledge/knowledge-set-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDocuments } from "@/features/documents/api/use-documents";
import { useKnowledgeBases } from "@/features/knowledge-bases/api/use-knowledge-bases";
import { useDashboard } from "@/features/knowledge-home/api/use-dashboard";
import { useKnowledgeSets } from "@/features/knowledge-sets/api/use-knowledge-sets";

export function KnowledgeHomePage() {
  const dashboardQuery = useDashboard();
  const setsQuery = useKnowledgeSets();
  const docsQuery = useDocuments();
  const basesQuery = useKnowledgeBases();

  if (
    dashboardQuery.isLoading ||
    setsQuery.isLoading ||
    docsQuery.isLoading ||
    basesQuery.isLoading
  ) {
    return <MockLoading />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <EmptyState
        description="无法获取工作台数据，请稍后重试"
        title="加载失败"
      />
    );
  }

  const dashboard = dashboardQuery.data;
  const sets = setsQuery.data ?? [];
  const docs = docsQuery.data ?? [];
  const bases = basesQuery.data ?? [];

  const recentSets = dashboard.recentKnowledgeSetIds
    .map((id) => sets.find((s) => s.id === id))
    .filter(Boolean);
  const recentDocs = dashboard.recentDocumentIds
    .map((id) => docs.find((d) => d.id === id))
    .filter(Boolean);

  const stats = [
    {
      label: "知识库",
      value: dashboard.stats.knowledgeBaseCount,
      icon: Database,
      to: "/knowledge-bases",
    },
    {
      label: "知识集",
      value: dashboard.stats.knowledgeSetCount,
      icon: Layers,
      to: "/knowledge-sets",
    },
    {
      label: "文档",
      value: dashboard.stats.documentCount,
      icon: FileText,
      to: "/documents",
    },
    {
      label: "本周查询",
      value: dashboard.stats.weeklyQueryCount,
      icon: MessageSquare,
      to: "/chat",
    },
  ] as const;

  const parse = dashboard.parseStatusSummary;

  return (
    <div className="space-y-6">
      <PageHeader description="企业知识资产总览与常用入口" title="知识工作台">
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link search={{ knowledgeBaseId: undefined }} to="/uploads">
              <Upload className="mr-1.5 h-4 w-4" />
              上传文件
            </Link>
          </Button>
          <Button asChild>
            <Link to="/chat">
              <MessageSquare className="mr-1.5 h-4 w-4" />
              开始问答
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to}>
            <Card className="shadow-none transition-colors hover:bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-2xl tabular-nums">
                  {stat.value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">最近使用知识集</h3>
        {recentSets.length === 0 ? (
          <EmptyState description="前往知识集开始使用" title="暂无最近知识集" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentSets.map(
              (ks) =>
                ks && (
                  <KnowledgeSetCard
                    key={ks.id}
                    knowledgeBases={bases}
                    knowledgeSet={ks}
                  />
                )
            )}
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">最近更新文档</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentDocs.length === 0 ? (
              <EmptyState title="暂无文档" />
            ) : (
              recentDocs.map(
                (doc) =>
                  doc && (
                    <Link
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/40"
                      key={doc.id}
                      params={{ documentId: doc.id }}
                      to="/documents/$documentId"
                    >
                      <span className="truncate font-medium">{doc.name}</span>
                      <DocumentStatusBadge status={doc.parseStatus} />
                    </Link>
                  )
              )
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">上传和解析状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "解析完成", value: parse.completed },
                { label: "处理中", value: parse.parsing },
                { label: "解析失败", value: parse.failed },
                { label: "待处理", value: parse.pending },
              ].map((item) => (
                <div
                  className="rounded-md border px-3 py-4 text-center"
                  key={item.label}
                >
                  <p className="font-semibold text-2xl tabular-nums">
                    {item.value}
                  </p>
                  <p className="text-muted-foreground text-xs">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
