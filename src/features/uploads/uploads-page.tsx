import { useSearch } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/empty-state";
import { FilterBar } from "@/components/common/filter-bar";
import { MockLoading } from "@/components/common/mock-loading";
import { PageHeader } from "@/components/common/page-header";
import { UploadStatusBadge } from "@/components/knowledge/upload-status-badge";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKnowledgeBases } from "@/features/knowledge-bases/api/use-knowledge-bases";
import {
  useCreateUploadJobs,
  useUploadJobs,
} from "@/features/uploads/api/use-upload-jobs";
import { useUploadJobStore } from "@/stores/upload-job-store";
import type { MockUploadFile } from "@/types/knowledge-document";

const SAMPLE_FILES = [
  {
    name: "产品手册.pdf",
    extension: "pdf",
    mimeType: "application/pdf",
    size: 1_240_000,
  },
  {
    name: "采购制度.docx",
    extension: "docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 256_000,
  },
  {
    name: "合同模板.xlsx",
    extension: "xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 180_000,
  },
  {
    name: "失败案例-fail.pdf",
    extension: "pdf",
    mimeType: "application/pdf",
    size: 96_000,
  },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadsPage() {
  const search = useSearch({ strict: false }) as {
    knowledgeBaseId?: string;
  };
  const { data: queryJobs, isLoading, isError } = useUploadJobs();
  const storeJobs = useUploadJobStore((s) => s.jobs);
  const cancel = useUploadJobStore((s) => s.cancel);
  const retry = useUploadJobStore((s) => s.retry);
  const clearCompleted = useUploadJobStore((s) => s.clearCompleted);
  const createMutation = useCreateUploadJobs();
  const basesQuery = useKnowledgeBases();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [kbId, setKbId] = useState(search.knowledgeBaseId ?? "");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [customName, setCustomName] = useState("");

  const jobs = useMemo(() => {
    // Prefer live store for progress; fall back to query.
    return storeJobs.length ? storeJobs : (queryJobs ?? []);
  }, [storeJobs, queryJobs]);

  const nameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const kb of basesQuery.data ?? []) {
      map[kb.id] = kb.name;
    }
    return map;
  }, [basesQuery.data]);

  async function submitUpload() {
    if (!kbId) {
      toast.error("请选择知识库");
      return;
    }
    const files: MockUploadFile[] = [];
    for (const sample of SAMPLE_FILES) {
      if (selectedNames.includes(sample.name)) {
        files.push({ ...sample, knowledgeBaseId: kbId });
      }
    }
    if (customName.trim()) {
      const ext = customName.includes(".")
        ? customName.split(".").pop()!.toLowerCase()
        : "txt";
      files.push({
        name: customName.trim(),
        extension: ext,
        mimeType: "application/octet-stream",
        size: 64_000,
        knowledgeBaseId: kbId,
      });
    }
    if (files.length === 0) {
      toast.error("请至少选择一个文件");
      return;
    }
    try {
      await createMutation.mutateAsync(files);
      toast.success(`已提交 ${files.length} 个上传任务`);
      setWizardOpen(false);
      setSelectedNames([]);
      setCustomName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "提交失败");
    }
  }

  if (isLoading && jobs.length === 0) {
    return <MockLoading />;
  }
  if (isError && jobs.length === 0) {
    return <EmptyState description="无法获取上传任务" title="加载失败" />;
  }

  return (
    <div className="space-y-4">
      <PageHeader description="模拟文件上传、解析和索引任务" title="上传任务">
        <div className="flex gap-2">
          <Button onClick={() => clearCompleted()} variant="outline">
            <Trash2 className="mr-1.5 h-4 w-4" />
            清除已完成
          </Button>
          <Button
            onClick={() => {
              setKbId(search.knowledgeBaseId ?? basesQuery.data?.[0]?.id ?? "");
              setWizardOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            新建上传
          </Button>
        </div>
      </PageHeader>

      {jobs.length === 0 ? (
        <EmptyState description="点击「新建上传」开始" title="暂无上传任务" />
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div className="space-y-2 rounded-md border px-3 py-3" key={job.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{job.fileName}</p>
                  <p className="text-muted-foreground text-xs">
                    {nameById[job.knowledgeBaseId] ?? job.knowledgeBaseId} ·{" "}
                    {formatSize(job.size)} ·{" "}
                    {new Date(job.updatedAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <UploadStatusBadge status={job.status} />
                  {(job.status === "waiting" ||
                    job.status === "uploading" ||
                    job.status === "parsing") && (
                    <Button
                      onClick={() => cancel(job.id)}
                      size="sm"
                      variant="ghost"
                    >
                      取消
                    </Button>
                  )}
                  {(job.status === "failed" || job.status === "cancelled") && (
                    <Button
                      onClick={() => retry(job.id)}
                      size="sm"
                      variant="outline"
                    >
                      重试
                    </Button>
                  )}
                </div>
              </div>
              {(job.status === "uploading" || job.status === "parsing") && (
                <Progress className="h-1.5" value={job.progress} />
              )}
              {job.errorMessage && (
                <p className="text-destructive text-xs">{job.errorMessage}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog onOpenChange={setWizardOpen} open={wizardOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>上传向导</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>选择知识库</Label>
              <Select onValueChange={setKbId} value={kbId}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择知识库" />
                </SelectTrigger>
                <SelectContent>
                  {(basesQuery.data ?? []).map((kb) => (
                    <SelectItem key={kb.id} value={kb.id}>
                      {kb.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>选择模拟文件</Label>
              <FilterBar className="flex-col items-stretch">
                {SAMPLE_FILES.map((file) => {
                  const checked = selectedNames.includes(file.name);
                  return (
                    <Button
                      className="justify-start"
                      key={file.name}
                      onClick={() =>
                        setSelectedNames((prev) =>
                          checked
                            ? prev.filter((n) => n !== file.name)
                            : [...prev, file.name]
                        )
                      }
                      type="button"
                      variant={checked ? "secondary" : "outline"}
                    >
                      {file.name}（{formatSize(file.size)}）
                    </Button>
                  );
                })}
              </FilterBar>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-file">或输入自定义文件名</Label>
              <Input
                id="custom-file"
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="例如：制度说明.md 或 demo-fail.pdf"
                value={customName}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setWizardOpen(false)} variant="outline">
              取消
            </Button>
            <Button disabled={createMutation.isPending} onClick={submitUpload}>
              提交上传
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
