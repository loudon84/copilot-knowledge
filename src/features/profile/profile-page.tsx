import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAuthEndpointConfig } from "@/actions/auth";
import { setTheme } from "@/actions/theme";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useKnowledgeSets } from "@/features/knowledge-sets/api/use-knowledge-sets";
import { useAuth } from "@/modules/auth/KnowledgeAuthProvider";
import { knowledgeService } from "@/services/knowledge/knowledge-service";
import {
  type AvatarDisplayMode,
  usePreferenceStore,
} from "@/stores/preference-store";
import type { ThemeMode } from "@/types/theme-mode";

const APP_VERSION = "0.1.0";

export function ProfilePage() {
  const { authState } = useAuth();
  const user = authState.user;
  const org = authState.organization;
  const [endpoint, setEndpoint] = useState("—");
  const [resetOpen, setResetOpen] = useState(false);
  const setsQuery = useKnowledgeSets();

  const avatarDisplay = usePreferenceStore((s) => s.avatarDisplay);
  const language = usePreferenceStore((s) => s.language);
  const theme = usePreferenceStore((s) => s.theme);
  const defaultKnowledgeSetId = usePreferenceStore(
    (s) => s.defaultKnowledgeSetId
  );
  const showCitationPanel = usePreferenceStore((s) => s.showCitationPanel);
  const setAvatarDisplay = usePreferenceStore((s) => s.setAvatarDisplay);
  const setLanguage = usePreferenceStore((s) => s.setLanguage);
  const setThemePref = usePreferenceStore((s) => s.setTheme);
  const setDefaultKnowledgeSetId = usePreferenceStore(
    (s) => s.setDefaultKnowledgeSetId
  );
  const setShowCitationPanel = usePreferenceStore(
    (s) => s.setShowCitationPanel
  );

  useEffect(() => {
    getAuthEndpointConfig()
      .then((cfg) => {
        setEndpoint(`${cfg.authBackendUrl}${cfg.authPrefix}`);
      })
      .catch(() => setEndpoint("无法读取"));
  }, []);

  async function handleThemeChange(value: ThemeMode) {
    setThemePref(value);
    try {
      await setTheme(value);
      toast.success("主题已更新");
    } catch {
      toast.error("主题同步失败");
    }
  }

  async function handleResetDemo() {
    try {
      await knowledgeService.resetDemoData();
      toast.success("Demo 数据已恢复默认");
      setResetOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "重置失败");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader description="账号信息与本地偏好" title="用户中心" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">账号信息</CardTitle>
            <CardDescription>来自 nodeskclaw 真实登录会话</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="显示名称" value={user?.displayName ?? "—"} />
            <Field label="邮箱" value={user?.email ?? "—"} />
            <Field label="手机" value={user?.phone ?? "—"} />
            <Field label="用户 ID" value={user?.id ?? "—"} />
            <Field
              label="当前组织"
              value={org?.name ?? user?.currentOrgId ?? "—"}
            />
            <Field label="组织角色" value={user?.orgRole ?? "—"} />
            <Field label="是否超管" value={user?.isSuperAdmin ? "是" : "否"} />
            <Field label="登录服务地址" value={endpoint} />
            <Field label="客户端版本" value={APP_VERSION} />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">本地偏好</CardTitle>
            <CardDescription>仅保存在本机，不回写认证服务</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>头像显示方式</Label>
              <Select
                onValueChange={(v) => setAvatarDisplay(v as AvatarDisplayMode)}
                value={avatarDisplay}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initials">首字母</SelectItem>
                  <SelectItem value="image">头像图片</SelectItem>
                  <SelectItem value="hidden">隐藏</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>语言</Label>
              <Select onValueChange={setLanguage} value={language}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">简体中文</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>主题</Label>
              <Select
                onValueChange={(v) => void handleThemeChange(v as ThemeMode)}
                value={theme}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">跟随系统</SelectItem>
                  <SelectItem value="light">浅色</SelectItem>
                  <SelectItem value="dark">深色</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>默认知识集</Label>
              <Select
                onValueChange={(v) =>
                  setDefaultKnowledgeSetId(v === "none" ? undefined : v)
                }
                value={defaultKnowledgeSetId ?? "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="未设置" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未设置</SelectItem>
                  {(setsQuery.data ?? []).map((ks) => (
                    <SelectItem key={ks.id} value={ks.id}>
                      {ks.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="citation-panel">显示引用面板</Label>
              <Switch
                checked={showCitationPanel}
                id="citation-panel"
                onCheckedChange={setShowCitationPanel}
              />
            </div>
            <Button onClick={() => setResetOpen(true)} variant="destructive">
              恢复默认 Demo 数据
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        confirmLabel="确认重置"
        description="将重置知识库、知识集、文档、上传任务与问答会话的本地 Mock 数据，且不可撤销。"
        onConfirm={() => void handleResetDemo()}
        onOpenChange={setResetOpen}
        open={resetOpen}
        title="恢复默认 Demo 数据"
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="break-all font-medium">{value}</p>
    </div>
  );
}
