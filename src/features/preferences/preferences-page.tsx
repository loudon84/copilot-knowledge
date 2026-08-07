import { toast } from "sonner";
import { setTheme } from "@/actions/theme";
import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  type AvatarDisplayMode,
  usePreferenceStore,
} from "@/stores/preference-store";
import type { ThemeMode } from "@/types/theme-mode";

export function PreferencesPage() {
  const theme = usePreferenceStore((s) => s.theme);
  const language = usePreferenceStore((s) => s.language);
  const mockDelayMs = usePreferenceStore((s) => s.mockDelayMs);
  const showCitationPanel = usePreferenceStore((s) => s.showCitationPanel);
  const avatarDisplay = usePreferenceStore((s) => s.avatarDisplay);
  const setThemePref = usePreferenceStore((s) => s.setTheme);
  const setLanguage = usePreferenceStore((s) => s.setLanguage);
  const setMockDelayMs = usePreferenceStore((s) => s.setMockDelayMs);
  const setShowCitationPanel = usePreferenceStore(
    (s) => s.setShowCitationPanel
  );
  const setAvatarDisplay = usePreferenceStore((s) => s.setAvatarDisplay);

  async function handleThemeChange(value: ThemeMode) {
    setThemePref(value);
    try {
      await setTheme(value);
      toast.success("主题已更新");
    } catch {
      toast.error("主题同步失败");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        description="本地主题、语言与 Demo 行为偏好"
        title="外观设置"
      />

      <Card className="max-w-xl shadow-none">
        <CardHeader>
          <CardTitle className="text-base">偏好配置</CardTitle>
          <CardDescription>修改后立即保存到本机</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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
            <Label htmlFor="mock-delay">Mock 延迟（毫秒，0–2000）</Label>
            <Input
              id="mock-delay"
              max={2000}
              min={0}
              onChange={(e) => setMockDelayMs(Number(e.target.value))}
              type="number"
              value={mockDelayMs}
            />
          </div>

          <div className="space-y-2">
            <Label>头像显示</Label>
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

          <div className="flex items-center justify-between">
            <Label htmlFor="show-citations-pref">显示问答引用面板</Label>
            <Switch
              checked={showCitationPanel}
              id="show-citations-pref"
              onCheckedChange={setShowCitationPanel}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
