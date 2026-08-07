import {
  Database,
  FileText,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Upload,
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    name: "用户",
    email: "user@knowledge.local",
    avatar: "",
  },
  navGroups: [
    {
      title: "主导航",
      items: [
        { title: "知识工作台", url: "/home", icon: LayoutDashboard },
        { title: "知识库", url: "/knowledge-bases", icon: Database },
        { title: "知识集", url: "/knowledge-sets", icon: Layers },
        { title: "文档中心", url: "/documents", icon: FileText },
        { title: "上传任务", url: "/uploads", icon: Upload },
        { title: "知识问答", url: "/chat", icon: MessageSquare },
      ],
    },
  ],
};

export const routeTitles: Record<string, string> = {
  "/home": "知识工作台",
  "/knowledge-bases": "知识库",
  "/knowledge-sets": "知识集",
  "/documents": "文档中心",
  "/uploads": "上传任务",
  "/chat": "知识问答",
  "/profile": "用户中心",
  "/preferences": "外观设置",
};

export function getPageTitle(pathname: string): string {
  if (routeTitles[pathname]) {
    return routeTitles[pathname];
  }
  if (pathname.startsWith("/knowledge-bases/")) {
    return "知识库详情";
  }
  if (pathname.startsWith("/knowledge-sets/")) {
    return "知识集详情";
  }
  if (pathname.startsWith("/documents/")) {
    return "文档详情";
  }
  if (pathname.startsWith("/chat/")) {
    return "知识会话";
  }
  return "Copilot Knowledge";
}
