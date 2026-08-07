import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { FilterBar } from "@/components/common/filter-bar";
import { MockLoading } from "@/components/common/mock-loading";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { DocumentTable } from "@/components/knowledge/document-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDocuments } from "@/features/documents/api/use-documents";
import { useKnowledgeBases } from "@/features/knowledge-bases/api/use-knowledge-bases";
import type {
  DocumentVisibility,
  ParseStatus,
} from "@/types/knowledge-document";

export type DocumentsSearch = {
  knowledgeBaseId?: string;
  parseStatus?: ParseStatus;
  extension?: string;
  visibility?: DocumentVisibility;
  search?: string;
};

export function DocumentsListPage() {
  const navigate = useNavigate({ from: "/documents/" });
  const searchParams = useSearch({ from: "/documents/" }) as DocumentsSearch;
  const basesQuery = useKnowledgeBases();

  const filter = {
    knowledgeBaseId: searchParams.knowledgeBaseId,
    parseStatus: searchParams.parseStatus,
    extension: searchParams.extension,
    visibility: searchParams.visibility,
    search: searchParams.search,
  };

  const docsQuery = useDocuments(filter);

  const nameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const kb of basesQuery.data ?? []) {
      map[kb.id] = kb.name;
    }
    return map;
  }, [basesQuery.data]);

  function patchSearch(patch: Partial<DocumentsSearch>) {
    void navigate({
      search: (prev) => {
        const next = { ...(prev as DocumentsSearch), ...patch };
        for (const key of Object.keys(next) as (keyof DocumentsSearch)[]) {
          if (
            next[key] === undefined ||
            next[key] === "" ||
            next[key] === "all"
          ) {
            delete next[key];
          }
        }
        return next;
      },
    });
  }

  if (docsQuery.isLoading || basesQuery.isLoading) {
    return <MockLoading />;
  }
  if (docsQuery.isError) {
    return <EmptyState description="无法获取文档列表" title="加载失败" />;
  }

  return (
    <div className="space-y-4">
      <PageHeader description="从全局视角管理全部知识库文档" title="文档中心">
        <Button asChild>
          <Link search={{ knowledgeBaseId: undefined }} to="/uploads">
            <Upload className="mr-1.5 h-4 w-4" />
            上传文件
          </Link>
        </Button>
      </PageHeader>

      <FilterBar>
        <SearchInput
          className="w-56"
          onChange={(value) => patchSearch({ search: value || undefined })}
          placeholder="全局搜索文档"
          value={searchParams.search ?? ""}
        />
        <Select
          onValueChange={(v) =>
            patchSearch({ knowledgeBaseId: v === "all" ? undefined : v })
          }
          value={searchParams.knowledgeBaseId ?? "all"}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="知识库" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部知识库</SelectItem>
            {(basesQuery.data ?? []).map((kb) => (
              <SelectItem key={kb.id} value={kb.id}>
                {kb.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(v) =>
            patchSearch({ extension: v === "all" ? undefined : v })
          }
          value={searchParams.extension ?? "all"}
        >
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
        <Select
          onValueChange={(v) =>
            patchSearch({
              parseStatus: v === "all" ? undefined : (v as ParseStatus),
            })
          }
          value={searchParams.parseStatus ?? "all"}
        >
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
      </FilterBar>

      <DocumentTable
        documents={docsQuery.data ?? []}
        knowledgeBaseNameById={nameById}
        showKnowledgeBase
      />
    </div>
  );
}
